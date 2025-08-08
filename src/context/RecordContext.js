// src/context/RecordContext.js

import React, { createContext, useState } from 'react';

export const RecordContext = createContext({
  records: [],
  addRecord: () => {}
});

export function RecordProvider({ children }) {
  const [records, setRecords] = useState([]);

  // record = { id, patientId, date, registration, consultation }
  const addRecord = record => {
    setRecords(prev => [...prev, { ...record, id: Date.now().toString() }]);
  };

  return (
    <RecordContext.Provider value={{ records, addRecord }}>
      {children}
    </RecordContext.Provider>
  );
}