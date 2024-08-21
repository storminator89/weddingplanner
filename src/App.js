// App.js
import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faPlusCircle, faRandom, faFilePdf, faSun, faMoon, faBars, faChair } from '@fortawesome/free-solid-svg-icons';
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
import Dashboard from './Dashboard';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('planner');

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
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`} data-theme={isDarkMode ? 'dark' : 'light'}>
        <div className="drawer drawer-mobile">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" checked={sidebarOpen} onChange={() => setSidebarOpen(!sidebarOpen)} />
          <div className="drawer-content flex flex-col">
            {/* Navbar */}
            <nav className="navbar bg-primary text-primary-content sticky top-0 z-50">
              <div className="flex-1">
                <button className="btn btn-ghost normal-case text-xl" onClick={() => setSidebarOpen(!sidebarOpen)}>
                  <FontAwesomeIcon icon={faBars} className="mr-2" />
                  Eleganter Tischplaner
                </button>
              </div>
              <div className="flex-none">
                <button onClick={toggleDarkMode} className="btn btn-circle btn-ghost">
                  <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} size="lg" />
                </button>
              </div>
            </nav>

            {/* Main content */}
            <main className="flex-1 p-6 bg-base-100">
              {currentView === 'dashboard' ? (
                <Dashboard guests={guests} tables={tables} compatibility={compatibility} />
              ) : (
                <div className="container mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="card bg-base-100 shadow-xl overflow-hidden">
                      <h2 className="text-2xl font-bold p-4 bg-primary text-white">Gäste hinzufügen</h2>
                      <div className="card-body">
                        <div className="flex space-x-2">
                          <input
                            className="input input-bordered flex-grow bg-white dark:bg-gray-700 border-primary focus:border-primary focus:ring-2 focus:ring-primary"
                            type="text"
                            value={newGuest}
                            onChange={(e) => setNewGuest(e.target.value)}
                            onKeyDown={(e) => handleGuestKeyDown(e, newGuest, guests, setGuests, setCompatibility, setNewGuest)}
                            placeholder="Neuen Gast hinzufügen"
                          />
                          <button 
                            className="btn btn-primary"
                            onClick={() => addGuest(newGuest, guests, setGuests, setNewGuest, setCompatibility)}
                          >
                            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                            Hinzufügen
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl overflow-hidden">
                      <h2 className="text-2xl font-bold p-4 bg-primary text-white">Neuen Tisch erstellen</h2>
                      <div className="card-body">
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <input
                            className="input input-bordered flex-grow bg-white dark:bg-gray-700 border-primary focus:border-primary focus:ring-2 focus:ring-primary"
                            type="text"
                            value={newTableName}
                            onChange={(e) => setNewTableName(e.target.value)}
                            onKeyDown={(e) => handleTableKeyDown(e, newTableName, newTableSeats, tables, setTables, setNewTableName, setNewTableSeats)}
                            placeholder="Neuer Tischname"
                          />
                          <div className="flex items-center bg-white dark:bg-gray-700 border border-primary rounded-md px-2 w-24">
                            <FontAwesomeIcon icon={faChair} className="text-primary mr-2" />
                            <input
                              className="input input-bordered w-12 bg-transparent border-0 focus:ring-0 p-0 text-center"
                              type="number"
                              value={newTableSeats}
                              onChange={(e) => setNewTableSeats(parseInt(e.target.value))}
                              min="1"
                              max="99"
                              placeholder="Plätze"
                            />
                          </div>
                          <button 
                            className="btn btn-primary text-white"
                            onClick={() => addNewTable(newTableName, newTableSeats, tables, setTables, setNewTableName, setNewTableSeats)}
                          >
                            <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                            Tisch erstellen
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8 mb-8">
                    <GuestList 
                      guests={guests} 
                      setGuests={setGuests} 
                      compatibility={compatibility} 
                      setCompatibility={setCompatibility}
                      isDarkMode={isDarkMode}
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="card bg-base-100 shadow-xl overflow-hidden">
                        <h2 className="text-2xl font-bold p-4 bg-primary text-white">Aktionen</h2>
                        <div className="card-body">
                          <div className="flex flex-col space-y-4">
                            <button 
                              className="btn btn-accent btn-block"
                              onClick={() => assignRemainingGuests(guests, setGuests, tables, setTables, setShowWarning, setWarningMessage, compatibility)}
                            >
                              <FontAwesomeIcon icon={faRandom} className="mr-2" />
                              Automatisch zuordnen
                            </button>
                            <button 
                              className="btn btn-info btn-block"
                              onClick={() => exportPDF(tables, compatibility)}
                            >
                              <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                              Als PDF exportieren
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

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

                  <div className="mt-8">
                    <ProgressBar progress={progress} />
                  </div>
                </div>
              )}
            </main>
          </div>

          {/* Sidebar */}
          <div className="drawer-side">
            <label htmlFor="my-drawer" className="drawer-overlay"></label> 
            <ul className="menu p-4 w-80 bg-base-100 text-base-content">
              <li><a className="text-xl font-bold mb-4">Tischplaner</a></li>
              <li><a onClick={() => { setCurrentView('dashboard'); setSidebarOpen(false); }}>Dashboard</a></li>
              <li><a onClick={() => { setCurrentView('planner'); setSidebarOpen(false); }}>Planer</a></li>
            </ul>
          </div>
        </div>

        {showWarning && (
          <WarningPopup 
            message={warningMessage} 
            handleConfirm={() => handleConfirmAddGuest(pendingTable, pendingGuest, tables, setTables, setGuests, setShowWarning, setPendingGuest, setPendingTable)}
            handleCancel={handleCancel}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </DragDropContext>
  );
};

export default WeddingSeatingPlanner;