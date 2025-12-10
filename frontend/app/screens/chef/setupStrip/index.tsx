import {useEffect, useState} from 'react';
import {SafeAreaView, Linking} from 'react-native';
import {Image, Pressable, Text, View, ScrollView} from 'react-native';
 
// Hooks
import {useAppDispatch, useAppSelector} from '../../../hooks/useRedux';

import {styles} from './styles';
import Container from '../../../layout/Container';
import StyledTextInput from '../../../components/styledTextInput';
import StyledButton from '../../../components/styledButton';
import {emailValidation} from '../../../utils/validations';
import {ShowErrorToast, ShowSuccessToast} from '../../../utils/toast';
import {hideLoading, showLoading} from '../../../reducers/loadingSlice';
import {AddStripAccountAPI} from '../../../services/api';


const SetupStrip = () => {
  const user = useAppSelector(x => x.user.user);
  const dispatch = useAppDispatch();

  const [email, onChangeEmail] = useState('');

  useEffect(() => {
    onChangeEmail(user.email ?? '');
  }, []);

  const handleSave = async () => {
    const msg_email = emailValidation(email);
    if (msg_email.length > 0) {
      ShowErrorToast(msg_email);
      return;
    }
    dispatch(showLoading());
    const resp = await AddStripAccountAPI({email}, dispatch);
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
            Enter an email to begin setting up payments. We use Stripe Connect
            to pay you when you complete orders.{' '}
          </Text>
          <StyledTextInput
            label="Personal or Business Email "
            placeholder="Personal or Business Email "
            onChangeText={onChangeEmail}
            value={email}
          />
          <View style={styles.vcenter}>
            <StyledButton title={'SAVE '} onPress={() => handleSave()} />
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

export default SetupStrip;
