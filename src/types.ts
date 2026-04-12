export type ItemType = 'outlet' | 'switch' | 'light' | 'appliance' | 'other';
export type PropertyType = 'residential' | 'commercial';

export interface MappedItem {
  id: string;
  name: string;
  type: ItemType;
  room: string;
  notes?: string;
}

export interface WorkItem {
  id: string;
  description: string;
  status: 'requested' | 'todo' | 'done';
  createdAt: number;
}

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'invoice';
  url?: string;
  date: number;
  mimeType?: string;
  sizeBytes?: number;
  extension?: string;
}

export interface Breaker {
  id: string;
  number: number;
  label: string;
  amperage: 15 | 20 | 30 | 40 | 50 | 60 | 100 | 125 | 200;
  isDoublePole: boolean;
  phase?: 'A' | 'B' | 'C'; // Commercial specific
  items: MappedItem[];
}

export interface Panel {
  id: string;
  name: string;
  location: string;
  voltage?: '120/240' | '120/208' | '277/480';
  phase?: 1 | 3;
  breakers: Breaker[];
}

export interface House {
  id: string;
  address: string;
  clientName: string;
  propertyType: PropertyType;
  panels: Panel[];
  workItems: WorkItem[];
  documents: Document[];
  createdAt: number;
  notes?: string;
  foremanName?: string; // Commercial
  homeownerContact?: string; // Residential
}

export type View = 'dashboard' | 'house-detail' | 'calculator' | 'settings';
