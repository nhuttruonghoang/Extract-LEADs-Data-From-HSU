// FIX: Implement the full component which was previously missing.
import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable';
import { Spinner } from './components/Spinner';
import { ErrorModal } from './components/ErrorModal';
import { CsvIcon } from './components/icons/CsvIcon';
import { processFiles } from './utils/fileProcessor';
import { extractStudentDataFromImages } from './services/geminiService';
import { StudentData } from './types';
import { CSV_HEADERS } from './constants';

function App() {
  const [files, setFiles] = useState<File[] | null>(null);
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessFiles = async () => {
    if (!files) return;

    setIsLoading(true);
    setStudentData([]);
    setError(null);

    try {
      const imageParts = await processFiles(files);
      const extractedData = await extractStudentDataFromImages(imageParts);
      const dataWithIds = extractedData.map(student => ({
        ...student,
        id: crypto.randomUUID(),
      }));
      setStudentData(dataWithIds);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    const csvContent = [
      CSV_HEADERS.join(','),
      ...studentData.map(row => 
        [
          row.ngaySinh,
          row.soDienThoai,
          row.cccd,
          row.email,
          row.diaChi,
          row.nganhDangKy,
          row.tinhThanhPho,
          row.truongThpt
        ].map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const resetState = () => {
    setFiles(null);
    setStudentData([]);
    setIsLoading(false);
    setError(null);
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
            Student Form OCR Extractor
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
            Upload student registration forms (images or PDFs) to automatically extract information into an editable table.
          </p>
        </header>

        {studentData.length === 0 && !isLoading && (
           <div className="max-w-3xl mx-auto bg-gray-800/50 p-8 rounded-2xl shadow-lg border border-gray-700">
              <FileUpload files={files} setFiles={setFiles} onProcess={handleProcessFiles} />
           </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center my-10">
            <Spinner />
            <p className="mt-4 text-lg text-gray-300 animate-pulse">Processing documents... this may take a moment.</p>
          </div>
        )}

        {studentData.length > 0 && !isLoading && (
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-200 mb-4 sm:mb-0">Extracted Data</h2>
              <div className="flex gap-4">
                 <button
                    onClick={resetState}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Process New Files
                </button>
                <button 
                  onClick={handleExportCsv}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105"
                >
                  <CsvIcon className="w-5 h-5" />
                  Export CSV
                </button>
              </div>
            </div>
            <ResultsTable data={studentData} setData={setStudentData} />
          </div>
        )}

        <ErrorModal message={error!} onClose={() => setError(null)} />
      </main>
      <footer className="text-center py-6 text-sm text-gray-500">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
}

export default App;
