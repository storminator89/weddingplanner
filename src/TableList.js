import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faEdit, faTrashAlt, faChair, faUserMinus, faUsers } from '@fortawesome/free-solid-svg-icons';
import {
  removeGuestFromTable,
  updateTableSeats,
  startEditingTable,
  saveTableName,
  removeTable,
  getCompatibilityColor
} from './helpers';

const TableList = ({ 
  tables, 
  setTables, 
  guests, 
  setGuests, 
  compatibility, 
  setShowWarning, 
  setWarningMessage, 
  setPendingGuest, 
  setPendingTable, 
  isDarkMode 
}) => {
  const [editingTableId, setEditingTableId] = useState(null);
  const [editingTableName, setEditingTableName] = useState('');

  return (
    <div className="w-full">
      <div className={`p-6 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-600'}`}>
        <h2 className="text-3xl font-bold text-center text-white">
          <FontAwesomeIcon icon={faUsers} className="mr-3" />
          Tischplan
        </h2>
      </div>
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tables.map((table) => (
            <Droppable droppableId={table.id} key={table.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-xl shadow-lg transition-all duration-300 ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'
                  } ${snapshot.isDraggingOver ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}`}
                >
                  <div className={`p-4 rounded-t-xl ${isDarkMode ? 'bg-blue-700' : 'bg-blue-600'}`}>
                    {editingTableId === table.id ? (
                      <div className="flex items-center w-full">
                        <input
                          className={`flex-grow p-2 rounded-lg mr-2 ${
                            isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                          } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                          type="text"
                          value={editingTableName}
                          onChange={(e) => setEditingTableName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              saveTableName(table.id, editingTableName, tables, setTables, setEditingTableId, setEditingTableName);
                            }
                          }}
                        />
                        <button
                          className="bg-white text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition duration-300"
                          onClick={() => saveTableName(table.id, editingTableName, tables, setTables, setEditingTableId, setEditingTableName)}
                        >
                          <FontAwesomeIcon icon={faSave} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-white">{table.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            className="text-white hover:text-blue-200 transition duration-300"
                            onClick={() => startEditingTable(table.id, table.name, setEditingTableId, setEditingTableName)}
                            title="Tisch umbenennen"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="text-white hover:text-red-300 transition duration-300"
                            onClick={() => removeTable(table.id, tables, setTables, guests, setGuests)}
                            title="Tisch entfernen"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      <span className="mr-2 font-semibold">Sitzplätze:</span>
                      <input
                        className={`w-16 p-2 rounded-lg ${
                          isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-100'
                        } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                        type="number"
                        value={table.seats}
                        onChange={(e) => updateTableSeats(table.id, parseInt(e.target.value), tables, setTables)}
                        min="1"
                      />
                    </div>
                    <div className="space-y-3">
                      {table.guests.map((guest, index) => (
                        <Draggable key={guest.id} draggableId={guest.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                              } ${snapshot.isDragging ? 'opacity-75 shadow-lg' : ''} hover:shadow-md transition duration-300`}
                            >
                              <div className="flex items-center flex-grow">
                                <span className="mr-2 font-medium">{guest.name}</span>
                                <div className="flex">
                                  {table.guests.map((otherGuest) => {
                                    if (otherGuest.id === guest.id) return null;
                                    return (
                                      <div
                                        key={otherGuest.id}
                                        className="w-3 h-3 rounded-full mr-1"
                                        style={{ backgroundColor: getCompatibilityColor(guest.id, otherGuest.id, compatibility) }}
                                        title={`Kompatibilität mit ${otherGuest.name}`}
                                      ></div>
                                    );
                                  })}
                                </div>
                              </div>
                              <button
                                className="text-red-500 hover:text-red-600 transition duration-300 p-2 rounded-full hover:bg-red-100"
                                onClick={() => removeGuestFromTable(table.id, guest.id, tables, setTables, guests, setGuests)}
                                title="Gast entfernen"
                              >
                                <FontAwesomeIcon icon={faUserMinus} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                    <div className="mt-4 text-sm font-semibold flex items-center justify-between">
                      <span>
                        <FontAwesomeIcon icon={faChair} className="mr-2" />
                        {table.guests.length}/{table.seats} Plätze belegt
                      </span>
                      <span className={`px-3 py-1 rounded-full ${
                        table.guests.length === table.seats ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                      }`}>
                        {table.guests.length === table.seats ? 'Voll' : 'Verfügbar'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableList;
