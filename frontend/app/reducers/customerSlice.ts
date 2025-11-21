import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {IOrder} from '../types/index';

interface CustomerState {
  orders: Array<IOrder>;
}

const initialState: CustomerState = {
  orders: [],
};

const getNewArr = (oldArr: Array<any>, payloadArr: Array<any>) => {
  var arr = [...oldArr];
  payloadArr.map((item, index) => {
    const sameIndex = arr.findIndex(
      x => x.id === item.id && x.id !== undefined,
    );
    if (sameIndex == -1) {
      arr = [...arr, item];
    } else {
      arr[sameIndex] = {...arr[sameIndex], ...item};
    }
  });
  return arr;
};

const customerSlicer = createSlice({
  name: 'Customer',
  initialState: initialState,
  reducers: {
    clearCustomer: state => {
      state.orders = [];
    },
    addOrUpdateCustomerOrder: (state, action: PayloadAction<Array<IOrder>>) => {
      var arr = getNewArr([...state.orders], action.payload);
      state.orders = [...arr];
    },
    removeCustomerOrders: (state, action: PayloadAction<number>) => {
      const chefId = action.payload;
      const tmpArr = state.orders.filter(x => x.chef_user_id != chefId);
      state.orders = [...tmpArr];
    },
  },
});

export const {clearCustomer, addOrUpdateCustomerOrder, removeCustomerOrders} =
  customerSlicer.actions;
export default customerSlicer.reducer;
