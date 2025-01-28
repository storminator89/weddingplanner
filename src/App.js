// App.js
import React, { useState, useEffect, Suspense } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faPlusCircle, faRandom, faFilePdf, faSun, faMoon, faBars, faChair, faChartPie, faHome, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import ShortcutHelp from './components/ShortcutHelp';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  useEffect(() => {
    const totalGuests = guests.length + tables.reduce((sum, table) => sum + table.guests.length, 0);
    const seatedGuests = tables.reduce((sum, table) => sum + table.guests.length, 0);
    setProgress(totalGuests > 0 ? (seatedGuests / totalGuests) * 100 : 0);
  }, [guests, tables]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        exportPDF(tables, compatibility);
      }
      if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
      if (e.key === '?' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowShortcutHelp(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sidebarOpen, tables, compatibility]);

  const notifySuccess = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message);
  const notifyInfo = (message) => toast.info(message);

  const handleDragEnd = (result) => {
    onDragEnd(result, guests, setGuests, tables, setTables, compatibility, setShowWarning, setWarningMessage, setPendingGuest, setPendingTable);
    if (result.destination) {
      notifySuccess('Gast erfolgreich verschoben');
    }
  };

  const handleCancel = () => {
    handleCancelDrop(setShowWarning, setWarningMessage, setPendingGuest, setPendingTable);
    notifyInfo('Aktion abgebrochen');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    notifyInfo(`${isDarkMode ? 'Light' : 'Dark'} Mode aktiviert`);
  };

  const handleAddGuest = async () => {
    setIsLoading(true);
    try {
      await addGuest(newGuest, guests, setGuests, setNewGuest, setCompatibility);
      notifySuccess('Gast erfolgreich hinzugefügt');
    } catch (error) {
      notifyError('Fehler beim Hinzufügen des Gastes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTable = async () => {
    setIsLoading(true);
    try {
      await addNewTable(newTableName, newTableSeats, tables, setTables, setNewTableName, setNewTableSeats);
      notifySuccess('Tisch erfolgreich erstellt');
    } catch (error) {
      notifyError('Fehler beim Erstellen des Tisches');
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-base-100 p-8 rounded-lg shadow-xl animate-bounce">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="mt-4 text-center">Wird geladen...</p>
      </div>
    </div>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {isLoading && <LoadingOverlay />}
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`} data-theme={isDarkMode ? 'dark' : 'light'}>
        <ShortcutHelp 
          isOpen={showShortcutHelp} 
          onClose={() => setShowShortcutHelp(false)} 
        />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={isDarkMode ? 'dark' : 'light'}
        />
        <div className="drawer drawer-mobile">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" checked={sidebarOpen} onChange={() => setSidebarOpen(!sidebarOpen)} />
          <div className="drawer-content flex flex-col">
            {/* Navbar */}
            <nav className="navbar bg-primary text-primary-content sticky top-0 z-50">
              {isLoading && (
                <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
                  <div className="h-full bg-accent animate-pulse" style={{width: '30%', animation: 'loading 1s ease-in-out infinite'}}></div>
                </div>
              )}
              <div className="flex-1">
                <button 
                  className="btn btn-ghost normal-case text-xl" 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  aria-label="Toggle Sidebar"
                >
                  <FontAwesomeIcon icon={faBars} className="mr-2" />
                  Eleganter Tischplaner
                </button>
              </div>
              <div className="flex items-center space-x-4">
                {/* Breadcrumb */}
                <div className="text-sm breadcrumbs hidden md:inline-flex">
                  <ul>
                    <li><FontAwesomeIcon icon={faHome} className="mr-2" />Home</li>
                    <li>{currentView === 'dashboard' ? 'Dashboard' : 'Planer'}</li>
                  </ul>
                </div>
                <div className="flex-none gap-2">
                  <button 
                    onClick={toggleDarkMode} 
                    className="btn btn-circle btn-ghost hover:rotate-12 transition-transform duration-300"
                    aria-label={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
                  >
                    <FontAwesomeIcon 
                      icon={isDarkMode ? faSun : faMoon} 
                      className="text-xl transition-transform duration-300 hover:scale-110" 
                    />
                  </button>
                </div>
              </div>
            </nav>

            {/* Main content */}
            <main className="flex-1 p-6 bg-base-100">
              <Suspense fallback={
                <div className="w-full h-32 flex items-center justify-center">
                  <div className="loading loading-spinner loading-lg"></div>
                </div>
              }>
                {currentView === 'dashboard' ? (
                  <Dashboard guests={guests} tables={tables} compatibility={compatibility} />
                ) : (
                  <div className="container mx-auto space-y-8">
                    {/* Aktionsleiste */}
                    <div className="flex flex-wrap gap-4 justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex gap-2 flex-grow">
                        <input
                          className="input input-bordered flex-grow bg-white dark:bg-gray-700"
                          type="text"
                          value={newGuest}
                          onChange={(e) => setNewGuest(e.target.value)}
                          onKeyDown={(e) => handleGuestKeyDown(e, newGuest, guests, setGuests, setCompatibility, setNewGuest)}
                          placeholder="Neuen Gast hinzufügen"
                        />
                        <button 
                          className="btn btn-primary"
                          onClick={handleAddGuest}
                          disabled={isLoading}
                        >
                          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                          Gast hinzufügen
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-accent"
                          onClick={() => assignRemainingGuests(guests, setGuests, tables, setTables, setShowWarning, setWarningMessage, compatibility)}
                          disabled={isLoading}
                        >
                          <FontAwesomeIcon icon={faRandom} className="mr-2" />
                          Auto-Zuordnung
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => exportPDF(tables, compatibility)}
                          disabled={isLoading}
                        >
                          <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                          PDF Export
                        </button>
                      </div>
                    </div>

                    {/* Hauptbereich */}
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Linke Spalte - Gästeliste und Tisch erstellen */}
                      <div className="lg:w-1/3 space-y-8">
                        <GuestList 
                          guests={guests} 
                          setGuests={setGuests} 
                          compatibility={compatibility} 
                          setCompatibility={setCompatibility}
                          isDarkMode={isDarkMode}
                        />
                        <div className="card bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="card-body">
                            <h3 className="card-title text-lg mb-4">Neuen Tisch erstellen</h3>
                            <div className="flex flex-col gap-4">
                              <input
                                className="input input-bordered w-full"
                                type="text"
                                value={newTableName}
                                onChange={(e) => setNewTableName(e.target.value)}
                                placeholder="Tischname"
                              />
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faChair} className="text-primary" />
                                <input
                                  className="input input-bordered w-20 text-center"
                                  type="number"
                                  value={newTableSeats}
                                  onChange={(e) => setNewTableSeats(parseInt(e.target.value))}
                                  min="1"
                                  max="99"
                                />
                                <span className="text-sm text-gray-500">Sitzplätze</span>
                              </div>
                              <button 
                                className="btn btn-primary w-full"
                                onClick={handleAddTable}
                              >
                                <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                                Tisch erstellen
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rechte Spalte - Tischplan */}
                      <div className="lg:w-2/3">
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
                    </div>

                    {/* Fortschrittsanzeige */}
                    <div className="sticky bottom-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 shadow-lg rounded-t-xl border-t border-primary/10">
                      <ProgressBar progress={progress} />
                      <div className="text-center text-sm text-gray-500 mt-2">
                        {Math.round(progress)}% der Gäste sind platziert
                      </div>
                    </div>
                  </div>
                )}
              </Suspense>
            </main>
          </div>

          {/* Sidebar */}
          <div className="drawer-side">
            <label htmlFor="my-drawer" className="drawer-overlay"></label> 
            <ul className="menu p-4 w-80 bg-base-100 text-base-content">
              <li className="mb-8">
                <h1 className="text-2xl font-bold text-primary">Tischplaner</h1>
              </li>
              <li className="mb-2">
                <a 
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                    currentView === 'dashboard' ? 'bg-primary text-white' : 'hover:bg-base-200'
                  }`}
                  onClick={() => { setCurrentView('dashboard'); setSidebarOpen(false); }}
                >
                  <FontAwesomeIcon icon={faChartPie} className="mr-3" />
                  Dashboard
                </a>
              </li>
              <li className="mb-2">
                <a 
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                    currentView === 'planner' ? 'bg-primary text-white' : 'hover:bg-base-200'
                  }`}
                  onClick={() => { setCurrentView('planner'); setSidebarOpen(false); }}
                >
                  <FontAwesomeIcon icon={faHome} className="mr-3" />
                  Planer
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="fixed bottom-4 right-4 space-y-2">
          <button 
            onClick={() => exportPDF(tables, compatibility)}
            className="btn btn-circle btn-primary shadow-lg hover:scale-110 transition-transform duration-200"
          >
            <FontAwesomeIcon icon={faFilePdf} />
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-circle btn-secondary shadow-lg hover:scale-110 transition-transform duration-200"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <button 
            onClick={() => setShowShortcutHelp(true)}
            className="btn btn-circle btn-ghost bg-base-200 shadow-lg hover:scale-110 transition-transform duration-200"
          >
            <FontAwesomeIcon icon={faQuestionCircle} />
          </button>
        </div>
      </div>
    </DragDropContext>
  );
};

export default WeddingSeatingPlanner;
