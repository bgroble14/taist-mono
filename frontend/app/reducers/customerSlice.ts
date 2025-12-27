import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {IOrder} from '../types/index';

interface CustomerState {
  orders: Array<IOrder>;
  selectedDate: string | null;  // "YYYY-MM-DD" format, null if not set
}

const initialState: CustomerState = {
  orders: [],
  selectedDate: null,
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
      state.selectedDate = null;
    },
    addOrUpdateCustomerOrder: (state, action: PayloadAction<Array<IOrder>>) => {
      var arr = getNewArr([...state.orders], action.payload);
      state.orders = [...arr];
    },
    removeCustomerOrders: (state, action: PayloadAction<number>) => {
      const chefId = action.payload;
      const tmpArr = state.orders.filter(x => x.chef_user_id != chefId);
      state.orders = [...tmpArr];
      // Clear selectedDate if cart is now empty
      if (tmpArr.length === 0) {
        state.selectedDate = null;
      }
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
  },
});

export const {clearCustomer, addOrUpdateCustomerOrder, removeCustomerOrders, setSelectedDate} =
  customerSlicer.actions;
export default customerSlicer.reducer;
