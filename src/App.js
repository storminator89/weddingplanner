import React, { useState } from 'react';
import './App.css';  // Importiere die CSS-Datei
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const WeddingSeatingPlanner = () => {
  const [guests, setGuests] = useState([]);
  const [tables, setTables] = useState([
    { id: 'table1', name: 'Tisch 1', guests: [], seats: 4 },
    { id: 'table2', name: 'Tisch 2', guests: [], seats: 4 },
  ]);
  const [newGuest, setNewGuest] = useState('');
  const [compatibility, setCompatibility] = useState({});
  const [newTableName, setNewTableName] = useState('');
  const [newTableSeats, setNewTableSeats] = useState(4);
  const [editingTableId, setEditingTableId] = useState(null);
  const [editingTableName, setEditingTableName] = useState('');
  const [draggingGuest, setDraggingGuest] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [pendingGuest, setPendingGuest] = useState(null);
  const [pendingTable, setPendingTable] = useState(null);

  const addGuest = () => {
    if (newGuest.trim() !== '') {
      const newGuestObj = { id: `guest-${Date.now()}`, name: newGuest.trim() };
      setGuests([...guests, newGuestObj]);
      setNewGuest('');
      setCompatibility((prev) => ({
        ...prev,
        [newGuestObj.id]: {},
      }));
    }
  };

  const handleGuestKeyDown = (e) => {
    if (e.key === 'Enter') {
      addGuest();
    }
  };

  const addNewTable = () => {
    if (newTableName.trim() !== '') {
      const newTable = {
        id: `table-${Date.now()}`,
        name: newTableName.trim(),
        guests: [],
        seats: newTableSeats,
      };
      setTables([...tables, newTable]);
      setNewTableName('');
      setNewTableSeats(4);
    }
  };

  const handleTableKeyDown = (e) => {
    if (e.key === 'Enter') {
      addNewTable();
    }
  };

  const removeGuestFromList = (guestId) => {
    setGuests(guests.filter((g) => g.id !== guestId));
    const updatedTables = tables.map((table) => ({
      ...table,
      guests: table.guests.filter((g) => g.id !== guestId),
    }));
    setTables(updatedTables);
  };

  const updateCompatibility = (guest1Id, guest2Id, value) => {
    setCompatibility((prev) => ({
      ...prev,
      [guest1Id]: {
        ...prev[guest1Id],
        [guest2Id]: value,
      },
      [guest2Id]: {
        ...prev[guest2Id],
        [guest1Id]: value,
      },
    }));
  };

  const getCompatibilityColor = (guest1Id, guest2Id) => {
    const compatibilityValue = compatibility[guest1Id]?.[guest2Id];
    if (compatibilityValue === 'good') return '#27ae60';
    if (compatibilityValue === 'bad') return '#e74c3c';
    return '#95a5a6';
  };

  const updateTableSeats = (tableId, newSeats) => {
    const updatedTables = tables.map((table) => {
      if (table.id === tableId) {
        return { ...table, seats: newSeats };
      }
      return table;
    });
    setTables(updatedTables);
  };

  const startEditingTable = (tableId, currentName) => {
    setEditingTableId(tableId);
    setEditingTableName(currentName);
  };

  const saveTableName = (tableId) => {
    const updatedTables = tables.map((table) => {
      if (table.id === tableId) {
        return { ...table, name: editingTableName };
      }
      return table;
    });
    setTables(updatedTables);
    setEditingTableId(null);
    setEditingTableName('');
  };

  const removeTable = (tableId) => {
    const removedTable = tables.find((t) => t.id === tableId);
    setTables(tables.filter((table) => table.id !== tableId));
    setGuests([...guests, ...removedTable.guests]);
  };

  const removeGuestFromTable = (tableId, guestId) => {
    const updatedTables = tables.map((table) => {
      if (table.id === tableId) {
        return {
          ...table,
          guests: table.guests.filter((g) => g.id !== guestId),
        };
      }
      return table;
    });
    setTables(updatedTables);
    const removedGuest = tables.find((t) => t.id === tableId).guests.find((g) => g.id === guestId);
    setGuests([...guests, removedGuest]);
  };

  const canSitTogether = (tableGuests, newGuestId) => {
    for (let guest of tableGuests) {
      if (compatibility[guest.id]?.[newGuestId] === 'bad') {
        return false;
      }
    }
    return true;
  };

  const assignRemainingGuests = () => {
    let remainingGuests = [...guests];
    let updatedTables = [...tables];

    remainingGuests.forEach((guest) => {
      let guestAssigned = false;
      for (let table of updatedTables) {
        if (table.guests.length < table.seats && canSitTogether(table.guests, guest.id)) {
          table.guests.push(guest);
          guestAssigned = true;
          break;
        }
      }
      if (!guestAssigned) {
        setWarningMessage(`Kein geeigneter Platz für ${guest.name}.`);
        setShowWarning(true);
      }
    });

    setTables(updatedTables);
    setGuests(remainingGuests.filter((g) => !updatedTables.some((t) => t.guests.includes(g))));
  };

  const handleDragStart = (guest) => {
    setDraggingGuest(guest);
  };

  const handleDrop = (tableId) => {
    if (draggingGuest) {
      const table = tables.find((table) => table.id === tableId);
      if (table.guests.length >= table.seats) {
        setWarningMessage(`${table.name} ist voll.`);
        setShowWarning(true);
        setDraggingGuest(null);
        return;
      }
      const incompatibleGuests = table.guests.filter((guest) => compatibility[guest.id]?.[draggingGuest.id] === 'bad');
      if (incompatibleGuests.length > 0) {
        setPendingGuest(draggingGuest);
        setPendingTable(table);
        const incompatibleNames = incompatibleGuests.map((guest) => guest.name).join(', ');
        setWarningMessage(`${draggingGuest.name} verträgt sich nicht mit ${incompatibleNames}. Trotzdem hinzufügen?`);
        setShowWarning(true);
      } else {
        addGuestToTable(table, draggingGuest);
      }
      setDraggingGuest(null);
    }
  };

  const addGuestToTable = (table, guest) => {
    const updatedTables = tables.map((t) => {
      if (t.id === table.id && t.guests.length < t.seats) {
        return { ...t, guests: [...t.guests, guest] };
      }
      return t;
    });

    setTables(updatedTables);
    setGuests((prevGuests) => prevGuests.filter((g) => g.id !== guest.id));
    setShowWarning(false);
    setWarningMessage('');
    setPendingGuest(null);
    setPendingTable(null);
  };

  const handleConfirmAddGuest = () => {
    if (pendingTable && pendingGuest) {
      addGuestToTable(pendingTable, pendingGuest);
    }
  };

  const handleCancelDrop = () => {
    setShowWarning(false);
    setWarningMessage('');
    setPendingGuest(null);
    setPendingTable(null);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    tables.forEach((table) => {
        const head = [[`Tisch: ${table.name}`, 'Verträgt sich', 'Verträgt sich nicht']];
        const body = table.guests.map((guest) => {
            const compatible = table.guests
                .filter((otherGuest) => guest.id !== otherGuest.id && compatibility[guest.id]?.[otherGuest.id] === 'good')
                .map((otherGuest) => otherGuest.name)
                .join(', ');
            const incompatible = table.guests
                .filter((otherGuest) => guest.id !== otherGuest.id && compatibility[guest.id]?.[otherGuest.id] === 'bad')
                .map((otherGuest) => otherGuest.name)
                .join(', ');
            return [guest.name, compatible, incompatible];
        });
        doc.autoTable({
            head: head,
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [23, 162, 184] },
            margin: { top: 10 },
        });
    });
    doc.save("Tischbelegung.pdf");
};


  return (
    <div className="appContainer">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
      <h1 className="title">Tischplaner</h1>
      <div className="inputContainer">
        <input
          className="input"
          type="text"
          value={newGuest}
          onChange={(e) => setNewGuest(e.target.value)}
          onKeyDown={handleGuestKeyDown}
          placeholder="Neuen Gast hinzufügen"
        />
        <button className="button" onClick={addGuest}>
          <i className="fas fa-user-plus icon"></i>
          Gast hinzufügen
        </button>
      </div>
      <div className="inputContainer">
        <input
          className="input"
          type="text"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          onKeyDown={handleTableKeyDown}
          placeholder="Neuer Tischname"
        />
        <input
          className="input"
          style={{ width: '60px' }}
          type="number"
          value={newTableSeats}
          onChange={(e) => setNewTableSeats(parseInt(e.target.value))}
          min="1"
        />
        <button className="button" style={{ backgroundColor: '#27ae60' }} onClick={addNewTable}>
          <i className="fas fa-plus-circle icon"></i>
          Tisch hinzufügen
        </button>
      </div>
      <div className="contentContainer">
        <div className="guestListContainer">
          <h2 className="sectionTitle">
            <i className="fas fa-users icon"></i>
            Gästeliste
          </h2>
          {guests.map((guest) => (
            <div 
              key={guest.id} 
              className="guestItem"
              draggable
              onDragStart={() => handleDragStart(guest)}
            >
              <div>{guest.name}</div>
              <button 
                className="removeButton"
                onClick={() => removeGuestFromList(guest.id)}
              >
                <i className="fas fa-user-minus icon"></i>
                Entfernen
              </button>
              <div className="compatibilityContainer">
                Verträglichkeit:
                {guests.filter(g => g.id !== guest.id).map(otherGuest => (
                  <div key={otherGuest.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ flex: 1 }}>{otherGuest.name}:</span>
                    <select
                      className="compatibilitySelect"
                      style={{
                        backgroundColor: getCompatibilityColor(guest.id, otherGuest.id),
                        color: compatibility[guest.id]?.[otherGuest.id] ? '#fff' : '#333',
                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23${compatibility[guest.id]?.[otherGuest.id] ? 'FFFFFF' : '333333'}%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                      }}
                      value={compatibility[guest.id]?.[otherGuest.id] || ''}
                      onChange={(e) => updateCompatibility(guest.id, otherGuest.id, e.target.value)}
                    >
                      <option value="">Wählen</option>
                      <option value="good">
                        Gut
                      </option>
                      <option value="bad">
                        Schlecht
                      </option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="tablesContainer">
          {tables.map((table) => (
            <div 
              key={table.id} 
              className="tableCard"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(table.id)}
            >
              <div className="tableTitle">
                {editingTableId === table.id ? (
                  <>
                    <i className="fas fa-pencil-alt icon editIcon"></i>
                    <input
                      className="tableNameInput"
                      type="text"
                      value={editingTableName}
                      onChange={(e) => setEditingTableName(e.target.value)}
                    />
                    <button className="button" onClick={() => saveTableName(table.id)}>
                      Speichern
                    </button>
                  </>
                ) : (
                  <>
                    <i className="fas fa-pencil-alt icon editIcon" onClick={() => startEditingTable(table.id, table.name)}></i>
                    <span>
                      {table.name}
                    </span>
                    <button className="button" onClick={() => removeTable(table.id)}>
                      Entfernen
                    </button>
                  </>
                )}
                <div className="seatsInputContainer">
                  <input
                    className="seatsInput"
                    type="number"
                    value={table.seats}
                    onChange={(e) => updateTableSeats(table.id, parseInt(e.target.value))}
                    min="1"
                  />
                  <i className="fas fa-chair seatsInputIcon"></i>
                </div>
              </div>
              {table.guests.map((guest) => (
                <div key={guest.id} className="tableGuest">
                  <span>{guest.name}</span>
                  <div className="compatibilityIndicators">
                    {table.guests.filter(g => g.id !== guest.id).map(otherGuest => (
                      <span
                        key={otherGuest.id}
                        className={compatibility[guest.id]?.[otherGuest.id] === 'good' ? 'good' : 'bad'}
                      >
                        {otherGuest.name}
                      </span>
                    ))}
                  </div>
                  <button
                    className="removeButton"
                    onClick={() => removeGuestFromTable(table.id, guest.id)}
                  >
                    <i className="fas fa-user-minus icon"></i>
                    Entfernen
                  </button>
                </div>
              ))}
              <button 
                className="button"
                style={{
                  backgroundColor: table.guests.length >= table.seats ? '#ced4da' : '#4dabf7',
                  cursor: table.guests.length >= table.seats ? 'not-allowed' : 'pointer',
                }}
                disabled={table.guests.length >= table.seats}
              >
                <i className="fas fa-user-plus icon"></i>
                Gast hinzufügen ({table.guests.length}/{table.seats})
              </button>
            </div>
          ))}
        </div>
      </div>
      {showWarning && (
        <div className="popupOverlay">
          <div className="popupContent">
            <p>{warningMessage}</p>
            {pendingGuest && pendingTable && (
              <div>
                <button className="button" onClick={handleConfirmAddGuest}>Ja</button>
                <button className="button" onClick={handleCancelDrop}>Nein</button>
              </div>
            )}
            {!pendingGuest && (
              <button className="button" onClick={handleCancelDrop}>OK</button>
            )}
          </div>
        </div>
      )}
      <button className="button" style={{ backgroundColor: '#e67e22', marginTop: '2rem' }} onClick={assignRemainingGuests}>
        <i className="fas fa-random icon"></i>
        Verbleibende Gäste automatisch zuordnen
      </button>
      <button className="button" style={{ backgroundColor: '#3498db', marginTop: '1rem' }} onClick={exportPDF}>
        <i className="fas fa-file-pdf icon"></i>
        Tischbelegung als PDF exportieren
      </button>
    </div>
  );
};

export default WeddingSeatingPlanner;
