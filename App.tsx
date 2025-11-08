import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable';
import { Spinner } from './components/Spinner';
import { CsvIcon } from './components/icons/CsvIcon';
import { ErrorModal } from './components/ErrorModal';
import { AcademicResultsForm } from './components/AcademicResultsForm';
import { SuccessModal } from './components/SuccessModal';
import { ArrowRightIcon } from './components/icons/ArrowRightIcon';

import { processFiles } from './utils/fileProcessor';
import { extractStudentDataFromImages } from './services/geminiService';
import { StudentData } from './types';
import { CSV_HEADERS } from './constants';

function App() {
  const [files, setFiles] = useState<File[] | null>(null);
  const [studentData, setStudentData] = useState<StudentData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedSql, setGeneratedSql] = useState<string | null>(null);

  const handleProcessFiles = async () => {
    if (!files) return;

    setIsLoading(true);
    setError(null);
    setStudentData(null);

    try {
      const imageParts = await processFiles(files);
      if (imageParts.length === 0) {
        throw new Error("No processable images or PDF pages found in the selected files.");
      }
      const extractedData = await extractStudentDataFromImages(imageParts);
      const dataWithIds = extractedData.map(d => ({ ...d, id: uuidv4() }));
      setStudentData(dataWithIds);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToCsv = () => {
    if (!studentData) return;

    const csvContent = [
      CSV_HEADERS.join(','),
      ...studentData.map(row => 
        [
          `"${row.fullName}"`,
          `"${row.dateOfBirth}"`,
          `"${row.phoneNumber}"`,
          `"${row.idCardNumber}"`,
          `"${row.email}"`,
          `"${row.address}"`,
          `"${row.major}"`,
          `"${row.highSchoolProvince}"`,
          `"${row.highSchoolName}"`,
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "student_data.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setFiles(null);
    setStudentData(null);
    setError(null);
    setIsLoading(false);
    setCurrentStep(1);
    setShowSuccessModal(false);
    setGeneratedSql(null);
  };
  
  const renderStepOne = () => (
    <>
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
          Student Application OCR - Step 1/2
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Upload the application form to automatically extract student details.
        </p>
      </header>

      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
        {!studentData && !isLoading && (
          <FileUpload files={files} setFiles={setFiles} onProcess={handleProcessFiles} />
        )}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64">
            <Spinner />
            <p className="mt-4 text-gray-400">Analyzing document... this may take a moment.</p>
          </div>
        )}

        {studentData && !isLoading && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-200">Extracted Student Information</h2>
              <div className="flex flex-wrap gap-4 justify-center">
                  <button
                  onClick={handleReset}
                  className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={handleExportToCsv}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  <CsvIcon className="w-5 h-5" />
                  Export CSV
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Next
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <ResultsTable data={studentData} setData={setStudentData} />
          </div>
        )}
      </div>
    </>
  );

  const handleSubmissionSuccess = (sql: string) => {
    setGeneratedSql(sql);
    setShowSuccessModal(true);
  };

  const renderStepTwo = () => (
    <>
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
          Academic Results - Step 2/2
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Please fill in the academic details for the student.
        </p>
      </header>

      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
        <AcademicResultsForm 
          onBack={() => setCurrentStep(1)}
          initialData={studentData}
          onSubmitSuccess={handleSubmissionSuccess}
          onError={(message) => setError(message)}
        />
      </div>
    </>
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 ? renderStepOne() : renderStepTwo()}
        </div>
      </main>
      <ErrorModal message={error || ''} onClose={() => setError(null)} />
      <SuccessModal 
        show={showSuccessModal}
        title="Submission Processed"
        message="The application data has been converted to the SQL script below. Your backend developer can use this script to save the data securely to the database."
        sqlScript={generatedSql}
        onClose={handleReset}
      />
    </div>
  );
}

export default App;