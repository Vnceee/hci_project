import React, { createContext, useContext } from 'react';

interface ApiContextType {
  apiUrl: string;
}

const ApiContext = createContext<ApiContextType>({
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <ApiContext.Provider value={{ apiUrl }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  return useContext(ApiContext);
}
