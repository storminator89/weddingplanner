// GuestList.js
import React, { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faUserMinus, faThumbsUp, faThumbsDown, faUsers } from '@fortawesome/free-solid-svg-icons';
import { removeGuestFromList, updateCompatibility } from './helpers';

const GuestList = ({ guests, setGuests, compatibility, setCompatibility }) => {
  const [selectedGuest, setSelectedGuest] = useState(null);

  return (
    <div className="card bg-white shadow-xl flex-1 overflow-hidden">
      <div className="card-body p-0">
        <h2 className="text-2xl font-bold p-4 bg-primary text-white">
          <FontAwesomeIcon icon={faUsers} className="mr-3" />
          Gästeliste
        </h2>
        <Droppable droppableId="guestList">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2 p-4 max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar"
            >
              {guests.length === 0 ? (
                <p className="text-gray-500 italic">Noch keine Gäste hinzugefügt.</p>
              ) : (
                guests.map((guest, index) => (
                  <Draggable key={guest.id} draggableId={guest.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                          snapshot.isDragging ? 'shadow-lg bg-primary bg-opacity-10' : 'bg-white'
                        } ${
                          selectedGuest === guest.id ? 'ring-2 ring-primary' : ''
                        } border border-gray-200 hover:border-primary`}
                        onClick={() => setSelectedGuest(selectedGuest === guest.id ? null : guest.id)}
                      >
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faUserCircle} className="text-primary mr-3 text-xl" />
                          <span className="font-medium">{guest.name}</span>
                        </div>
                        <button 
                          className="btn btn-ghost btn-circle btn-sm text-gray-500 hover:bg-red-100 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGuestFromList(guest.id, guests, setGuests);
                          }}
                          title="Gast entfernen"
                        >
                          <FontAwesomeIcon icon={faUserMinus} />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        {selectedGuest && (
          <div className="mt-4 p-4 bg-gray-50 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Kompatibilität</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {guests.map((otherGuest) => {
                if (otherGuest.id === selectedGuest) return null;
                const compatibilityValue = compatibility[selectedGuest]?.[otherGuest.id] || 'neutral';
                return (
                  <div key={otherGuest.id} className="flex items-center justify-between">
                    <span className="font-medium">{otherGuest.name}</span>
                    <div className="flex space-x-2">
                      <button
                        className={`btn btn-circle btn-sm ${
                          compatibilityValue === 'good' ? 'btn-success' : 'btn-ghost'
                        } hover:btn-success`}
                        onClick={() => updateCompatibility(selectedGuest, otherGuest.id, compatibilityValue === 'good' ? 'neutral' : 'good', compatibility, setCompatibility)}
                        title="Gute Kompatibilität"
                      >
                        <FontAwesomeIcon icon={faThumbsUp} />
                      </button>
                      <button
                        className={`btn btn-circle btn-sm ${
                          compatibilityValue === 'bad' ? 'btn-error' : 'btn-ghost'
                        } hover:btn-error`}
                        onClick={() => updateCompatibility(selectedGuest, otherGuest.id, compatibilityValue === 'bad' ? 'neutral' : 'bad', compatibility, setCompatibility)}
                        title="Schlechte Kompatibilität"
                      >
                        <FontAwesomeIcon icon={faThumbsDown} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestList;