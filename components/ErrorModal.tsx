// FIX: Implement the full component which was previously missing.
import React from 'react';
import { ErrorIcon } from './icons/ErrorIcon';

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-red-500/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ErrorIcon className="h-8 w-8 text-red-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg leading-6 font-medium text-red-300" id="modal-title">
              Processing Error
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-300">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
