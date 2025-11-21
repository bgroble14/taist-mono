export default interface PaymentInterface {
  id?: number;
  user_id?: number;
  zip?: string;
  card_token?: string;
  card_type?: string;
  last4?: string;
  stripe_cus_id?: string;
  stripe_account_id?: string;
  active?: number;
  created_at?: number;
  updated_at?: number;
}
