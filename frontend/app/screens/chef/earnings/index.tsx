import { useEffect, useState } from 'react';
import {
    ScrollView,
    Text,
    View
} from 'react-native';
// Hooks
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';

import Container from '../../../layout/Container';
import { hideLoading, showLoading } from '../../../reducers/loadingSlice';
import { GetEarningsAPI, GetOrderCountAPI } from '../../../services/api';
import GlobalStyles from '../../../types/styles';
import { styles } from './styles';


const Earnings = () => {
  const dispatch = useAppDispatch();

  const [earning_month, setEarningMonth] = useState(0);
  const [earning_year, setEarningYear] = useState(0);
  const [orders_month, setOrdersMonth] = useState(0);
  const [orders_year, setOrdersYear] = useState(0);
   const self = useAppSelector(x => x.user.user);


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    dispatch(showLoading());
    const resp_earnings = await GetEarningsAPI(self.id ?? 0, dispatch);
    if (resp_earnings.success == 1) {
      setEarningMonth(resp_earnings.data?.month ?? 0);
      setEarningYear(resp_earnings.data?.year ?? 0);
    }
    const resp_orders = await GetOrderCountAPI({}, dispatch);
    if (resp_orders.success == 1) {
      setOrdersMonth(resp_orders.data?.month ?? 0);
      setOrdersYear(resp_orders.data?.year ?? 0);
    }
    dispatch(hideLoading());
  };

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.pageView}>
        <View style={GlobalStyles.whiteCardContainer}>
          <View style={styles.itemContainer}>
            <Text style={styles.title}>Month </Text>
            <Text style={styles.text}>{`$${earning_month.toFixed(2)} `}</Text>
          </View>
          <View style={styles.subContainer}>
            <View style={styles.itemContainer}>
              <Text style={styles.title}>Items </Text>
              <Text style={styles.text}>{orders_month}</Text>
            </View>
            <View style={styles.itemContainer}>
              <Text style={styles.title}>Orders </Text>
              <Text style={styles.text}>{orders_month} </Text>
            </View>
          </View>
        </View>
        <View style={GlobalStyles.whiteCardContainer}>
          <View style={styles.itemContainer}>
            <Text style={styles.title}>Year </Text>
            <Text style={styles.text}>{`$${earning_year.toFixed(2)} `} </Text>
          </View>
          <View style={styles.subContainer}>
            <View style={styles.itemContainer}>
              <Text style={styles.title}>Items </Text>
              <Text style={styles.text}>{orders_year} </Text>
            </View>
            <View style={styles.itemContainer}>
              <Text style={styles.title}>Orders </Text>
              <Text style={styles.text}>{orders_year} </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

export default Earnings;
