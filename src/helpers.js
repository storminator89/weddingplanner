// helpers.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const addGuest = (newGuest, guests, setGuests, setNewGuest, setCompatibility) => {
  if (newGuest.trim() !== '') {
    const newGuestObj = { id: `guest-${Date.now()}`, name: newGuest.trim() };
    setGuests(prevGuests => [...prevGuests, newGuestObj]);
    setNewGuest('');
    setCompatibility(prev => ({
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
    setTables(prevTables => [...prevTables, newTable]);
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
  setGuests(prevGuests => prevGuests.filter(g => g.id !== guestId));
};

export const updateCompatibility = (guest1Id, guest2Id, value, compatibility, setCompatibility) => {
  setCompatibility(prev => ({
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
  if (compatibilityValue === 'good') return 'bg-success';
  if (compatibilityValue === 'bad') return 'bg-error';
  return 'bg-neutral';
};

export const updateTableSeats = (tableId, newSeats, tables, setTables) => {
  setTables(prevTables => prevTables.map(table => 
    table.id === tableId ? { ...table, seats: newSeats } : table
  ));
};

export const startEditingTable = (tableId, currentName, setEditingTableId, setEditingTableName) => {
  setEditingTableId(tableId);
  setEditingTableName(currentName);
};

export const saveTableName = (tableId, editingTableName, tables, setTables, setEditingTableId, setEditingTableName) => {
  setTables(prevTables => prevTables.map(table => 
    table.id === tableId ? { ...table, name: editingTableName } : table
  ));
  setEditingTableId(null);
  setEditingTableName('');
};

export const removeTable = (tableId, tables, setTables, guests, setGuests) => {
  const removedTable = tables.find(t => t.id === tableId);
  setTables(prevTables => prevTables.filter(table => table.id !== tableId));
  setGuests(prevGuests => [...prevGuests, ...removedTable.guests]);
};

export const removeGuestFromTable = (tableId, guestId, tables, setTables, guests, setGuests) => {
  const updatedTables = tables.map(table => {
    if (table.id === tableId) {
      return {
        ...table,
        guests: table.guests.filter(g => g.id !== guestId),
      };
    }
    return table;
  });
  const removedGuest = tables.find(t => t.id === tableId).guests.find(g => g.id === guestId);
  setTables(updatedTables);
  setGuests(prevGuests => [...prevGuests, removedGuest]);
};

export const canSitTogether = (tableGuests, newGuestId, compatibility) => {
  return !tableGuests.some(guest => compatibility[guest.id]?.[newGuestId] === 'bad');
};

export const addGuestToTable = (table, guest, tables, setTables, setGuests) => {
  setTables(prevTables => prevTables.map(t => 
    t.id === table.id && t.guests.length < t.seats
      ? { ...t, guests: [...t.guests, guest] }
      : t
  ));
  setGuests(prevGuests => prevGuests.filter(g => g.id !== guest.id));
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

  remainingGuests.forEach(guest => {
    const assignedTable = updatedTables.find(table => 
      table.guests.length < table.seats && canSitTogether(table.guests, guest.id, compatibility)
    );

    if (assignedTable) {
      assignedTable.guests.push(guest);
    } else {
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
  if (!result.destination) return;

  const { source, destination } = result;

  if (source.droppableId === 'guestList' && destination.droppableId === 'guestList') {
    const reorderedGuests = Array.from(guests);
    const [reorderedItem] = reorderedGuests.splice(source.index, 1);
    reorderedGuests.splice(destination.index, 0, reorderedItem);
    setGuests(reorderedGuests);
  } else if (source.droppableId === 'guestList' && destination.droppableId !== 'guestList') {
    const guestToMove = guests[source.index];
    const destinationTable = tables.find(table => table.id === destination.droppableId);

    if (destinationTable.guests.length >= destinationTable.seats) {
      setWarningMessage(`${destinationTable.name} ist voll.`);
      setShowWarning(true);
      return;
    }

    if (!canSitTogether(destinationTable.guests, guestToMove.id, compatibility)) {
      setWarningMessage(`${guestToMove.name} ist nicht kompatibel mit allen Gästen an ${destinationTable.name}.`);
      setShowWarning(true);
      setPendingGuest(guestToMove);
      setPendingTable(destinationTable);
      return;
    }

    setGuests(prevGuests => prevGuests.filter((_, index) => index !== source.index));
    setTables(prevTables => prevTables.map(table => 
      table.id === destination.droppableId
        ? {
            ...table,
            guests: [...table.guests.slice(0, destination.index), guestToMove, ...table.guests.slice(destination.index)]
          }
        : table
    ));
  } else if (source.droppableId !== 'guestList') {
    const sourceTable = tables.find(table => table.id === source.droppableId);
    const [movedGuest] = sourceTable.guests.splice(source.index, 1);

    if (destination.droppableId === 'guestList') {
      setGuests(prevGuests => [...prevGuests, movedGuest]);
    } else {
      const destinationTable = tables.find(table => table.id === destination.droppableId);

      if (destinationTable.guests.length >= destinationTable.seats) {
        setWarningMessage(`${destinationTable.name} ist voll.`);
        setShowWarning(true);
        sourceTable.guests.splice(source.index, 0, movedGuest);
        setTables([...tables]);
        return;
      }

      if (!canSitTogether(destinationTable.guests, movedGuest.id, compatibility)) {
        setWarningMessage(`${movedGuest.name} ist nicht kompatibel mit allen Gästen an ${destinationTable.name}.`);
        setShowWarning(true);
        setPendingGuest(movedGuest);
        setPendingTable(destinationTable);
        sourceTable.guests.splice(source.index, 0, movedGuest);
        setTables([...tables]);
        return;
      }

      destinationTable.guests.splice(destination.index, 0, movedGuest);
    }

    setTables([...tables]);
  }
};