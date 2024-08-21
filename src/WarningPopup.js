// WarningPopup.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const WarningPopup = ({ message, handleConfirm, handleCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="modal-box">
        <div className="flex items-center mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning text-3xl mr-3" />
          <h3 className="font-bold text-lg">Achtung</h3>
        </div>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <button 
            className="btn btn-outline"
            onClick={handleCancel}
          >
            Abbrechen
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleConfirm}
          >
            Bestätigen
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningPopup;