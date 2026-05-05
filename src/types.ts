export type UserRole = 'student' | 'technician' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
}

export type TicketStatus = 'New' | 'Approved' | 'Declined' | 'In Progress' | 'Resolved';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: TicketStatus;
  image?: string;
  created_by: string;
  created_by_name: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
