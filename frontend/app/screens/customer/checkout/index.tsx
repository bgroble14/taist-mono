import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// NPM
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useLocalSearchParams } from 'expo-router';

// Types & Services
import {
  IChefProfile,
  IOrder,
  IPayment,
  IUser,
} from '../../../types/index';

// Hooks
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';

import { useStripe } from '@stripe/stripe-react-native';
import moment, { Moment } from 'moment';
import StyledSwitch from '../../../components/styledSwitch';
import StyledTabButton from '../../../components/styledTabButton';
import Container from '../../../layout/Container';
import { removeCustomerOrders } from '../../../reducers/customerSlice';
import { hideLoading, showLoading } from '../../../reducers/loadingSlice';
import {
  AddPaymentMethodAPI,
  CreateOrderAPI,
  CreatePaymentIntentAPI,
  GetPaymentMethodAPI,
} from '../../../services/api';
import GlobalStyles from '../../../types/styles';
import { Delay } from '../../../utils/functions';
import { goBack, navigate } from '../../../utils/navigation';
import { ShowErrorToast, ShowSuccessToast } from '../../../utils/toast';
import { getFormattedDateTime } from '../../../utils/validations';
import CustomCalendar from './components/customCalendar';
import OrderItem from './components/orderItem';
import { styles } from './styles';

const Checkout = () => {
  const self = useAppSelector(x => x.user.user);
  const menus = useAppSelector(x => x.table.menus);
  const appliances = useAppSelector(x => x.table.appliances);
  const dispatch = useAppDispatch();
  const {initPaymentSheet, presentPaymentSheet, createToken} = useStripe();

  const params = useLocalSearchParams();
  const orders: Array<IOrder> = params.orders ? JSON.parse(params.orders as string) : [];
  const chefInfo: IUser = params.chefInfo ? JSON.parse(params.chefInfo as string) : {};
  const weekDay: number = params.weekDay ? parseInt(params.weekDay as string) : 0;
  const chefProfile: IChefProfile = params.chefProfile ? JSON.parse(params.chefProfile as string) : {};

  const [DAY, onChangeDay] = useState(moment());
  const [times, onChangeTimes] = useState<Array<any>>([]);
  const [timeId, onChangeTimeId] = useState('1');
  const [appliance, onChangeAppliance] = useState(false);
  const [paymentMethod, onChangePaymentMethod] = useState<IPayment>({});

  const startDate = moment();
  if (startDate.weekday() < weekDay) {
    startDate.add(weekDay - startDate.weekday(), 'days');
  } else if (startDate.weekday() > weekDay) {
    startDate.add(weekDay - startDate.weekday() + 7, 'days');
  }
  startDate.startOf('date');

  const endDate = moment().add(1, 'months');
  if (startDate.weekday() < endDate.weekday()) {
    endDate.add(startDate.weekday() - endDate.weekday(), 'days');
  } else if (startDate.weekday() > endDate.weekday()) {
    endDate.add(startDate.weekday() - endDate.weekday() - 7, 'days');
  }
  endDate.endOf('date');

  var price_total = 0;
  orders.map((o, idx) => {
    price_total += o.total_price ?? 0;
  });

  useEffect(() => {
    addTimes();
    getPaymentMethod();
    onChangeDay(startDate);
  }, []);

  const addTimes = () => {
    let st = 0;
    let et = 0;
    switch (weekDay) {
      case 0:
        st = chefProfile.sunday_start ?? 0;
        et = chefProfile.sunday_end ?? 0;
        break;
      case 1:
        st = chefProfile.monday_start ?? 0;
        et = chefProfile.monday_end ?? 0;
        break;
      case 2:
        st = chefProfile.tuesday_start ?? 0;
        et = chefProfile.tuesday_end ?? 0;
        break;
      case 3:
        st = chefProfile.wednesday_start ?? 0;
        et = chefProfile.wednesday_end ?? 0;
        break;
      case 4:
        st = chefProfile.thursday_start ?? 0;
        et = chefProfile.thursday_end ?? 0;
        break;
      case 5:
        st = chefProfile.friday_start ?? 0;
        et = chefProfile.friday_end ?? 0;
        break;
      case 6:
        st = chefProfile.saterday_start ?? 0;
        et = chefProfile.saterday_end ?? 0;
        break;
      default:
        st = 0;
        et = 0;
        break;
    }

    let startTime =
      moment(st * 1000).hours() + moment(st * 1000).minutes() / 60;
    let endTime = moment(et * 1000).hours() + moment(et * 1000).minutes() / 60;

    console.log(weekDay, st, et, startTime, endTime);

    var tmpArr: Array<any> = [];
    var id = 1;
    const baseTime = moment().startOf('date');
    for (let i = 0; i < 24; i++) {
      var t_1 = baseTime; //.add(30 * 60 * 1000);
      const item1 = {
        id: id.toString(),
        label: `${t_1.format('hh:mm a')} `,
        h: t_1.hour(),
        m: t_1.minute(),
      };
      id++;

      var t_2 = baseTime.add(30 * 60 * 1000);
      const item2 = {
        id: id.toString(),
        label: `${t_2.format('hh:mm a')} `,
        h: t_2.hour(),
        m: t_2.minute(),
      };
      id++;

      const hm1 = item1.h + item1.m / 60;
      const hm2 = item2.h + item2.m / 60;
      if (startTime < endTime) {
        if (hm1 >= startTime && hm1 <= endTime) tmpArr.push(item1);
        if (hm2 >= startTime && hm2 <= endTime) tmpArr.push(item2);
      } else {
        //ex startTime~24, & 0~endTime
        if (hm1 >= startTime || hm1 <= endTime) tmpArr.push(item1);
        if (hm2 >= startTime || hm2 <= endTime) tmpArr.push(item2);
      }

      baseTime.add(30 * 60 * 1000);
    }
    onChangeTimes(tmpArr);
  };

  const getPaymentMethod = async () => {
    const resp = await GetPaymentMethodAPI();
    if (resp.success == 1) {
      const data = resp.data.find((x: IPayment) => x.active == 1);
      onChangePaymentMethod(data);
    }
  };

  const handleDayPress = async (day: moment.Moment) => {
    await Delay(10);
    onChangeDay(day);
  };

  const handleCreditCard = () => {
    console.log('handleCreditCard: Navigating to credit card screen with callback');
    navigate.toCustomer.creditCard(handleAddPaymentCard);
  };

  const handleAddPaymentCard = async (details: any) => {
    console.log('handleAddPaymentCard called with details:', details);
    if (details.complete !== true) {
      ShowErrorToast('Please input the card information correctly');
      return;
    }
    console.log('Creating payment token...');
    dispatch(showLoading());
    const resp_card = await createToken({
      type: 'Card',
      name: `${self.first_name} ${self.last_name}`,
      currency: 'usd',
    });
    if (resp_card.error) {
      dispatch(hideLoading());
      ShowErrorToast(resp_card.error.message);
      return;
    }

    console.log('Adding payment method via API...');
    const resp = await AddPaymentMethodAPI({
      ...details,
      token: resp_card.token.card?.id,
      payment_token: resp_card.token.id,
    });
    dispatch(hideLoading());
    if (resp.success == 1) {
      console.log('Payment method added successfully');
      const data = resp.data.find((x: IPayment) => x.active == 1);
      onChangePaymentMethod(data);
      ShowSuccessToast('Added Successfully!');
    } else {
      console.log('Payment method failed:', resp.error ?? resp.message);
      ShowErrorToast(resp.error ?? resp.message);
    }
  };

  const handleCheckout = () => {
    if (paymentMethod == undefined) {
      ShowErrorToast('Please add a payment method');
      return;
    }
    const day = moment(DAY);
    const time = times.find(x => x.id == timeId);

    if (time == undefined) {
      ShowErrorToast('Please select a time for the order');
      return;
    }

    day.hour(time?.h);
    day.minute(time?.m);

    // if (day < moment()) {
    //   ShowErrorToast('Select the order date and time correctly');
    //   return;
    // }

    Alert.alert('Confirm Purchase', 'Please tap to confirm', [
      {
        text: 'GO BACK',
        onPress: () => false,
      },
      {
        text: 'PURCHASE',
        onPress: () => handleCheckoutProcess(day),
      },
    ]);
  };

  const handleCheckoutProcess = async (day: Moment) => {
    const order_datetime = day.toDate().getTime() / 1000;

    dispatch(showLoading());
    var newOrders: Array<IOrder> = [];
    orders.map(async (o, idx) => {
      const orderWithSameMenu = newOrders.find(x => x.menu_id == o.menu_id);
      if (orderWithSameMenu !== undefined) {
        var newOrder = {...orderWithSameMenu};
        newOrder.addons = (orderWithSameMenu.addons?.split(',') ?? [])
          .concat(o.addons?.split(',') ?? [])
          ?.join(',');
        newOrder.amount = (orderWithSameMenu.amount ?? 0) + (o.amount ?? 0);
        newOrder.notes = orderWithSameMenu.notes + '&' + o.notes;
        if (
          orderWithSameMenu.notes == undefined ||
          orderWithSameMenu.notes.length == 0
        ) {
          newOrder.notes = o.notes;
        }
        if (o.notes == undefined || o.notes.length == 0) {
          newOrder.notes = orderWithSameMenu.notes;
        }
        newOrder.total_price =
          (orderWithSameMenu.total_price ?? 0) + (o.total_price ?? 0);
        const index = newOrders.findIndex(x => x.menu_id == o.menu_id);
        newOrders[index] = newOrder;
      } else {
        newOrders.push(o);
      }
    });

    var isCreateSuccess = true;
    for (let i = 0; i < newOrders.length; i++) {
      const o = newOrders[i];
      const idx = i;
      const newOrder: IOrder = {...o, order_date: order_datetime};
      const resp = await CreateOrderAPI(newOrder, dispatch);
      if (resp.success == 1) {
        const resp_intent = await CreatePaymentIntentAPI({
          order_id: resp.data.id,
        });
        if (resp_intent.success == 0) {
          ShowErrorToast(resp_intent.error ?? resp_intent.message);
          isCreateSuccess = false;
          break;
        }
        console.log('#####', resp_intent.data);
      } else {
        ShowErrorToast(resp.error ?? resp.message);
        isCreateSuccess = false;
        break;
      }
    }

    dispatch(hideLoading());
    if (isCreateSuccess) {
      dispatch(removeCustomerOrders(chefInfo.id ?? 0));
      goBack();
      navigate.toCustomer.orders();
    }

    // newOrders.map(async (o, idx) => {
    //   const newOrder: IOrder = {...o, order_date: order_datetime};
    //   const resp = await CreateOrderAPI(newOrder, dispatch);
    //   if (resp.success == 1) {
    //     const resp_intent = await CreatePaymentIntentAPI({
    //       order_id: resp.data.id,
    //     });
    //     console.log('#####', resp_intent.data);
    //   }
    // });
    // dispatch(hideLoading());
    // dispatch(removeCustomerOrders(chefInfo.id ?? 0));
    // navigation.navigate('CustomerOrdersStack');
    // navigation.goBack();
  };

  const getEstimatedTime = () => {
    const day = moment(DAY);
    const time = times.find(x => x.id == timeId);

    day.hour(time?.h);
    day.minute(time?.m);

    orders.map((o, idx) => {
      const menu = menus.find(x => x.id == o.menu_id);
      if (menu) {
        day.add((menu.estimated_time ?? 0) * 60 * 1000);
      }
    });
    return getFormattedDateTime(day);
  };

  const getAppliances = () => {
    var applianceIds: Array<number> = [];
    orders.map((o, idx) => {
      const menu = menus.find(x => x.id == o.menu_id);
      if (menu) {
        const arr =
          menu.appliances?.split(',').map((val, index) => {
            return parseInt(val);
          }) ?? [];
        applianceIds = applianceIds.concat([...arr]);
      }
    });

    var applianceNames: Array<string> = [];
    applianceIds.map((aId, idx) => {
      const appliance = appliances.find(x => x.id == aId);
      if (appliance && appliance.name) {
        if (!applianceNames.includes(appliance.name)) {
          applianceNames.push(appliance.name);
        }
      }
    });

    return applianceNames;
  };

  return (
    <SafeAreaView style={styles.main}>
      <Container>
        <ScrollView contentContainerStyle={styles.pageView}>
          <View style={styles.heading}>
            <Pressable onPress={() => goBack()}>
              <FontAwesomeIcon icon={faAngleLeft} size={20} color="#ffffff" />
            </Pressable>
          </View>
          <Text style={styles.pageTitle}>Checkout </Text>
          <View style={styles.checkoutBlock}>
            <Text style={styles.checkoutSubheading}>Order Date & Time </Text>
            <Text style={styles.checkoutText}>
              Select the time for your chef to arrive.{' '}
            </Text>
            <Text style={styles.checkoutText}>
              Completion times may vary depending on your appliances.{' '}
            </Text>
            <View style={styles.calendarWrapper}>
              <CustomCalendar
                selectedDate={DAY}
                onDateSelect={handleDayPress}
                minDate={startDate}
                maxDate={endDate}
                datesWhitelist={(date: moment.Moment) => {
                  return (
                    date.weekday() === weekDay &&
                    date >= startDate &&
                    date <= endDate
                  );
                }}
              />
            </View>
            <ScrollView horizontal>
              <View style={styles.timeContainer}>
                {times.map((item, idx) => {
                  const day = moment(DAY);
                  day.hour(item?.h);
                  day.minute(item?.m);
                  if (day < moment()) return;
                  return (
                    <StyledTabButton
                      title={item.label}
                      disabled={item.id != timeId}
                      onPress={() => onChangeTimeId(item.id)}
                      key={`time_${idx}`}
                    />
                  );
                })}
              </View>
            </ScrollView>
            <Text style={styles.estimated}>
              {`* Estimated completion time is ${getEstimatedTime()}`}
            </Text>
          </View>
          <View style={styles.checkoutBlock}>
            <Text style={styles.checkoutSubheading}>Order Summary </Text>
            {orders.map((o, idx) => {
              return (
                <OrderItem
                  order={o}
                  menu={menus.find(x => x.id == o.menu_id) ?? {}}
                  key={`o_${idx}`}
                />
              );
            })}
            <View style={styles.checkoutSummaryItemWrapper}>
              <View>
                <Text style={styles.checkoutSummaryItemTitle}>
                  Order Total:{' '}
                </Text>
              </View>
              <View style={styles.checkoutSummaryItemPriceWrapper}>
                <Text
                  style={
                    styles.checkoutSummaryItemTitle
                  }>{`$${price_total.toFixed(2)} `}</Text>
              </View>
            </View>
          </View>
          <View style={styles.checkoutBlock}>
            <Text style={styles.checkoutSubheading}>Order Address </Text>
            <View style={styles.checkoutSummaryItemWrapper}>
              <View style={{width: '100%'}}>
                <Text style={styles.checkoutAddressItemTitle}>
                  {`${self.first_name} ${self.last_name?.substring(0, 1)}. `}
                </Text>
                <Text style={styles.checkoutAddressItemTitle}>
                  {`${self.phone} `}
                </Text>
                <Text style={styles.checkoutAddressItemTitle}>
                  {`${self.address} `}
                </Text>
                <Text style={styles.checkoutAddressItemTitle}>
                  {`${self.city}, ${self.state}, ${self.zip} `}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.checkoutBlock}>
            <Text style={styles.checkoutSubheading}>Payment Information </Text>
            <TouchableOpacity
              onPress={handleCreditCard}
              style={styles.checkoutPaymentItemWrapper}>
              <View>
                <Text style={styles.checkoutSummaryItemTitle}>
                  Payment Method{' '}
                </Text>
                <Text style={styles.checkoutSummaryItemAddon}>
                  {paymentMethod
                    ? `${paymentMethod?.card_type ?? ''} ending in ${
                        paymentMethod?.last4 ?? ''
                      } `
                    : `Add payment method `}
                </Text>
              </View>
              <View>
                <FontAwesomeIcon
                  icon={faAngleRight}
                  size={20}
                  color="#ffffff"
                />
              </View>
            </TouchableOpacity>
            {/* <StyledStripeCardField
              content={
                <View style={styles.checkoutPaymentItemWrapper}>
                  <View>
                    <Text style={styles.checkoutSummaryItemTitle}>
                      Payment Method{' '}
                    </Text>
                    <Text style={styles.checkoutSummaryItemAddon}>
                      {paymentMethod
                        ? `${paymentMethod?.card_type ?? ''} ending in ${
                            paymentMethod?.last4 ?? ''
                          } `
                        : `Add payment method `}
                    </Text>
                  </View>
                  <View>
                    <FontAwesomeIcon
                      icon={faAngleRight}
                      size={20}
                      color="#ffffff"
                    />
                  </View>
                </View>
              }
              onAddCard={handleAddPaymentCard}
            /> */}
          </View>
          <View style={styles.checkoutBlock}>
            <View style={styles.switchWrapper}>
              <StyledSwitch
                label={`I have the following appliances available for the Chef: ${getAppliances().join(
                  ', ',
                )}. `}
                labelLines={0}
                value={appliance}
                onPress={() => onChangeAppliance(!appliance)}
              />
            </View>
          </View>
          <View style={styles.vcenter}>
            <TouchableOpacity
              style={appliance ? GlobalStyles.btn : GlobalStyles.btnDisabled}
              onPress={() => handleCheckout()}
              disabled={!appliance}>
              <Text
                style={
                  appliance ? GlobalStyles.btnTxt : GlobalStyles.btnDisabledTxt
                }>
                PLACE ORDER{' '}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

export default Checkout;
