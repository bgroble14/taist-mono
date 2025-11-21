export default interface ChefProfileInterface {
  id?: number;
  user_id?: number;
  bio?: string;
  monday_start?: number;
  monday_end?: number;
  tuesday_start?: number;
  tuesday_end?: number;
  wednesday_start?: number;
  wednesday_end?: number;
  thursday_start?: number;
  thursday_end?: number;
  friday_start?: number;
  friday_end?: number;
  saterday_start?: number;
  saterday_end?: number;
  sunday_start?: number;
  sunday_end?: number;
  minimum_order_amount?: number;
  max_order_distance?: number;
  created_at?: number;
  updated_at?: number;
}
