export interface Activity {
  time: string;
  activity: string;
  cost: number;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Itinerary {
  destination: string;
  totalDays: number;
  estimatedCost: number;
  days: DayPlan[];
}

export interface TravelFormData {
  destination: string;
  dates: [any, any];
  budget: number;
}
