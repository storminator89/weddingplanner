import React from 'react';

const WarningPopup = ({ message, handleConfirm, handleCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 overflow-hidden">
        <div className="bg-yellow-500 text-white p-4">
          <h3 className="text-2xl font-bold">Achtung</h3>
        </div>
        <div className="p-6">
          <p className="mb-6 text-gray-700">{message}</p>
          <div className="flex justify-end space-x-4">
            <button 
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-300"
              onClick={handleCancel}
            >
              Abbrechen
            </button>
            <button 
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition duration-300"
              onClick={handleConfirm}
            >
              Bestätigen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningPopup;
