"use client";

import React, { useState, useEffect } from 'react';
import { TravelForm } from '@/components/TravelEngine/TravelForm';
import { ItineraryDisplay } from '@/components/TravelEngine/ItineraryDisplay';
import { Itinerary } from '@/types';
import { Button, message, Layout } from 'antd';

const { Content } = Layout;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    if (plan) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(plan)));
        setItinerary(decoded);
      } catch (e) {
        console.error("Invalid shareable link", e);
        message.error("Failed to load shared itinerary");
      }
    }
  }, []);

  const handleShare = () => {
    if (!itinerary) return;
    try {
      const base64 = btoa(encodeURIComponent(JSON.stringify(itinerary)));
      const url = `${window.location.origin}${window.location.pathname}?plan=${base64}`;
      navigator.clipboard.writeText(url);
      message.success("Shareable link copied to clipboard!");
    } catch (e) {
      message.error("Failed to generate link");
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50 font-sans">
      <Content className="p-4 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 mt-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 tracking-tight mb-4">
              Dynamic Travel Engine
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Plan your next adventure with AI-powered itineraries. Enter your destination, budget, and dates to get started.
            </p>
          </div>
          
          <TravelForm 
            onSuccess={setItinerary} 
            loading={loading} 
            setLoading={setLoading} 
          />

          {itinerary && (
            <div className="mt-8 transition-all duration-500 ease-in-out">
              <div className="flex justify-end mb-6">
                <Button 
                  type="default" 
                  size="large"
                  onClick={handleShare}
                  className="rounded-lg shadow-sm text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-medium"
                >
                  🔗 Share Itinerary
                </Button>
              </div>
              <ItineraryDisplay itinerary={itinerary} />
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}
