import React, { createContext, useContext, useState } from 'react';

interface DrawerContextType {
  toggleDrawer: () => void;
  isDrawerOpen: boolean;
}

const DrawerContext = createContext<DrawerContextType | null>(null);

export const useDrawerContext = () => {
  const context = useContext(DrawerContext);
  return context;
};

interface DrawerProviderProps {
  children: React.ReactNode;
}

export const DrawerProvider: React.FC<DrawerProviderProps> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <DrawerContext.Provider value={{ toggleDrawer, isDrawerOpen }}>
      {children}
      {/* Add your drawer modal/overlay here if needed */}
    </DrawerContext.Provider>
  );
};
