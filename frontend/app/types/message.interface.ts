export default interface MessageInterface {
  id?: number;
  order_id?: number;
  from_user_id?: number;
  to_user_id?: number;
  message?: string;
  is_viewed?: number;
  created_at?: number;
  updated_at?: number;
}
