import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import Container from '../../../layout/Container';
import { hideLoading, showLoading } from '../../../reducers/loadingSlice';
import { GetNotifcationDataAPI } from '../../../services/api';
import { navigate } from '../../../utils/navigation';
import { ShowErrorToast } from '../../../utils/toast';
import NotificationCard from './components/NotificationCard';
import { styles } from './styles';
const Notification = () => {
  const dispatch = useAppDispatch();
  const self = useAppSelector(x => x.user.user);
  const [notifications, setnotifications] = useState<any>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getNotifications();
      // console.log('user id : ',self?.id);
    }, []),
  );
  const getNotifications = async () => {
    try {
      dispatch(showLoading());
      const resp = await GetNotifcationDataAPI({user_id: self?.id || -1});
      if (resp.success == 1) {
        console.log('notification data: ', resp?.data);

        setnotifications(resp?.data);
      } else {
        ShowErrorToast(resp.error);
        console.log('error in getNotification: ', resp);
      }
      dispatch(hideLoading());
    } catch (error) {
      console.log('error getting notifications: ', error);
    }
  };
  const onRefresh = async () => {
    try {
          setRefreshing(true); // Start refreshing

      // dispatch(showLoading());
      const resp = await GetNotifcationDataAPI({user_id: self?.id || -1});
      if (resp.success == 1) {
        console.log('notification data: ', resp?.data);

        setnotifications(resp?.data);
      } else {
        ShowErrorToast(resp.error);
        console.log('error in getNotification: ', resp);
      }
                setRefreshing(false); // Start refreshing

      // dispatch(hideLoading());
    } catch (error) {
      console.log('error getting notifications: ', error);
        setRefreshing(false); // Stop refreshing

    }
  };

      const pressMethod = (item: any) => {
        console.log('Item Notification data====>>>', item);
        
        // Chef notifications - but skip if body contains 'Approved'
        if (item?.role == 'chef' && !item?.body.includes('Approved')) {
          navigate.toChef.orderDetail({
            id: item?.navigation_id,
          } as any);
        } 
        // Customer notifications
        else if (item?.role == 'user') {
          navigate.toCustomer.orderDetail({
            id: item?.navigation_id,
          } as any);
        }
      };
  return (
    <SafeAreaView style={styles.main}>
      <Container backMode title="Notification">
        <FlatList
          data={notifications}
          keyExtractor={item => item?.id}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => pressMethod(item)}>
            <NotificationCard
              title={item?.title}
              body={item?.tip ?? item?.body}
              customer_image={item?.image}
              time={item?.created_at}
            />
            </TouchableOpacity>
          )}

          refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        />
      </Container>
    </SafeAreaView>
  );
};
export default Notification;
