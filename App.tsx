import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable';
import { Spinner } from './components/Spinner';
import { CsvIcon } from './components/icons/CsvIcon';
import { ErrorModal } from './components/ErrorModal';
import { AcademicResultsForm } from './components/AcademicResultsForm';
import { ArrowRightIcon } from './components/icons/ArrowRightIcon';

import { processFiles } from './utils/fileProcessor';
import { extractStudentDataFromImages } from './services/geminiService';
import { fetchDropdownData } from './services/dataService';
import { StudentData, DropdownData } from './types';
import { CSV_HEADERS } from './constants';

function App() {
  const [files, setFiles] = useState<File[] | null>(null);
  const [studentData, setStudentData] = useState<StudentData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownData, setDropdownData] = useState<DropdownData>({ majors: [], provinces: [], highSchools: [] });
  const [step, setStep] = useState(1);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const data = await fetchDropdownData();
        setDropdownData(data);
      } catch (e) {
        console.error("Failed to fetch dropdown data:", e);
        setError("Could not load initial application data. Please refresh the page.");
      }
    };
    loadDropdownData();
  }, []);

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
          `"${row.ngaySinh}"`,
          `"${row.soDienThoai}"`,
          `"${row.cccd}"`,
          `"${row.email}"`,
          `"${row.diaChi}"`,
          `"${row.nganhDangKy}"`,
          `"${row.tinhThanhPho}"`,
          `"${row.truongThpt}"`,
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
    setStep(1);
  };

  const handleNextStep = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };
  
  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
              Student Registration OCR
            </h1>
            <p className="mt-2 text-lg text-gray-400">
              {step === 1 
                ? "Automatically extract student information from registration forms."
                : "Enter student academic results."
              }
            </p>
          </header>

          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
            {step === 1 && (
              <>
                {!studentData && !isLoading && (
                  <FileUpload files={files} setFiles={setFiles} onProcess={handleProcessFiles} />
                )}
                
                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Spinner />
                    <p className="mt-4 text-gray-400">Analyzing documents... this may take a moment.</p>
                  </div>
                )}

                {studentData && !isLoading && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-200">Extracted Data</h2>
                      <div className="flex gap-4">
                         <button
                          onClick={handleReset}
                          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                          Process New Files
                        </button>
                        <button
                          onClick={handleExportToCsv}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          <CsvIcon className="w-5 h-5" />
                          Export CSV
                        </button>
                         <button
                          onClick={handleNextStep}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          Next
                          <ArrowRightIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <ResultsTable data={studentData} setData={setStudentData} dropdownData={dropdownData} />
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <AcademicResultsForm onBack={handleBack} initialData={studentData} />
            )}
          </div>
        </div>
      </main>
      <ErrorModal message={error || ''} onClose={() => setError(null)} />
    </div>
  );
}

export default App;