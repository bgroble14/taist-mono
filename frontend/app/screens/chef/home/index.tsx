import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native';
// Types & Services
import { IOrder, IUser } from '../../../types/index';

// Hooks
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';

import { navigate } from '@/app/utils/navigation';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import EmptyListView from '../../../components/emptyListView/emptyListView';
import StyledProfileImage from '../../../components/styledProfileImage';
import StyledTabButton from '../../../components/styledTabButton';
import Container from '../../../layout/Container';
import { setNotificationOrderId } from '../../../reducers/deviceSlice';
import { hideLoading, showLoading } from '../../../reducers/loadingSlice';
import { setUser } from '../../../reducers/userSlice';
import { GetChefOrdersAPI, GetUserById } from '../../../services/api';
import { getImageURL } from '../../../utils/functions';
import { ShowErrorToast } from '../../../utils/toast';
import { getDateStartTime } from '../../../utils/validations';
import ChefOrderCard from './components/chefOrderCard';
import SettingItem from './components/settingItem';
import { styles } from './styles';



const Home = () => {
  const self = useAppSelector(x => x.user.user);
  const users = useAppSelector(x => x.table.users);
  const menus = useAppSelector(x => x.table.menus);
  const profile = useAppSelector(x => x.chef.profile);
  const payment = useAppSelector(x => x.chef.paymentMehthod);
  const notificationOrderId = useAppSelector(
    x => x.device.notification_order_id,
  );
  const dispatch = useAppDispatch();
  const notification_id = useAppSelector(x => x.device.notification_id);

  const [passed, setPassed] = useState(false);
  const [tabId, onChangeTabId] = useState('1');
  const [orders, setOrders] = useState<Array<IOrder>>([]);

  const tabs = useMemo(
    () => [
      {
        id: '1',
        label: 'REQUESTED ',
        status: 1,
      },
      {
        id: '2',
        label: 'ACCEPTED ',
        status: 2,
        status1: 7,
      },
    ],
    [],
  );
const [refreshing, setRefreshing] = React.useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  const now_time = moment().toDate().getTime() / 1000;
  await loadDatax(0, now_time);
  setRefreshing(false);
};
useFocusEffect(
    useCallback(() => {
      const today_time = getDateStartTime(moment()) / 1000;
      loadData(0, today_time + 24 * 3600);
    }, [notification_id]),
  );
  useEffect(() => {
    if (notificationOrderId >= 0) {
       const orderInfo = { id: notificationOrderId } as IOrder;
    navigate.toChef.orderDetail(orderInfo);

      dispatch(
        setNotificationOrderId({
          notification_id: '',
          notification_order_id: -1,
        }),
      );
    }
  }, []);

  useEffect(() => {
    if (self.is_pending === 1) {
      navigate.toChef.howToDoIt();
    }
  }, []);

  useEffect(() => {
    const now_time = moment().toDate().getTime() / 1000;
    loadData(0, now_time);
  }, [])

  // useFocusEffect(
  // );
  // useEffect(() => {
  //   // Function to run every 30 seconds
  //   if (self?.is_pending != 1) {
  //     const interval = setInterval(() => {
  //       console.log('This code runs every 30 seconds');
  //       const now_time = moment().toDate().getTime() / 1000;
  //       loadData(0, now_time);
  //     }, 30000); // 30 seconds = 30000ms

  //     // Cleanup the interval on unmount
  //     return () => clearInterval(interval);
  //   }
  // }, []);
  // const chefInfo: IUser = route.params?.chefInfo;


  const loadData = async (start_time: number, end_time: number) => {
    dispatch(showLoading());
    const resp = await GetChefOrdersAPI({
      user_id: self.id ?? 0,
      start_time,
      end_time,
    });
    

    dispatch(hideLoading());
    if (resp.success == 1) {
      setOrders(resp.data);

    }
    if (self.is_pending == 1) {
      const resp1 = await GetUserById(self.id?.toString() ?? '0');
      if (resp1.success == 1 && dispatch) {
        dispatch(setUser(resp1.data));
      }
    }
  };
  const loadDatax = async (start_time: number, end_time: number) => {
    // dispatch(showLoading());
    const resp = await GetChefOrdersAPI({
      user_id: self.id ?? 0,
      start_time,
      end_time,
    });
    

    // dispatch(hideLoading());
    if (resp.success == 1) {
      setOrders(resp.data);

    }
    if (self.is_pending == 1) {
      const resp1 = await GetUserById(self.id?.toString() ?? '0');
      if (resp1.success == 1 && dispatch) {
        dispatch(setUser(resp1.data));
      }
    }
  };

  const handleOrderDetail = (orderInfo: IOrder, customerInfo: IUser) => {
        navigate.toChef.orderDetail(orderInfo, customerInfo);
  };

  const checkEmptyFieldInUserInfo = () => {
    const userInfo = { ...self };
    if (userInfo.first_name == undefined || userInfo.first_name.length == 0) {
      return 'Please enter the first name';
    }
    if (userInfo.last_name == undefined || userInfo.last_name.length == 0) {
      return 'Please enter the last name';
    }
    if (userInfo.birthday == undefined || userInfo.birthday == 0) {
      return 'Please select the birthday';
    }
    if (userInfo.address == undefined || userInfo.address.length == 0) {
      return 'Please enter the address';
    }
    if (userInfo.city == undefined || userInfo.city.length == 0) {
      return 'Please enter the city';
    }
    if (userInfo.state == undefined || userInfo.state.length == 0) {
      return 'Please select a state';
    }
    if (userInfo.zip == undefined || userInfo.zip.length == 0) {
      return 'Please enter the zip code';
    }
    if (
      userInfo.user_type === 2 &&
      (userInfo.photo == undefined || userInfo.photo.length == 0)
    ) {
      return 'Please add your photo';
    }
    return '';
  };

  const checkEmptyFieldInProfile = () => {
    if (profile == undefined || profile.id == undefined) {
      return 'Please submit your profile';
    }
    if (profile.bio == undefined || profile.bio.length == 0) {
      return 'Please enter your bio';
    }
    const isAvailableSunday =
      (profile.sunday_start ?? 0) > 0 && (profile.sunday_end ?? 0) > 0;
    const isAvailableMonday =
      (profile.monday_start ?? 0) > 0 && (profile.monday_end ?? 0) > 0;
    const isAvailableTuesday =
      (profile.tuesday_start ?? 0) > 0 && (profile.tuesday_end ?? 0) > 0;
    const isAvailableWednesday =
      (profile.wednesday_start ?? 0) > 0 && (profile.wednesday_end ?? 0) > 0;
    const isAvailableThursday =
      (profile.thursday_start ?? 0) > 0 && (profile.thursday_end ?? 0) > 0;
    const isAvailableFriday =
      (profile.friday_start ?? 0) > 0 && (profile.friday_end ?? 0) > 0;
    const isAvailableSaturday =
      (profile.saterday_start ?? 0) > 0 && (profile.saterday_end ?? 0) > 0;
    if (
      !isAvailableSunday &&
      !isAvailableMonday &&
      !isAvailableTuesday &&
      !isAvailableWednesday &&
      !isAvailableThursday &&
      !isAvailableFriday &&
      !isAvailableSaturday
    ) {
      return 'Please enter your availability';
    }
    return '';
  };

  const selectedTab = tabs.find(x => x.id == tabId);
  const filteredOrders = orders.filter(x => x.status == selectedTab?.status);

  return (
    <SafeAreaView style={styles.main}>
      <Container>
        <ScrollView 
         refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }

        contentContainerStyle={styles.pageView}
        >
          <View style={styles.userContainer}>
            <StyledProfileImage url={getImageURL(self.photo)} size={80} />
            <Text style={styles.userName}>{`${self.first_name
              } ${self.last_name?.substring(0, 1)}. `}</Text>
          </View>
          {self.is_pending == 1 && (
            <>
              <View style={styles.onboardingHeader}>
                <Text style={styles.onboardingTitle}>Getting Started</Text>
                <Text style={styles.onboardingSubtitle}>Complete these steps to activate your chef account</Text>
              </View>
              <View style={styles.itemContainer}>
                <SettingItem
                  title={'1. Setup Your Account'}
                  completed={checkEmptyFieldInUserInfo() == ''}
                  isNext={checkEmptyFieldInUserInfo() !== ''}
                  onPress={() => {
                    navigate.toCommon.account(self, 'ChefHome');
                  }}
                />
                <SettingItem
                  title={'2. Create Your Menu'}
                  completed={menus.length > 0}
                  isNext={checkEmptyFieldInUserInfo() == '' && menus.length == 0}
                  onPress={() => {
                    if (checkEmptyFieldInUserInfo() !== '') {
                      ShowErrorToast('Setup Your Account!');
                      return;
                    }
                    navigate.toChef.menu();
                  }}
                />
                <SettingItem
                  title={'3. Complete Your Profile'}
                  completed={checkEmptyFieldInProfile() == ''}
                  isNext={checkEmptyFieldInUserInfo() == '' && menus.length > 0 && checkEmptyFieldInProfile() !== ''}
                  onPress={() => {
                    if (menus.length == 0) {
                      ShowErrorToast('Create Your Menu!');
                      return;
                    }
                    navigate.toChef.profile();
                  }}
                />
                <SettingItem
                  title={'4. Submit Payment Info'}
                  completed={payment?.stripe_account_id !== undefined}
                  isNext={checkEmptyFieldInProfile() == '' && payment?.stripe_account_id == undefined}
                  onPress={() => {
                    if (checkEmptyFieldInProfile() !== '') {
                      ShowErrorToast('Complete Your Profile');
                      return;
                    }
                    navigate.toChef.setupStrip();
                   }}
                />
                <SettingItem
                  title={'5. Background Check'}
                  completed={self.applicant_guid ? true : false}
                  isNext={payment?.stripe_account_id !== undefined && !self.applicant_guid}
                  onPress={() => {
                    if (payment?.stripe_account_id == undefined) {
                      ShowErrorToast('Submit Payment Info');
                      return;
                    }
                    navigate.toChef.backgroundCheck();
                   }}
                />
              </View>
            </>
          )}
          {self.is_pending != 1 && (
            <>
              <View style={styles.tabContainer}>
                {tabs.map((tab, idx) => {
                  return (
                    <StyledTabButton
                      title={tab.label}
                      style={styles.tab}
                      titleStyle={styles.tabText}
                      disabled={tab.id != tabId}
                      onPress={() => onChangeTabId(tab.id)}
                      key={`tab_${idx}`}
                    />
                  );
                })}
              </View>

              <View style={styles.orderCardContainer}>
                {filteredOrders.map((order, idx) => {
                  //cutomer side
                  const customer =
                    users.find(x => x.id == order.customer_user_id) ?? {};
                  return (
                    <ChefOrderCard
                      info={order}
                      customer={customer}
                      onPress={() => handleOrderDetail(order, customer)}
                      key={`order_${idx}`}
                    />
                  );
                })}
                {filteredOrders.length == 0 && (
                  <EmptyListView
                    text={`No ${selectedTab?.label.toLowerCase()} orders `}
                  />
                )}
              </View>
            </>
          )}
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

export default Home;
