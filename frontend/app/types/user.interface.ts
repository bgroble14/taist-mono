export default interface UserInterface {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  birthday?: number;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  user_type?: number;
  is_pending?: number;
  verified?: number;
  photo?: string;
  social?: string;
  applicant_guid?: string;
  token_date?: string;
  created_at?: number;
  updated_at?: number;

  remember?: boolean;
  password?: string;
}
