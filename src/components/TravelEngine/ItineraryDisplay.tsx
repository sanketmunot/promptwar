"use client";

import React from 'react';
import { Card, Tag, Typography, Timeline, Badge } from 'antd';
import { Itinerary } from '@/types';
import { MapEmbed } from './MapEmbed';

const { Title, Text } = Typography;

interface ItineraryDisplayProps {
  itinerary: Itinerary;
}

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <MapEmbed destination={itinerary.destination} />
      
      <div className="p-6 md:p-8">
        <Title level={2} className="!mt-0 !mb-3 text-gray-800">
          {itinerary.destination}
        </Title>
        <div className="flex flex-wrap gap-3 mb-10">
          <Tag color="blue" className="px-4 py-1.5 text-sm rounded-full font-medium border-none bg-blue-50 text-blue-700">
            {itinerary.totalDays} Days
          </Tag>
          <Tag color="green" className="px-4 py-1.5 text-sm rounded-full font-medium border-none bg-emerald-50 text-emerald-700">
            Est. Cost: ${itinerary.estimatedCost}
          </Tag>
        </div>

        <div className="space-y-8">
          {itinerary.days?.map((dayPlan, idx) => (
            <Card 
              key={idx} 
              title={
                <span className="text-xl font-bold text-indigo-700">
                  Day {dayPlan.day}: {dayPlan.title}
                </span>
              }
              className="shadow-sm border-gray-100 rounded-xl overflow-hidden"
              styles={{
                header: { backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9', padding: '16px 24px' },
                body: { padding: '24px' }
              }}
            >
              <Timeline
                items={dayPlan.activities?.map((act) => ({
                  color: '#4f46e5',
                  children: (
                    <div className="flex justify-between items-start ml-2 mb-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="pr-4">
                        <Text strong className="block text-gray-800 text-base mb-1">{act.time}</Text>
                        <Text className="text-gray-600 leading-relaxed">{act.activity}</Text>
                      </div>
                      <Badge 
                        count={`$${act.cost}`} 
                        className="mt-1 flex-shrink-0"
                        style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', boxShadow: 'none' }} 
                      />
                    </div>
                  )
                }))}
              />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
