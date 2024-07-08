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
  