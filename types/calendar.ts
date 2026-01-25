// Calendar entry types for unified financial activity timeline

export type CalendarEntryType = 'expense' | 'income' | 'work' | 'travel' | 'note' | 'invoice';

export interface WorkEntry {
  id: string;
  date: string;
  startTime: string; // HH:mm format
  endTime?: string; // HH:mm format
  clientName?: string;
  projectName?: string;
  description: string;
  hours?: number; // calculated or manual
  billable?: boolean;
  rate?: number; // hourly rate if billable
}

export interface TravelEntry {
  id: string;
  date: string;
  destination: string;
  purpose: string;
  startDate?: string; // for multi-day trips
  endDate?: string;
  cost?: number;
  notes?: string;
}

export interface NoteEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  tags?: string[];
}

// Calendar Event for unified display
export interface CalendarEvent {
  id: string;
  type: CalendarEntryType;
  refId?: string; // reference to invoice/expense/work/travel/note id
  dateStart: string;
  dateEnd?: string;
  title: string;
  amount?: number;
  color: string; // hex color code
}

// Unified calendar entry
export interface CalendarEntry {
  id: string;
  type: CalendarEntryType;
  date: string;
  // Union of all entry types
  data: WorkEntry | TravelEntry | NoteEntry | any; // any for expense/invoice compatibility
}
