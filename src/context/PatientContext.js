import React, { createContext, useState } from 'react';

export const PatientContext = createContext({
  patients: [],
  addPatient: () => {},
  updatePatient: () => {},
  removePatient: () => {}
});

export function PatientProvider({ children }) {
  const [patients, setPatients] = useState([]);

  const addPatient = patient => {
    setPatients(prev => [
      ...prev,
      { id: Date.now().toString(), ...patient }
    ]);
  };

  const updatePatient = (id, fields) => {
    setPatients(prev =>
      prev.map(p => (p.id === id ? { ...p, ...fields } : p))
    );
  };

  const removePatient = id => {
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PatientContext.Provider
      value={{ patients, addPatient, updatePatient, removePatient }}
    >
      {children}
    </PatientContext.Provider>
  );
}