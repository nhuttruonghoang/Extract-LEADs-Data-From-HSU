import React from 'react';
import { SuccessIcon } from './icons/SuccessIcon';

interface SuccessModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
  sqlScript?: string | null;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ show, onClose, title, message, sqlScript }) => {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 border border-green-500/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <SuccessIcon className="h-8 w-8 text-green-400" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg leading-6 font-medium text-green-300" id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-300">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        {sqlScript && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Generated SQL Script:</label>
            <pre className="bg-gray-900/75 text-white p-3 rounded-md text-xs max-h-60 overflow-auto">
              <code>
                {sqlScript}
              </code>
            </pre>
          </div>
        )}

        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};