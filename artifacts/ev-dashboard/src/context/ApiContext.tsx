import React, { createContext, useContext, useState } from 'react';

// 1. Define the mock data your dashboard UI needs to look realistic
interface MockDataType {
  batteryLevel: number;
  rangeKm: number;
  temperature: number;
  isCharging: boolean;
  speed: number;
}

interface ApiContextType {
  apiUrl: string;
  mockData: MockDataType; 
  updateMockData: (data: Partial<MockDataType>) => void;
}

// 2. Set default dummy values for your UI
const defaultMockData: MockDataType = {
  batteryLevel: 85,
  rangeKm: 340,
  temperature: 22,
  isCharging: false,
  speed: 0,
};

const ApiContext = createContext<ApiContextType>({
  apiUrl: 'mock-mode', // Disconnected from localhost
  mockData: defaultMockData,
  updateMockData: () => {},
});

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [mockData, setMockData] = useState<MockDataType>(defaultMockData);

  // A function allowing UI buttons (like climate control) to change the fake state
  const updateMockData = (newData: Partial<MockDataType>) => {
    setMockData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <ApiContext.Provider value={{ apiUrl: 'mock-mode', mockData, updateMockData }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  return useContext(ApiContext);
}
