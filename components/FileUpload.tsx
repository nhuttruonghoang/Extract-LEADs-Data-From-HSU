
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { FileIcon } from './icons/FileIcon';
import { CameraIcon } from './icons/CameraIcon';
import { CameraCapture } from './CameraCapture';

interface FileUploadProps {
  files: File[] | null;
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
  onProcess: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles, onProcess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleCapture = (file: File) => {
    setFiles([file]);
    setShowCamera(false);
  };

  return (
    <>
      {showCamera && <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />}
      <div className="flex flex-col items-center">
          {!files || files.length === 0 ? (
            <>
              <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  className={`w-full p-10 border-2 border-dashed rounded-xl transition-colors ${isDragging ? 'border-blue-400 bg-gray-700' : 'border-gray-600 hover:border-gray-500'}`}
              >
                  <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      multiple
                      accept="image/png, image/jpeg, application/pdf"
                      onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer text-gray-400">
                      <UploadIcon className="w-12 h-12 mb-3" />
                      <span className="font-semibold text-lg text-gray-300">Drag & drop files or click to upload</span>
                      <span className="text-sm">PNG, JPG, or PDF</span>
                  </label>
              </div>
              <div className="flex items-center my-4 w-full">
                <hr className="flex-grow border-t border-gray-600"/>
                <span className="px-4 text-gray-400">OR</span>
                <hr className="flex-grow border-t border-gray-600"/>
              </div>
              <button 
                onClick={() => setShowCamera(true)}
                className="flex items-center gap-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <CameraIcon className="w-6 h-6" />
                Take Picture
              </button>
            </>
          ) : (
              <div className="w-full">
                  <h3 className="text-lg font-semibold mb-3 text-gray-300">Selected Files:</h3>
                  <ul className="space-y-2 mb-6">
                  {files.map((file, index) => (
                      <li key={index} className="flex items-center bg-gray-700 p-3 rounded-lg">
                          <FileIcon className="w-6 h-6 mr-3 text-gray-400" />
                          <span className="text-gray-200 truncate">{file.name}</span>
                          <span className="ml-auto text-gray-400 text-sm">{(file.size / 1024).toFixed(2)} KB</span>
                      </li>
                  ))}
                  </ul>
              </div>
          )}

          <div className="mt-6 flex gap-4">
              {files && files.length > 0 && (
                  <button
                      onClick={() => setFiles(null)}
                      className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                      Clear
                  </button>
              )}
              <button
                  onClick={onProcess}
                  disabled={!files || files.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-bold py-2 px-8 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                  Process Files
              </button>
          </div>
      </div>
    </>
  );
};