export type Role = 'villager' | 'health_worker';

export interface UserProfile {
  name: string;
  village: string;
  avatar: string;
}

export type WaterStatus = 'safe' | 'caution' | 'unsafe';

export interface Village {
  id: number;
  name: string;
  status: WaterStatus;
  lastChecked: string;
  lat: number;
  lng: number;
}

export interface SymptomReport {
  id: number;
  village: string;
  symptoms: string;
  notes?: string;
  photo?: string; // base64 encoded image
  reportedAt: string;
  resolved: boolean;
}

export interface Tip {
  id: number;
  icon: string;
  title: string;
  description: string;
  steps: string[];
}

export type ThreatLevel = 'low' | 'moderate' | 'high';
export type Trend = 'increasing' | 'decreasing' | 'stable';

export interface DiseaseTrend {
    id: number;
    name: string;
    cases: number;
    trend: Trend;
    threatLevel: ThreatLevel;
}

export interface WaterQualityMetrics {
    ph: { value: number; status: WaterStatus };
    turbidity: { value: number; status: WaterStatus };
    temperature: { value: number; status: WaterStatus };
}

export interface Symptom {
  name: string;
  iconName: 'ThermometerIcon' | 'StomachIcon' | 'HeadacheIcon';
}

export interface QualityHistory {
    day: string;
    status: WaterStatus;
}

export interface SensorData {
    ph: number;
    turbidity: number;
    temperature: number;
}

export interface SensorHealth {
    status: 'good' | 'warning' | 'error';
    message: string;
}