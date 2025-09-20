import React, { createContext, useContext } from 'react';

const InitialDataContext = createContext({});

export const useInitialData = () => {
  return useContext(InitialDataContext);
};

export const InitialDataProvider = ({ children, value = {} }) => {
  return (
    <InitialDataContext.Provider value={value}>
      {children}
    </InitialDataContext.Provider>
  );
};

export { InitialDataContext };
