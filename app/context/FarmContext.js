
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

  const userType = session?.user?.userType;

  const selectFarm = useCallback(async (farmId) => {
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
    }
  }, []);

  const fetchFarms = useCallback(async () => {
    if (session && userType === 'FARMER') {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/farms');
        if (!response.ok) {
          throw new Error('Failed to fetch farms');
        }
        const userFarms = await response.json();
        setFarms(userFarms);

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
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [session, userType, selectFarm]);

  useEffect(() => {
    if (status !== 'loading') {
      fetchFarms();
    }
  }, [status, fetchFarms]);

  if (status === 'loading' || (isLoading && userType === 'FARMER')) {
    return <LoadingSpinner fullScreen={true} />;
  }

  const farmerValue = {
    farms,
    currentFarm,
    setCurrentFarm: selectFarm,
    refreshFarms: fetchFarms,
    isLoading,
  };

  const nonFarmerValue = {
    farms: [],
    currentFarm: null,
    setCurrentFarm: () => {},
    refreshFarms: () => {},
    isLoading: false,
  };

  const contextValue = (userType === 'FARMER') ? farmerValue : nonFarmerValue;

  return (
    <FarmContext.Provider value={contextValue}>
      {children}
    </FarmContext.Provider>
  );
};

