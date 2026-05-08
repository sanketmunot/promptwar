"use client";

import React from 'react';
import { Form, Input, InputNumber, DatePicker, Button, message } from 'antd';
import { TravelFormData } from '@/types';
import { generateItinerary } from '@/services/geminiService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface TravelFormProps {
  onSuccess: (itinerary: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const TravelForm: React.FC<TravelFormProps> = ({ onSuccess, loading, setLoading }) => {
  const [form] = Form.useForm();

  const onFinish = async (values: TravelFormData) => {
    try {
      setLoading(true);
      const startDate = values.dates[0].format('YYYY-MM-DD');
      const endDate = values.dates[1].format('YYYY-MM-DD');
      
      const itinerary = await generateItinerary(
        values.destination,
        startDate,
        endDate,
        values.budget
      );
      
      onSuccess(itinerary);
      message.success('Itinerary generated successfully!');
    } catch (error: any) {
      message.error(error.message || 'Failed to generate itinerary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <Form.Item
            name="destination"
            label={<span className="text-gray-700 font-medium">Destination</span>}
            rules={[{ required: true, message: 'Please enter a destination!' }]}
          >
            <Input size="large" placeholder="e.g. Tokyo, Japan" className="rounded-lg h-11" />
          </Form.Item>

          <Form.Item
            name="budget"
            label={<span className="text-gray-700 font-medium">Budget (USD)</span>}
            rules={[
              { required: true, message: 'Please enter your budget!' },
              { type: 'number', min: 1, message: 'Budget must be greater than 0!' }
            ]}
          >
            <InputNumber size="large" placeholder="e.g. 1500" className="w-full rounded-lg h-11" prefix="$" />
          </Form.Item>

          <Form.Item
            name="dates"
            label={<span className="text-gray-700 font-medium">Travel Dates</span>}
            rules={[{ required: true, message: 'Please select your travel dates!' }]}
            className="md:col-span-2"
          >
            <RangePicker 
              size="large" 
              className="w-full rounded-lg h-11" 
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </div>

        <Form.Item className="mb-0 mt-6">
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            loading={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-lg h-12 text-base font-semibold border-none shadow-md hover:shadow-lg transition-all"
          >
            Generate Itinerary
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
