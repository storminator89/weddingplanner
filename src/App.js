import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faPlusCircle, faRandom, faFilePdf, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import './index.css';
import {
  addGuest,
  addNewTable,
  handleGuestKeyDown,
  handleTableKeyDown,
  assignRemainingGuests,
  exportPDF,
  handleConfirmAddGuest,
  handleCancelDrop,
  onDragEnd
} from './helpers';
import GuestList from './GuestList';
import TableList from './TableList';
import WarningPopup from './WarningPopup';
import ProgressBar from './ProgressBar';

const WeddingSeatingPlanner = () => {
  const [guests, setGuests] = useState([]);
  const [tables, setTables] = useState([
    { id: 'table1', name: 'Tisch 1', guests: [], seats: 8 },
    { id: 'table2', name: 'Tisch 2', guests: [], seats: 8 },
  ]);
  const [newGuest, setNewGuest] = useState('');
  const [compatibility, setCompatibility] = useState({});
  const [newTableName, setNewTableName] = useState('');
  const [newTableSeats, setNewTableSeats] = useState(8);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [pendingGuest, setPendingGuest] = useState(null);
  const [pendingTable, setPendingTable] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalGuests = guests.length + tables.reduce((sum, table) => sum + table.guests.length, 0);
    const seatedGuests = tables.reduce((sum, table) => sum + table.guests.length, 0);
    setProgress(totalGuests > 0 ? (seatedGuests / totalGuests) * 100 : 0);
  }, [guests, tables]);

  const handleDragEnd = (result) => {
    onDragEnd(result, guests, setGuests, tables, setTables, compatibility, setShowWarning, setWarningMessage, setPendingGuest, setPendingTable);
  };

  const handleCancel = () => {
    handleCancelDrop(setShowWarning, setWarningMessage, setPendingGuest, setPendingTable);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} transition-colors duration-300`}>
        <div className="container mx-auto p-4">
          <header className={`bg-blue-600 text-white p-6 rounded-t-lg shadow-lg ${isDarkMode ? 'bg-opacity-80' : ''}`}>
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold">Eleganter Tischplaner</h1>
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-blue-700 transition-colors duration-300">
                <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
              </button>
            </div>
          </header>
          <main className={`bg-white shadow-2xl rounded-b-lg overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <div className="p-6">
              <ProgressBar progress={progress} />
              <div className="mb-8 space-y-4">
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="flex-1 flex">
                    <input
                      className={`flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      type="text"
                      value={newGuest}
                      onChange={(e) => setNewGuest(e.target.value)}
                      onKeyDown={(e) => handleGuestKeyDown(e, newGuest, guests, setGuests, setCompatibility, setNewGuest)}
                      placeholder="Neuen Gast hinzufügen"
                    />
                    <button 
                      className="bg-blue-500 text-white p-3 rounded-r-lg hover:bg-blue-600 transition duration-300"
                      onClick={() => addGuest(newGuest, guests, setGuests, setNewGuest, setCompatibility)}
                    >
                      <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                      Hinzufügen
                    </button>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <input
                    className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    onKeyDown={(e) => handleTableKeyDown(e, newTableName, newTableSeats, tables, setTables, setNewTableName, setNewTableSeats)}
                    placeholder="Neuer Tischname"
                  />
                  <input
                    className={`w-24 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    type="number"
                    value={newTableSeats}
                    onChange={(e) => setNewTableSeats(parseInt(e.target.value))}
                    min="1"
                    placeholder="Sitzplätze"
                  />
                  <button 
                    className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition duration-300 flex-shrink-0"
                    onClick={() => addNewTable(newTableName, newTableSeats, tables, setTables, setNewTableName, setNewTableSeats)}
                  >
                    <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                    Tisch erstellen
                  </button>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
                <GuestList 
                  guests={guests} 
                  setGuests={setGuests} 
                  compatibility={compatibility} 
                  setCompatibility={setCompatibility}
                  isDarkMode={isDarkMode}
                />
                <TableList 
                  tables={tables} 
                  setTables={setTables} 
                  guests={guests} 
                  setGuests={setGuests} 
                  compatibility={compatibility} 
                  setShowWarning={setShowWarning} 
                  setWarningMessage={setWarningMessage} 
                  setPendingGuest={setPendingGuest} 
                  setPendingTable={setPendingTable}
                  isDarkMode={isDarkMode}
                />
              </div>
              {showWarning && (
                <WarningPopup 
                  message={warningMessage} 
                  handleConfirm={() => handleConfirmAddGuest(pendingTable, pendingGuest, tables, setTables, setGuests, setShowWarning, setPendingGuest, setPendingTable)}
                  handleCancel={handleCancel}
                  isDarkMode={isDarkMode}
                />
              )}
              <div className="mt-8 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                <button 
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition duration-300 flex items-center justify-center"
                  onClick={() => assignRemainingGuests(guests, setGuests, tables, setTables, setShowWarning, setWarningMessage, compatibility)}
                >
                  <FontAwesomeIcon icon={faRandom} className="mr-2" />
                  Automatisch zuordnen
                </button>
                <button 
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-300 flex items-center justify-center"
                  onClick={() => exportPDF(tables, compatibility)}
                >
                  <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                  Als PDF exportieren
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </DragDropContext>
  );
};

export default WeddingSeatingPlanner;
