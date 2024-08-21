// TableList.js
import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faEdit, faTrashAlt, faChair, faUserMinus, faUsers, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
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
  setPendingTable 
}) => {
  const [editingTableId, setEditingTableId] = useState(null);
  const [editingTableName, setEditingTableName] = useState('');

  return (
    <div className="bg-base-100 shadow-xl rounded-box overflow-hidden">
      <h2 className="text-2xl font-bold p-4 bg-primary text-white sticky top-0 z-10">
        <FontAwesomeIcon icon={faUsers} className="mr-3" />
        Tischplan
      </h2>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <Droppable droppableId={table.id} key={table.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`card bg-base-100 border-2 transition-all duration-300 ${
                    snapshot.isDraggingOver ? 'border-primary shadow-lg' : 'border-base-300 shadow-md'
                  } hover:shadow-xl`}
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-center mb-2">
                      {editingTableId === table.id ? (
                        <div className="flex items-center w-full">
                          <input
                            className="input input-bordered input-sm flex-grow mr-2"
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
                            className="btn btn-primary btn-sm btn-square"
                            onClick={() => saveTableName(table.id, editingTableName, tables, setTables, setEditingTableId, setEditingTableName)}
                          >
                            <FontAwesomeIcon icon={faSave} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold">{table.name}</h3>
                          <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
                              <FontAwesomeIcon icon={faEllipsisV} />
                            </label>
                            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                              <li>
                                <a onClick={() => startEditingTable(table.id, table.name, setEditingTableId, setEditingTableName)}>
                                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                  Tisch umbenennen
                                </a>
                              </li>
                              <li>
                                <a onClick={() => removeTable(table.id, tables, setTables, guests, setGuests)} className="text-error">
                                  <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                                  Tisch entfernen
                                </a>
                              </li>
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon icon={faChair} className="mr-2 text-primary" />
                      <span className="font-semibold mr-2">Sitzplätze:</span>
                      <input
                        className="input input-bordered input-sm w-16"
                        type="number"
                        value={table.seats}
                        onChange={(e) => updateTableSeats(table.id, parseInt(e.target.value), tables, setTables)}
                        min="1"
                      />
                    </div>
                    <div className="divider my-2"></div>
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {table.guests.map((guest, index) => (
                        <Draggable key={guest.id} draggableId={guest.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex items-center justify-between p-2 rounded-lg ${
                                snapshot.isDragging ? 'bg-base-200 shadow-md' : 'bg-base-100'
                              } hover:bg-base-200 transition duration-300 border border-base-300`}
                            >
                              <div className="flex items-center flex-grow">
                                <span className="font-medium">{guest.name}</span>
                                <div className="flex ml-2">
                                  {table.guests.map((otherGuest) => {
                                    if (otherGuest.id === guest.id) return null;
                                    return (
                                      <div
                                        key={otherGuest.id}
                                        className={`w-2 h-2 rounded-full mr-1 ${getCompatibilityColor(guest.id, otherGuest.id, compatibility)}`}
                                        title={`Kompatibilität mit ${otherGuest.name}`}
                                      ></div>
                                    );
                                  })}
                                </div>
                              </div>
                              <button
                                className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error hover:text-white"
                                onClick={() => removeGuestFromTable(table.id, guest.id, tables, setTables, guests, setGuests)}
                                title="Gast entfernen"
                              >
                                <FontAwesomeIcon icon={faUserMinus} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}
                    <div className="text-sm font-semibold flex items-center justify-between bg-base-200 p-2 rounded-lg mt-auto">
                      <span>
                        <FontAwesomeIcon icon={faChair} className="mr-2" />
                        {table.guests.length}/{table.seats} Plätze belegt
                      </span>
                      <span className={`badge ${
                        table.guests.length === table.seats ? 'badge-success' : 'badge-warning'
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