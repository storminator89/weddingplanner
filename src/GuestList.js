// GuestList.js
import React, { useState, useMemo } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faUserMinus, faThumbsUp, faThumbsDown, faUsers, faSearch, faSortAlphaDown, faSortAlphaUp, faFilter, faTimes, faUserFriends, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { removeGuestFromList, updateCompatibility } from './helpers';

const GuestList = ({ guests, setGuests, compatibility, setCompatibility }) => {
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterCompatibility, setFilterCompatibility] = useState('all');

  const { compatibleGroups, ungroupedGuests } = useMemo(() => {
    const groups = [];
    const addedGuests = new Set();

    const isCompatibleWithGroup = (guest, group) => {
      return group.every(member => 
        compatibility[guest.id]?.[member.id] !== 'bad' && 
        compatibility[member.id]?.[guest.id] !== 'bad'
      );
    };

    const findCompatibleGroup = (guest) => {
      for (let group of groups) {
        if (isCompatibleWithGroup(guest, group)) {
          return group;
        }
      }
      return null;
    };

    guests.forEach(guest => {
      if (!addedGuests.has(guest.id)) {
        const compatibleGroup = findCompatibleGroup(guest);
        if (compatibleGroup) {
          compatibleGroup.push(guest);
        } else {
          groups.push([guest]);
        }
        addedGuests.add(guest.id);
      }
    });

    const finalGroups = groups.filter(group => group.length > 1);
    const ungrouped = guests.filter(guest => !finalGroups.flat().some(g => g.id === guest.id));

    return { compatibleGroups: finalGroups, ungroupedGuests: ungrouped };
  }, [guests, compatibility]);

  const filteredAndSortedGuests = useMemo(() => {
    let filteredGuests = guests.filter(guest => 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterCompatibility === 'compatible') {
      const compatibleGuestIds = new Set(compatibleGroups.flat().map(g => g.id));
      filteredGuests = filteredGuests.filter(guest => compatibleGuestIds.has(guest.id));
    } else if (filterCompatibility === 'incompatible') {
      filteredGuests = ungroupedGuests.filter(guest => 
        guest.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredGuests.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  }, [guests, searchTerm, sortOrder, filterCompatibility, compatibleGroups, ungroupedGuests]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const renderGuestItem = (guest, index) => (
    <Draggable key={guest.id} draggableId={guest.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
            snapshot.isDragging ? 'shadow-lg bg-base-200' : 'bg-base-100'
          } ${
            selectedGuest === guest.id ? 'ring-2 ring-primary' : ''
          } hover:bg-base-200 cursor-pointer`}
          onClick={() => setSelectedGuest(selectedGuest === guest.id ? null : guest.id)}
        >
          <div className="flex items-center">
            <FontAwesomeIcon icon={faUserCircle} className="text-primary mr-3 text-xl" />
            <span className="font-medium">{guest.name}</span>
          </div>
          <button 
            className="btn btn-ghost btn-circle btn-sm text-error hover:bg-error hover:text-white"
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
  );

  return (
    <div className="card bg-base-100 shadow-xl flex-1 overflow-hidden">
      <div className="card-body p-0">
        <h2 className="text-2xl font-bold p-4 bg-primary text-white sticky top-0 z-10 flex items-center justify-between">
          <span className="flex items-center">
            <FontAwesomeIcon icon={faUsers} className="mr-3" />
            Gästeliste
          </span>
          <span className="text-sm font-normal">
            {guests.length} {guests.length === 1 ? 'Gast' : 'Gäste'}
          </span>
        </h2>
        <div className="p-4 space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Gäste suchen..."
              className="input input-bordered w-full pr-10 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
          <div className="flex justify-between items-center">
            <button 
              className="btn btn-sm btn-ghost"
              onClick={toggleSortOrder}
              title={sortOrder === 'asc' ? "Absteigend sortieren" : "Aufsteigend sortieren"}
            >
              <FontAwesomeIcon icon={sortOrder === 'asc' ? faSortAlphaDown : faSortAlphaUp} className="mr-2" />
              Sortieren
            </button>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
              <select 
                className="select select-bordered select-sm"
                value={filterCompatibility}
                onChange={(e) => setFilterCompatibility(e.target.value)}
              >
                <option value="all">Alle Gäste</option>
                <option value="compatible">Nur kompatible</option>
                <option value="incompatible">Nur inkompatible</option>
              </select>
            </div>
          </div>
        </div>
        <Droppable droppableId="guestList">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="px-4 pb-4 space-y-4 max-h-96 overflow-y-auto custom-scrollbar"
            >
              {filteredAndSortedGuests.length === 0 ? (
                <p className="text-center text-gray-500 italic py-4">Keine Gäste gefunden.</p>
              ) : filterCompatibility === 'compatible' ? (
                <>
                  {compatibleGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="border border-primary rounded-lg p-2">
                      <h4 className="text-sm font-semibold mb-2 flex items-center">
                        <FontAwesomeIcon icon={faUserFriends} className="mr-2 text-primary" />
                        Kompatible Gruppe {groupIndex + 1}
                      </h4>
                      {group.map((guest, index) => renderGuestItem(guest, index))}
                    </div>
                  ))}
                </>
              ) : filterCompatibility === 'incompatible' ? (
                <div className="border border-warning rounded-lg p-2">
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    <FontAwesomeIcon icon={faUserSlash} className="mr-2 text-warning" />
                    Nicht gruppierte Gäste
                  </h4>
                  {ungroupedGuests.map((guest, index) => renderGuestItem(guest, index))}
                </div>
              ) : (
                filteredAndSortedGuests.map((guest, index) => renderGuestItem(guest, index))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        {selectedGuest && (
          <div className="p-4 bg-base-200 border-t border-base-300">
            <h3 className="text-lg font-semibold mb-4">Kompatibilität für {guests.find(g => g.id === selectedGuest)?.name}</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {guests.map((otherGuest) => {
                if (otherGuest.id === selectedGuest) return null;
                const compatibilityValue = compatibility[selectedGuest]?.[otherGuest.id] || 'neutral';
                return (
                  <div key={otherGuest.id} className="flex items-center justify-between bg-base-100 p-2 rounded-lg">
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