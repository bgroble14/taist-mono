import {SafeAreaView, Linking} from 'react-native';
import {Text, View, ScrollView} from 'react-native';

// Hooks
import {useAppDispatch, useAppSelector} from '../../../hooks/useRedux';

import {styles} from './styles';
import Container from '../../../layout/Container';
import StyledButton from '../../../components/styledButton';
import {ShowErrorToast} from '../../../utils/toast';
import {hideLoading, showLoading} from '../../../reducers/loadingSlice';
import {AddStripAccountAPI} from '../../../services/api';


const SetupStrip = () => {
  const user = useAppSelector(x => x.user.user);
  const dispatch = useAppDispatch();

  const handleContinue = async () => {
    dispatch(showLoading());
    const resp = await AddStripAccountAPI({}, dispatch);
    console.log('resp :', resp);

    dispatch(hideLoading());
    if (resp.success == 1 && resp.onboarding_url) {
      // Open Stripe onboarding directly in browser
      Linking.openURL(resp.onboarding_url);
    } else {
      ShowErrorToast(resp.error ?? resp.message);
    }
  };

  return (
    <SafeAreaView style={styles.main}>
      <Container
        backMode={user.user_type == 1 ? false : true}
        title="Set up Payments ">
        <ScrollView contentContainerStyle={styles.pageView}>
          <Text style={styles.text}>
            We use Stripe Connect to securely process payments and pay you when you complete orders.{' '}
          </Text>
          <Text style={styles.text}>
            Your account information will be pre-filled to make setup quick and easy.{' '}
          </Text>
          <View style={styles.vcenter}>
            <StyledButton title={'CONTINUE TO STRIPE'} onPress={() => handleContinue()} />
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

export default SetupStrip;
