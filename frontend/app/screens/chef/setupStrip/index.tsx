import {SafeAreaView, Linking, Modal, TouchableOpacity} from 'react-native';
import {Text, View, ScrollView} from 'react-native';
import {useState} from 'react';
import {useRouter} from 'expo-router';

// Hooks
import {useAppDispatch, useAppSelector} from '../../../hooks/useRedux';

import {styles} from './styles';
import Container from '../../../layout/Container';
import StyledButton from '../../../components/styledButton';
import {ShowErrorToast, ShowSuccessToast} from '../../../utils/toast';
import {hideLoading, showLoading} from '../../../reducers/loadingSlice';
import {AddStripAccountAPI, GetPaymentMethodAPI} from '../../../services/api';


const SetupStrip = () => {
  const user = useAppSelector(x => x.user.user);
  const payment = useAppSelector(x => x.chef.paymentMehthod);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [showExplainer, setShowExplainer] = useState(false);
  const [pendingStripeUrl, setPendingStripeUrl] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const handleContinue = async () => {
    dispatch(showLoading());
    const resp = await AddStripAccountAPI({}, dispatch);
    console.log('resp :', resp);

    dispatch(hideLoading());
    if (resp.success == 1 && resp.onboarding_url) {
      // Store URL and show explainer modal before opening Stripe
      setPendingStripeUrl(resp.onboarding_url);
      setShowExplainer(true);
    } else {
      ShowErrorToast(resp.error ?? resp.message);
    }
  };

  const openStripeOnboarding = () => {
    if (pendingStripeUrl) {
      // Open Stripe onboarding in browser
      Linking.openURL(pendingStripeUrl);
      setShowExplainer(false);

      // Navigate to home tab so chef returns to clean screen
      setTimeout(() => {
        router.replace('/screens/chef/(tabs)/home' as any);
      }, 500);
    }
  };

  const checkVerificationStatus = async () => {
    setCheckingStatus(true);
    try {
      await GetPaymentMethodAPI();

      // Payment state will be updated by the API call
      // We need to wait a moment for Redux to update
      setTimeout(() => {
        const updatedPayment = payment;

        if (updatedPayment?.verification_complete) {
          ShowSuccessToast('Verification complete!');
          router.replace('/screens/chef/(tabs)/home' as any);
        } else if (updatedPayment?.stripe_account_id) {
          ShowErrorToast('Verification still pending. Please check back soon.');
        } else {
          ShowErrorToast('No Stripe account found');
        }
        setCheckingStatus(false);
      }, 1000);
    } catch (error) {
      ShowErrorToast('Failed to check status');
      setCheckingStatus(false);
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

          {/* Show manual refresh option if Stripe account exists but not verified */}
          {payment?.stripe_account_id && !payment?.verification_complete && (
            <View style={{marginTop: 30, paddingHorizontal: 20}}>
              <Text
                style={{
                  fontSize: 14,
                  color: '#666',
                  textAlign: 'center',
                  marginBottom: 12,
                }}>
                Already completed Stripe verification?
              </Text>

              <TouchableOpacity
                onPress={checkVerificationStatus}
                disabled={checkingStatus}
                style={{
                  backgroundColor: checkingStatus ? '#E0E0E0' : '#F5F5F5',
                  padding: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#DDD',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: checkingStatus ? '#999' : '#007AFF',
                  }}>
                  {checkingStatus ? 'Checking...' : 'Check Verification Status'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Container>

      {/* Stripe Explainer Modal */}
      <Modal
        visible={showExplainer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExplainer(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 24,
              width: '100%',
              maxWidth: 400,
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 16,
                textAlign: 'center',
              }}>
              Complete Stripe Verification
            </Text>

            <Text
              style={{
                fontSize: 16,
                marginBottom: 12,
                lineHeight: 24,
              }}>
              You'll be redirected to Stripe's secure website to verify your account.
            </Text>

            <Text
              style={{
                fontSize: 16,
                marginBottom: 12,
                lineHeight: 24,
              }}>
              This process typically takes 2-3 minutes and requires:
            </Text>

            <Text style={{fontSize: 14, marginLeft: 16, marginBottom: 8}}>
              • Personal identification
            </Text>
            <Text style={{fontSize: 14, marginLeft: 16, marginBottom: 8}}>
              • Bank account details
            </Text>
            <Text style={{fontSize: 14, marginLeft: 16, marginBottom: 16}}>
              • Business information (if applicable)
            </Text>

            <Text
              style={{
                fontSize: 16,
                marginBottom: 24,
                fontWeight: '600',
                lineHeight: 24,
              }}>
              When complete, you'll be automatically returned to the app.
            </Text>

            <TouchableOpacity
              onPress={openStripeOnboarding}
              style={{
                backgroundColor: '#007AFF',
                padding: 16,
                borderRadius: 8,
                marginBottom: 12,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Continue to Stripe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowExplainer(false)}
              style={{
                padding: 12,
              }}>
              <Text
                style={{
                  color: '#666',
                  fontSize: 14,
                  textAlign: 'center',
                }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SetupStrip;
