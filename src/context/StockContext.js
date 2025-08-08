import React, { createContext, useState } from 'react';
import medicinesData from '../data/medicines';

export const StockContext = createContext();

export function StockProvider({ children }) {
  const [stock, setStock] = useState(medicinesData);
  return (
    <StockContext.Provider value={{ stock, setStock }}>
      {children}
    </StockContext.Provider>
  );
}