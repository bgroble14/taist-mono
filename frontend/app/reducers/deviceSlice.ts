import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {IChefProfile, IUser} from '../types';

interface DeviceInterface {
  notification_id: string;
  notification_order_id: number;
}

const initialState: DeviceInterface = {
  notification_id: '',
  notification_order_id: -1,
};

export const deviceSlice = createSlice({
  initialState,
  name: 'device',
  reducers: {
    setNotificationOrderId: (state, action: PayloadAction<DeviceInterface>) => {
      state.notification_id = action.payload.notification_id;
      state.notification_order_id = action.payload.notification_order_id;
    },
  },
});

export const {setNotificationOrderId} = deviceSlice.actions;
export default deviceSlice.reducer;
