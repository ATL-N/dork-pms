
// app/context/FarmContext.js
"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '../components/LoadingSpinner';

const FarmContext = createContext();

export const useFarm = () => useContext(FarmContext);

export const FarmProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [farms, setFarms] = useState([]);
  const [currentFarm, setCurrentFarm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFarms = useCallback(async () => {
    if (session) {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/farms');
        if (!response.ok) {
          throw new Error('Failed to fetch farms');
        }
        const userFarms = await response.json();
        setFarms(userFarms);

        // Check local storage for the last selected farm
        const lastSelectedFarmId = localStorage.getItem('currentFarmId');
        
        if (lastSelectedFarmId && userFarms.some(f => f.id === lastSelectedFarmId)) {
          await selectFarm(lastSelectedFarmId);
        } else if (userFarms.length > 0) {
          await selectFarm(userFarms[0].id);
        } else {
          setCurrentFarm(null);
        }
      } catch (error) {
        console.error("Farm context error:", error);
        // Handle error (e.g., show notification)
      } finally {
        setIsLoading(false);
      }
    } else if (status === 'unauthenticated') {
        setIsLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  const selectFarm = async (farmId) => {
    try {
        const response = await fetch(`/api/farms/${farmId}/details`);
        if (!response.ok) {
            throw new Error('Failed to fetch farm details');
        }
        const farmDetails = await response.json();
        setCurrentFarm(farmDetails);
        localStorage.setItem('currentFarmId', farmId);
    } catch (error) {
        console.error("Failed to select farm:", error);
        // Handle error
    }
  };

  const value = {
    farms,
    currentFarm,
    setCurrentFarm: selectFarm,
    refreshFarms: fetchFarms,
    isLoading,
  };

  if (isLoading && status === 'loading') {
      return <LoadingSpinner fullScreen={true} />;
  }

  return (
    <FarmContext.Provider value={value}>
      {children}
    </FarmContext.Provider>
  );
};

