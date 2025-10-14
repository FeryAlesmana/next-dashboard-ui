'use client';
import React from 'react';

const LocationMap: React.FC = () => {
  return (
    <section id="location" className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-white mb-12 drop-shadow">
          Lokasi Sekolah
        </h2>
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 shadow-lg">
          <iframe
            className="w-full h-96 rounded-lg"
            
            src="https://www.openstreetmap.org/export/embed.html?bbox=106.7365%2C-6.3700%2C106.7398%2C-6.3675&layer=mapnik&marker=-6.368747666740396%2C106.73817164047911"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;