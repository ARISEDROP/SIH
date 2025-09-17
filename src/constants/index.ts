import { WaterStatus, Village, SymptomReport, Tip, DiseaseTrend, WaterQualityMetrics, Symptom, QualityHistory } from '../types';

export const villageData: Village[] = [
  { id: 1, name: 'Tawang', status: 'safe', lastChecked: '2h ago', lat: 27.58, lng: 91.85 },
  { id: 2, name: 'Ziro', status: 'caution', lastChecked: '1h ago', lat: 27.63, lng: 93.83 },
  { id: 3, name: 'Majuli', status: 'safe', lastChecked: '5h ago', lat: 26.91, lng: 94.13 },
  { id: 4, name: 'Pasighat', status: 'unsafe', lastChecked: '30m ago', lat: 28.07, lng: 95.33 },
  { id: 5, name: 'Namsai', status: 'safe', lastChecked: '8h ago', lat: 27.67, lng: 95.86 },
  { id: 6, name: 'Daporijo', status: 'caution', lastChecked: '4h ago', lat: 27.98, lng: 94.22 },
];

export const reportedSymptomsData: SymptomReport[] = [
    { id: 1, village: 'Pasighat', symptoms: 'Vomiting, Fever', reportedAt: '45m ago', resolved: false, notes: 'Started after drinking from the community well.', userName: 'Rohan Das', userAvatar: 'https://i.pravatar.cc/150?u=rohandas' },
    { id: 2, village: 'Ziro', symptoms: 'Diarrhea', reportedAt: '2h ago', resolved: false, userName: 'Priya Rai', userAvatar: 'https://i.pravatar.cc/150?u=priyarai' },
    { id: 3, village: 'Daporijo', symptoms: 'Stomach Cramps', reportedAt: '5h ago', resolved: true, userName: 'Anjali Tamang', userAvatar: 'https://i.pravatar.cc/150?u=anjalitamang' },
    { id: 4, village: 'Pasighat', symptoms: 'Fever', reportedAt: '1d ago', resolved: true, userName: 'Vikram Singh', userAvatar: 'https://i.pravatar.cc/150?u=vikramsingh' },
];

export const quickActionTips: Tip[] = [
    { 
        id: 1, 
        icon: '🔥', 
        title: 'Boil Water Guide', 
        description: 'The safest way to purify water from harmful germs.',
        steps: [
            "1. Filter cloudy water through a clean cloth or let it settle.",
            "2. Bring the clear water to a rolling boil.",
            "3. Keep it boiling for at least 1 full minute.",
            "4. Let the water cool down on its own before drinking.",
            "5. Store the boiled water in a clean, covered container."
        ]
    },
    { 
        id: 2, 
        icon: '🧼', 
        title: 'Hand Washing Steps', 
        description: 'Prevent illness with proper hand hygiene.',
        steps: [
            "1. Wet your hands with clean, running water.",
            "2. Lather your hands by rubbing them together with soap.",
            "3. Scrub all surfaces, including backs of hands, wrists, between fingers, and under nails.",
            "4. Continue scrubbing for at least 20 seconds.",
            "5. Rinse hands well under clean, running water.",
            "6. Dry your hands using a clean towel."
        ]
    },
    { 
        id: 3, 
        icon: '🍎', 
        title: 'Safe Food Prep', 
        description: 'Keep your food safe from contamination.',
        steps: [
            "1. Wash fruits and vegetables thoroughly with safe, clean water.",
            "2. Use separate cutting boards and utensils for raw meat and other foods.",
            "3. Cook food to the proper temperature to kill any harmful bacteria.",
            "4. Keep food covered to protect it from flies and pests.",
            "5. Store perishable food in a cool place or refrigerator if available."
        ]
    },
];

export const diseaseTrendsData: DiseaseTrend[] = [
    { id: 1, name: 'Cholera', cases: 12, trend: 'increasing', threatLevel: 'high' },
    { id: 2, name: 'Typhoid', cases: 8, trend: 'stable', threatLevel: 'moderate' },
    { id: 3, name: 'Diarrhea', cases: 25, trend: 'decreasing', threatLevel: 'low' },
];

export const waterQualityMetrics: WaterQualityMetrics = {
    ph: { value: 7.8, status: 'safe' },
    turbidity: { value: 6.2, status: 'caution' },
    temperature: { value: 22, status: 'safe' },
};


/**
 * Generates random water quality metrics based on a given status.
 * @param status The water quality status.
 * @returns A WaterQualityMetrics object with randomized values.
 */
export const generateRandomMetrics = (status: WaterStatus): WaterQualityMetrics => {
  const randomFloat = (min: number, max: number, decimals: number = 1) => {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
  };

  switch (status) {
    case 'safe':
      return {
        ph: { value: randomFloat(6.8, 7.8), status: 'safe' },
        turbidity: { value: randomFloat(0.5, 4.5), status: 'safe' },
        temperature: { value: randomFloat(18, 24), status: 'safe' },
      };
    case 'caution':
      return {
        ph: { value: randomFloat(6.0, 6.7), status: 'caution' },
        turbidity: { value: randomFloat(5.0, 9.0), status: 'caution' },
        temperature: { value: randomFloat(25, 29), status: 'safe' },
      };
    case 'unsafe':
    default:
      return {
        ph: { value: randomFloat(8.6, 9.5), status: 'unsafe' },
        turbidity: { value: randomFloat(10.0, 20.0), status: 'unsafe' },
        temperature: { value: randomFloat(30, 35), status: 'caution' },
      };
  }
};

export const commonSymptoms: Symptom[] = [
  { name: 'Fever', iconName: 'ThermometerIcon' },
  { name: 'Vomiting', iconName: 'StomachIcon' },
  { name: 'Diarrhea', iconName: 'StomachIcon' },
  { name: 'Stomach Cramps', iconName: 'StomachIcon' },
  { name: 'Headache', iconName: 'HeadacheIcon' },
];

export const waterQualityHistory: QualityHistory[] = [
    { day: '4d ago', status: 'safe' },
    { day: '3d ago', status: 'safe' },
    { day: '2d ago', status: 'safe' },
    { day: 'Yesterday', status: 'caution' },
    { day: 'Today', status: 'caution' },
];
