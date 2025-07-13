"use client";

import { useState, createContext, useContext } from "react";

// Tab Context
const TabContext = createContext();

// Main Tabs Container
export function TabsContainer({ children, defaultIndex = 0, onChange }) {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  const handleTabChange = (index) => {
    setSelectedIndex(index);
    if (onChange) {
      onChange(index);
    }
  };

  return (
    <TabContext.Provider value={{ selectedIndex, handleTabChange }}>
      {children}
    </TabContext.Provider>
  );
}

// Tab List (container for tab buttons)
export function TabList({ children, className = "" }) {
  return <div className={`flex ${className}`}>{children}</div>;
}

// Individual Tab Button
export function Tab({ children, index, className = "", activeClassName = "", inactiveClassName = "" }) {
  const { selectedIndex, handleTabChange } = useContext(TabContext);
  const isSelected = selectedIndex === index;

  return (
    <button
      type="button"
      className={`${className} ${isSelected ? activeClassName : inactiveClassName}`}
      onClick={() => handleTabChange(index)}
    >
      {children}
    </button>
  );
}

// Tab Panels Container
export function TabPanels({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

// Individual Tab Panel
export function TabPanel({ children, index, className = "" }) {
  const { selectedIndex } = useContext(TabContext);
  
  if (selectedIndex !== index) {
    return null;
  }
  
  return <div className={className}>{children}</div>;
}