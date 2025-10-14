'use client';
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LeafletMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    console.log('Initializing Leaflet map...');
    if (mapRef.current && !mapInstance.current) {
      try {
        mapInstance.current = L.map(mapRef.current, {
          center: [-6.368747666740396, 106.73817164047911],
          zoom: 15,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance.current);

        L.marker([-6.368747666740396, 106.73817164047911])
          .addTo(mapInstance.current)
          .bindPopup('Lokasi Sekolah')
          .openPopup();

        console.log('Map and marker initialized successfully');
      } catch (error) {
        console.error('Error initializing Leaflet map:', error);
      }
    }

    return () => {
      if (mapInstance.current) {
        console.log('Cleaning up Leaflet map');
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-96 rounded-lg"
      style={{ position: 'relative', zIndex: 0, background: '#e0e0e0' }}
    ></div>
  );
};

export default LeafletMap;