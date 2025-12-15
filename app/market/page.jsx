// app/market/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, Sprout, Egg, Bird, Radius, Phone } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';

const FarmCard = ({ farm }) => {
    return (
        <div className="card p-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <h3 className="font-bold text-lg">{farm.name}</h3>
                <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] mt-1">
                    <MapPin size={14} />
                    <span>{farm.distance.toFixed(2)} km away</span>
                </div>
                 <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] mt-1">
                    <Phone size={14} />
                    <a href={`tel:${farm.farmerPhone}`} className="hover:text-[color:var(--primary)]">{farm.farmerPhone}</a>
                </div>
                <div className="mt-2 text-sm">
                    <p><strong>Farmer:</strong> {farm.farmerName}</p>
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="flex flex-wrap gap-2 justify-end">
                    {farm.hasEggsAvailable && <span className="badge-success"><Egg size={14} /> Eggs</span>}
                    {farm.birdsForSale?.includes('Broilers') && <span className="badge-info"><Bird size={14} /> Broilers</span>}
                    {farm.birdsForSale?.includes('Layers') && <span className="badge-warning"><Bird size={14} /> Layers</span>}
                    {farm.birdsForSale?.includes('Breeders') && <span className="badge-danger"><Sprout size={14} /> Breeders</span>}
                </div>
                {farm.avgCratePrice && (
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        ~${farm.avgCratePrice.toFixed(2)} / crate
                    </p>
                )}
            </div>
        </div>
    );
};

export default function MarketPage() {
    const [location, setLocation] = useState(null);
    const [radius, setRadius] = useState(25); // Default 25km
    const [availability, setAvailability] = useState({
        eggs: false,
        broilers: false,
        layers: false,
        breeders: false,
    });
    const [farms, setFarms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { addNotification } = useNotification();

    useEffect(() => {
        // Automatically get user's location on page load
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    addNotification('Location found!', 'success');
                },
                (err) => {
                    setError('Geolocation permission denied. Please enable it in your browser settings to find nearby farms.');
                    addNotification('Could not get your location.', 'error');
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
            addNotification('Geolocation not supported.', 'error');
        }
    }, [addNotification]);
    
    const handleSearch = useCallback(async () => {
        if (!location) {
            addNotification('Cannot search without your location.', 'warning');
            return;
        }
        setIsLoading(true);
        setError(null);
        setFarms([]);

        try {
            const filters = Object.entries(availability)
                .filter(([, value]) => value)
                .map(([key]) => key);
            
            const query = new URLSearchParams({
                latitude: location.latitude,
                longitude: location.longitude,
                radius,
                availability: filters.join(','),
            });

            const res = await fetch(`/api/farms/nearby?${query}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to fetch farms.');
            }
            const data = await res.json();
            setFarms(data.farms);
            if(data.farms.length === 0){
                addNotification('No farms found matching your criteria.', 'info');
            }
        } catch (err) {
            setError(err.message);
            addNotification(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [location, radius, availability, addNotification]);
    
    const handleAvailabilityChange = (e) => {
        setAvailability({
            ...availability,
            [e.target.name]: e.target.checked,
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Find Nearby Farms</h1>

            <div className="card p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="radius" className="font-medium flex items-center gap-2 mb-2">
                            <Radius size={18} /> Search Radius: <span className="font-bold text-[color:var(--primary)]">{radius} km</span>
                        </label>
                        <input
                            id="radius"
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="font-medium flex items-center gap-2 mb-2">
                           <Sprout size={18} /> Available for Sale
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                           {Object.keys(availability).map((item) => (
                               <label key={item} className="flex items-center gap-2 cursor-pointer">
                                   <input
                                       type="checkbox"
                                       name={item}
                                       checked={availability[item]}
                                       onChange={handleAvailabilityChange}
                                       className="h-4 w-4 rounded border-gray-300 text-[color:var(--primary)] focus:ring-[color:var(--primary)]"
                                   />
                                   <span className="capitalize">{item}</span>
                               </label>
                           ))}
                        </div>
                    </div>
                </div>
                 <div className="flex justify-end">
                    <button
                        onClick={handleSearch}
                        className="btn-primary flex items-center gap-2"
                        disabled={isLoading || !location}
                    >
                        <Search size={18} />
                        {isLoading ? 'Searching...' : 'Search Nearby'}
                    </button>
                </div>
            </div>

            {error && <div className="p-4 text-center text-red-600 bg-red-100 dark:bg-red-900/20 rounded-lg">{error}</div>}

            <div className="space-y-4">
                {isLoading && <LoadingSpinner />}
                {!isLoading && farms.length > 0 && (
                    <p className="text-sm text-[color:var(--muted-foreground)]">Found {farms.length} farm(s) within {radius}km.</p>
                )}
                {farms.map(farm => <FarmCard key={farm.id} farm={farm} />)}
                {!isLoading && farms.length === 0 && !error && (
                     <div className="text-center p-8">
                        <h2 className="text-xl font-semibold">Ready to Search?</h2>
                        <p className="mt-2 text-[color:var(--muted-foreground)]">Adjust the filters above and click search to find farms near you.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
