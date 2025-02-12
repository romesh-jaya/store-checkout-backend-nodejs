export type User = {
  id?: number;
  email: string;
  password_hash: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
};
