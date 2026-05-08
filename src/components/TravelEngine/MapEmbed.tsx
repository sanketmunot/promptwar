"use client";

import React from 'react';

interface MapEmbedProps {
  destination: string;
}

export const MapEmbed: React.FC<MapEmbedProps> = ({ destination }) => {
  return (
    <div className="w-full h-64 md:h-80 bg-gray-200">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={`https://maps.google.com/maps?q=${encodeURIComponent(destination)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
      />
    </div>
  );
};
