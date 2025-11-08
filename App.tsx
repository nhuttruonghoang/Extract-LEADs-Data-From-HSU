import React, { useState, useCallback } from 'react';
import { StudentData } from './types';
import { extractStudentDataFromImages } from './services/geminiService';
import { processFiles } from './utils/fileProcessor';
import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable';
import { Spinner } from './components/Spinner';
import { CSV_HEADERS } from './constants';
import { CsvIcon } from './components/icons/CsvIcon';

export default function App() {
  const [files, setFiles] = useState<File[] | null>(null);
  const [extractedData, setExtractedData] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleProcess = useCallback(async () => {
    if (!files || files.length === 0) {
      setError('Please select one or more files to process.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedData([]);

    try {
      setLoadingMessage('Processing files... This may take a moment for large PDFs.');
      const imageParts = await processFiles(files);
      
      setLoadingMessage('Extracting data with Gemini AI...');
      const data = await extractStudentDataFromImages(imageParts);
      
      const dataWithIds = data.map(item => ({...item, id: crypto.randomUUID() }));
      setExtractedData(dataWithIds);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [files]);

  const handleReset = () => {
    setFiles(null);
    setExtractedData([]);
    setError(null);
    setIsLoading(false);
  };
  
  const handleDataChange = (updatedData: StudentData[]) => {
    setExtractedData(updatedData);
  };

  const handleDownloadCsv = useCallback(() => {
    if (extractedData.length === 0) return;

    const csvRows = [
      CSV_HEADERS.join(','),
      ...extractedData.map(row => {
        const values = [
          row.ngaySinh,
          row.soDienThoai,
          row.cccd,
          row.email,
          row.diaChi,
          row.nganhDangKy,
          row.tinhThanhPho,
          row.truongThpt
        ];
        return values.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',');
      })
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'hsu_leads_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [extractedData]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            HSU Leads OCR
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Extract HSU lead information from registration forms using Gemini.
          </p>
        </header>

        <main className="bg-gray-800 shadow-2xl rounded-2xl p-6 sm:p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Spinner />
              <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <button
                onClick={handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : extractedData.length > 0 ? (
             <div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-200 mb-3 sm:mb-0">Extracted Data</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handleReset}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                            Process New File
                        </button>
                        <button 
                            onClick={handleDownloadCsv}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                            <CsvIcon className="w-5 h-5" />
                            Download CSV
                        </button>
                    </div>
                </div>
                <ResultsTable data={extractedData} setData={handleDataChange} />
             </div>
          ) : (
            <FileUpload
              files={files}
              setFiles={setFiles}
              onProcess={handleProcess}
            />
          )}
        </main>

        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Google Gemini 2.5 Flash</p>
        </footer>
      </div>
    </div>
  );
}