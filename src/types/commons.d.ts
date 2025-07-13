export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  custom_id: string | null;
}

export interface Module {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  path?: string;
  adminOnly?: boolean;
}
