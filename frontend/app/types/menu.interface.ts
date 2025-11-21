import {IMenuCustomization} from '.';

export default interface MenuInterface {
  id?: number;
  user_id?: number;
  title?: string;
  description?: string;
  price?: number;
  serving_size?: number;
  meals?: string;
  category_ids?: string;
  allergens?: string;
  appliances?: string;
  estimated_time?: number;
  is_live?: number;
  customizations?: Array<IMenuCustomization>;
  created_at?: number;
  updated_at?: number;
}
