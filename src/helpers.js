import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const addGuest = (newGuest, guests, setGuests, setNewGuest, setCompatibility) => {
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

export const addNewTable = (newTableName, newTableSeats, tables, setTables, setNewTableName, setNewTableSeats) => {
  if (newTableName.trim() !== '') {
    const newTable = {
      id: `table-${Date.now()}`,
      name: newTableName.trim(),
      guests: [],
      seats: newTableSeats,
    };
    setTables([...tables, newTable]);
    setNewTableName('');
    setNewTableSeats(8);
  }
};

export const handleGuestKeyDown = (e, newGuest, guests, setGuests, setCompatibility, setNewGuest) => {
  if (e.key === 'Enter') {
    addGuest(newGuest, guests, setGuests, setNewGuest, setCompatibility);
  }
};

export const handleTableKeyDown = (e, newTableName, newTableSeats, tables, setTables, setNewTableName, setNewTableSeats) => {
  if (e.key === 'Enter') {
    addNewTable(newTableName, newTableSeats, tables, setTables, setNewTableName, setNewTableSeats);
  }
};

export const removeGuestFromList = (guestId, guests, setGuests) => {
  setGuests(guests.filter((g) => g.id !== guestId));
};

export const updateCompatibility = (guest1Id, guest2Id, value, compatibility, setCompatibility) => {
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

export const getCompatibilityColor = (guest1Id, guest2Id, compatibility) => {
  const compatibilityValue = compatibility[guest1Id]?.[guest2Id];
  if (compatibilityValue === 'good') return '#27ae60';
  if (compatibilityValue === 'bad') return '#e74c3c';
  return '#95a5a6';
};

export const updateTableSeats = (tableId, newSeats, tables, setTables) => {
  const updatedTables = tables.map((table) => {
    if (table.id === tableId) {
      return { ...table, seats: newSeats };
    }
    return table;
  });
  setTables(updatedTables);
};

export const startEditingTable = (tableId, currentName, setEditingTableId, setEditingTableName) => {
  setEditingTableId(tableId);
  setEditingTableName(currentName);
};

export const saveTableName = (tableId, editingTableName, tables, setTables, setEditingTableId, setEditingTableName) => {
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

export const removeTable = (tableId, tables, setTables, guests, setGuests) => {
  const removedTable = tables.find((t) => t.id === tableId);
  setTables(tables.filter((table) => table.id !== tableId));
  setGuests([...guests, ...removedTable.guests]);
};

export const removeGuestFromTable = (tableId, guestId, tables, setTables, guests, setGuests) => {
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

export const canSitTogether = (tableGuests, newGuestId, compatibility) => {
  for (let guest of tableGuests) {
    if (compatibility[guest.id]?.[newGuestId] === 'bad') {
      return false;
    }
  }
  return true;
};

export const addGuestToTable = (table, guest, tables, setTables, setGuests) => {
  const updatedTables = tables.map((t) => {
    if (t.id === table.id && t.guests.length < t.seats) {
      return { ...t, guests: [...t.guests, guest] };
    }
    return t;
  });

  setTables(updatedTables);
  setGuests((prevGuests) => prevGuests.filter((g) => g.id !== guest.id));
};

export const handleConfirmAddGuest = (pendingTable, pendingGuest, tables, setTables, setGuests, setShowWarning, setPendingGuest, setPendingTable) => {
  if (pendingTable && pendingGuest) {
    addGuestToTable(pendingTable, pendingGuest, tables, setTables, setGuests);
    setShowWarning(false);
    setPendingGuest(null);
    setPendingTable(null);
  }
};

export const handleCancelDrop = (setShowWarning, setWarningMessage, setPendingGuest, setPendingTable) => {
  setShowWarning(false);
  setWarningMessage('');
  setPendingGuest(null);
  setPendingTable(null);
};

export const assignRemainingGuests = (guests, setGuests, tables, setTables, setShowWarning, setWarningMessage, compatibility) => {
  let remainingGuests = [...guests];
  let updatedTables = [...tables];
  let unassignedGuests = [];

  remainingGuests.forEach((guest) => {
    let guestAssigned = false;
    for (let table of updatedTables) {
      if (table.guests.length < table.seats && canSitTogether(table.guests, guest.id, compatibility)) {
        table.guests.push(guest);
        guestAssigned = true;
        break;
      }
    }
    if (!guestAssigned) {
      unassignedGuests.push(guest);
    }
  });

  setTables(updatedTables);
  setGuests(unassignedGuests);

  if (unassignedGuests.length > 0) {
    const guestNames = unassignedGuests.map(g => g.name).join(', ');
    setWarningMessage(`Kein geeigneter Platz für: ${guestNames}`);
    setShowWarning(true);
  }
};

export const exportPDF = (tables, compatibility) => {
  const doc = new jsPDF();
  tables.forEach((table, index) => {
    if (index > 0) {
      doc.addPage();
    }
    doc.setFontSize(18);
    doc.text(`${table.name}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Sitzplätze: ${table.seats}`, 14, 32);

    const tableData = table.guests.map(guest => {
      const compatibleGuests = table.guests
        .filter(g => g.id !== guest.id && compatibility[guest.id]?.[g.id] === 'good')
        .map(g => g.name)
        .join(', ');
      const incompatibleGuests = table.guests
        .filter(g => g.id !== guest.id && compatibility[guest.id]?.[g.id] === 'bad')
        .map(g => g.name)
        .join(', ');
      return [guest.name, compatibleGuests, incompatibleGuests];
    });

    doc.autoTable({
      startY: 40,
      head: [['Gast', 'Verträgt sich mit', 'Verträgt sich nicht mit']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
  });

  doc.save('Tischplan.pdf');
};

export const onDragEnd = (result, guests, setGuests, tables, setTables, compatibility, setShowWarning, setWarningMessage, setPendingGuest, setPendingTable) => {
    if (!result.destination) {
      return;
    }
  
    const { source, destination } = result;
  
    // Moving within the guest list
    if (source.droppableId === 'guestList' && destination.droppableId === 'guestList') {
      const reorderedGuests = Array.from(guests);
      const [reorderedItem] = reorderedGuests.splice(source.index, 1);
      reorderedGuests.splice(destination.index, 0, reorderedItem);
      setGuests(reorderedGuests);
      return;
    }
  
    // Moving from guest list to a table
    if (source.droppableId === 'guestList' && destination.droppableId !== 'guestList') {
      const guestToMove = guests[source.index];
      const destinationTable = tables.find(table => table.id === destination.droppableId);
  
      if (destinationTable.guests.length >= destinationTable.seats) {
        setWarningMessage(`${destinationTable.name} ist voll.`);
        setShowWarning(true);
        return;
      }
  
      const updatedGuests = guests.filter((_, index) => index !== source.index);
      const updatedTables = tables.map(table => {
        if (table.id === destination.droppableId) {
          return {
            ...table,
            guests: [...table.guests.slice(0, destination.index), guestToMove, ...table.guests.slice(destination.index)]
          };
        }
        return table;
      });
  
      setGuests(updatedGuests);
      setTables(updatedTables);
      return;
    }
  
    // Moving from a table to another table or back to guest list
    if (source.droppableId !== 'guestList') {
      const sourceTable = tables.find(table => table.id === source.droppableId);
      const [movedGuest] = sourceTable.guests.splice(source.index, 1);
  
      if (destination.droppableId === 'guestList') {
        // Moving back to guest list
        setGuests([...guests, movedGuest]);
      } else {
        // Moving to another table
        const destinationTable = tables.find(table => table.id === destination.droppableId);
  
        if (destinationTable.guests.length >= destinationTable.seats) {
          setWarningMessage(`${destinationTable.name} ist voll.`);
          setShowWarning(true);
          // Revert the change
          sourceTable.guests.splice(source.index, 0, movedGuest);
          setTables([...tables]);
          return;
        }
  
        destinationTable.guests.splice(destination.index, 0, movedGuest);
      }
  
      setTables([...tables]);
    }
  };
  