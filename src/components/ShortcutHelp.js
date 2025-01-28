import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKeyboard, faSearch, faSave, faBars, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const ShortcutHelp = ({ isOpen, onClose }) => {
  const shortcuts = [
    { 
      key: 'Strg + F', 
      description: 'Gästesuche fokussieren',
      icon: faSearch 
    },
    { 
      key: 'Strg + S', 
      description: 'Als PDF exportieren',
      icon: faSave
    },
    { 
      key: 'Strg + B', 
      description: 'Seitenleiste ein-/ausblenden',
      icon: faBars
    },
    { 
      key: 'Strg + ?', 
      description: 'Diese Hilfe anzeigen',
      icon: faQuestionCircle
    },
    { 
      key: 'Del', 
      description: 'Ausgewähltes Element löschen',
      icon: faKeyboard
    },
    { 
      key: 'Enter', 
      description: 'Eingabe bestätigen',
      icon: faKeyboard
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-base-300">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <FontAwesomeIcon icon={faKeyboard} className="mr-3 text-primary" />
              Tastenkombinationen
            </h2>
            <button 
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid gap-4 md:grid-cols-2">
            {shortcuts.map((shortcut, index) => (
              <div 
                key={index}
                className="flex items-center p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
              >
                <FontAwesomeIcon icon={shortcut.icon} className="text-primary w-6" />
                <div className="ml-4">
                  <kbd className="kbd kbd-sm">{shortcut.key}</kbd>
                  <p className="mt-1 text-sm">{shortcut.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t border-base-300 bg-base-200">
          <p className="text-sm text-base-content/70">
            Tipp: Drücken Sie <kbd className="kbd kbd-sm">Strg</kbd> + <kbd className="kbd kbd-sm">?</kbd> 
            um diese Übersicht jederzeit aufzurufen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutHelp;
