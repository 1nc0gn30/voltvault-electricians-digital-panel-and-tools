import { useState, useEffect } from 'react';
import { House } from '../types';

export function useLocalStorage() {
  const [houses, setHouses] = useState<House[]>(() => {
    const saved = localStorage.getItem('volt-vault-houses');
    const parsed: House[] = saved ? JSON.parse(saved) : [];
    // Migration: ensure all houses have required arrays
    return parsed.map(h => ({
      ...h,
      panels: h.panels || [],
      workItems: h.workItems || [],
      documents: h.documents || []
    }));
  });

  useEffect(() => {
    localStorage.setItem('volt-vault-houses', JSON.stringify(houses));
  }, [houses]);

  const addHouse = (house: House) => {
    setHouses([...houses, house]);
  };

  const updateHouse = (updatedHouse: House) => {
    setHouses(houses.map(h => h.id === updatedHouse.id ? updatedHouse : h));
  };

  const deleteHouse = (id: string) => {
    setHouses(houses.filter(h => h.id !== id));
  };

  return { houses, addHouse, updateHouse, deleteHouse };
}
