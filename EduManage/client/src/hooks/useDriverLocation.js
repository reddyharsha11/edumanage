import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

/**
 * Reverse-geocodes lat/lng using OpenStreetMap Nominatim (free, no key).
 * Returns a short human-readable place name.
 */
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const a = data.address;
    // Build a short readable label: neighbourhood / suburb / city
    const parts = [
      a.neighbourhood || a.quarter || a.hamlet,
      a.suburb || a.village || a.town,
      a.city || a.county,
    ].filter(Boolean);
    return parts.slice(0, 2).join(', ') || data.display_name?.split(',')[0] || 'Current Location';
  } catch {
    return 'Location detected';
  }
}

export function useDriverLocation(isOnDuty, routeId) {
  const [location, setLocation] = useState(null);       // { lat, lng, accuracy }
  const [placeName, setPlaceName] = useState(null);     // human-readable address
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const intervalRef = useRef(null);

  const updateLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser.');
      return;
    }
    setIsFetching(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocation({ lat: latitude, lng: longitude, accuracy });
        setError(null);
        setLastUpdated(new Date());

        // Reverse-geocode in parallel with API save
        const [name] = await Promise.all([
          reverseGeocode(latitude, longitude),
          routeId
            ? api.post('/driver/location/update', { route_id: routeId, latitude, longitude, accuracy }).catch(() => {})
            : Promise.resolve(),
        ]);
        setPlaceName(name);
        setIsFetching(false);
      },
      () => {
        setError('Location access denied. Please enable GPS in browser settings.');
        setIsFetching(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [routeId]);

  useEffect(() => {
    if (!isOnDuty) {
      clearInterval(intervalRef.current);
      return;
    }
    updateLocation();
    intervalRef.current = setInterval(updateLocation, 5 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, [isOnDuty, updateLocation]);

  return { location, placeName, error, lastUpdated, isFetching, updateLocation };
}
