export interface ParameterItem {
  id: string;
  name: string;
  category: 'composition' | 'metabolic' | 'segmental' | 'risk';
  unit: string;
  description: string;
  businessImpact: string;
  iconName: string;
}

export interface PricingTier {
  id: string;
  name: string;
  capacityLabel: string;
  pricePerEmp: number;
  formattedPrice: string;
  durationDays: string;
  timePerEmp: string;
  locations: string;
  curators: string;
  features: string[];
  popular?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'privacy' | 'audit' | 'reports';
}

export interface ProcessStep {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  deliverable: string;
}

export interface LeadFormData {
  name: string;
  company: string;
  phone: string;
  email: string;
  comment: string;
  employeeCount?: string;
}
