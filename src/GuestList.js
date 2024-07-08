import React, { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faUserMinus, faThumbsUp, faThumbsDown, faUsers } from '@fortawesome/free-solid-svg-icons';
import { removeGuestFromList, updateCompatibility } from './helpers';

const GuestList = ({ guests, setGuests, compatibility, setCompatibility, isDarkMode }) => {
  const [selectedGuest, setSelectedGuest] = useState(null);

  return (
    <Droppable droppableId="guestList">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`w-full lg:w-1/3 p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FontAwesomeIcon icon={faUsers} className="mr-3 text-blue-500" />
            Gästeliste
          </h2>
          {guests.length === 0 ? (
            <p className="text-gray-500 italic">Noch keine Gäste hinzugefügt.</p>
          ) : (
            <div className="space-y-3">
              {guests.map((guest, index) => (
                <Draggable key={guest.id} draggableId={guest.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center justify-between p-4 rounded-lg transition duration-300 ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      } ${snapshot.isDragging ? 'shadow-lg' : ''} ${
                        selectedGuest === guest.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedGuest(selectedGuest === guest.id ? null : guest.id)}
                    >
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faUserCircle} className="text-blue-500 mr-3 text-xl" />
                        <span className="font-medium">{guest.name}</span>
                      </div>
                      <button 
                        className="text-red-500 hover:text-red-700 transition duration-300 p-2 rounded-full hover:bg-red-100"
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
              ))}
            </div>
          )}
          {provided.placeholder}
          {selectedGuest && (
            <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className="text-lg font-semibold mb-4">Kompatibilität</h3>
              <div className="space-y-3">
                {guests.map((otherGuest) => {
                  if (otherGuest.id === selectedGuest) return null;
                  const compatibilityValue = compatibility[selectedGuest]?.[otherGuest.id] || 'neutral';
                  return (
                    <div key={otherGuest.id} className="flex items-center justify-between">
                      <span className="font-medium">{otherGuest.name}</span>
                      <div className="flex space-x-2">
                        <button
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition duration-300 ${
                            compatibilityValue === 'good' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                          } hover:opacity-75`}
                          onClick={() => updateCompatibility(selectedGuest, otherGuest.id, compatibilityValue === 'good' ? 'neutral' : 'good', compatibility, setCompatibility)}
                          title="Gute Kompatibilität"
                        >
                          <FontAwesomeIcon icon={faThumbsUp} />
                        </button>
                        <button
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition duration-300 ${
                            compatibilityValue === 'bad' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'
                          } hover:opacity-75`}
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
      )}
    </Droppable>
  );
};

export default GuestList;
