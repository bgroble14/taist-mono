import { navigate } from '@/app/utils/navigation';
import { Text, TextInput } from 'react-native-paper';
import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { IUser } from '../../../types/index';
import { ShowErrorToast } from '../../../utils/toast';
import { emailValidation, passwordValidation } from '../../../utils/validations';
import Onboarding from './onBoarding';
import { styles } from './styles';
import { ProgressIndicator } from './components/ProgressIndicator';
import { StepBasicProfile } from './steps/StepBasicProfile';
import { StepLocation } from './steps/StepLocation';
import { StepPreferences } from './steps/StepPreferences';
import { useAppDispatch } from '../../../hooks/useRedux';
import { showLoading, hideLoading } from '../../../reducers/loadingSlice';
import { RegisterAPI, LoginAPI } from '../../../services/api';

const Signup = () => {
  const dispatch = useAppDispatch();
  const [step, setStep] = React.useState(0);
  const [userType, setUserType] = React.useState(1);
  const [errors, setErrors] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [email, onChangeEmail] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const [userInfo, setUserInfo] = React.useState<IUser>({});

  const handleUserType = (selectedUserType: number) => {
    setUserType(selectedUserType);
    setUserInfo({ ...userInfo, user_type: selectedUserType });
    setStep(2);
  };

  const handleEmailPasswordSubmit = () => {
    var errorMsg = emailValidation(email);
    if (errorMsg !== '') {
      ShowErrorToast(errorMsg);
      return;
    }
    errorMsg = passwordValidation(password);
    if (errorMsg !== '') {
      ShowErrorToast(errorMsg);
      return;
    }

    // Update userInfo with email and password
    setUserInfo({ ...userInfo, email, password, user_type: userType });

    // For customers, proceed to multi-step flow
    if (userType === 1) {
      setStep(3); // Go to basic profile step
    } else {
      // For chefs, use old flow - go to Account screen with all fields
      const user: IUser = { email, password, user_type: userType };
    navigate.toCommon.account(user, 'Signup');
    }
  };

  const handleUpdateUserInfo = (updates: Partial<IUser>) => {
    setUserInfo({ ...userInfo, ...updates });
  };

  const handleCompleteSignup = async () => {
    // Register the user with minimal required info
    const registrationData: IUser = {
      ...userInfo,
      email,
      password,
      user_type: userType,
      is_pending: 0, // Customer doesn't need approval
      verified: 1,
    };

    dispatch(showLoading());
    try {
      const resp_register = await RegisterAPI(registrationData, dispatch);
      if (resp_register.success === 0) {
        dispatch(hideLoading());
        ShowErrorToast(resp_register.message ?? resp_register.error);
        return;
      }

      // Auto-login after registration
      const resp_login = await LoginAPI(
        { email, password, remember: true },
        dispatch
      );

      if (resp_login.success === 0) {
        dispatch(hideLoading());
        ShowErrorToast(resp_login.message ?? resp_login.error);
        return;
      }

      dispatch(hideLoading());

      // Navigate to customer home
      router.replace('/screens/customer/home');
    } catch (error) {
      dispatch(hideLoading());
      ShowErrorToast('An error occurred during signup. Please try again.');
      console.error('Signup error:', error);
    }
  };

  const getTotalSteps = () => {
    // Customer: 5 steps (Onboarding, UserType, Email/Pass, Profile, Location, Preferences)
    // Chef: 3 steps (Onboarding, UserType, Email/Pass) then Account screen
    return userType === 1 ? 5 : 3;
  };

  const getCurrentStepNumber = () => {
    if (step === 0) return 1; // Onboarding
    if (step === 1) return 2; // User Type
    if (step === 2) return 3; // Email/Password
    if (step === 3) return 4; // Basic Profile (customer only)
    if (step === 4) return 5; // Location (customer only)
    if (step === 5) return 6; // Preferences (customer only)
    return 1;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.center}>
        <Image
          style={styles.logo}
          source={require('../../../assets/images/logo-2.png')}
        />
      </View>

      {/* Show progress indicator for steps 2+ */}
      {step >= 2 && (
        <ProgressIndicator 
          currentStep={getCurrentStepNumber()} 
          totalSteps={getTotalSteps()} 
        />
      )}

      {/* Step 0: Onboarding */}
      {step === 0 && (
        <Onboarding
          onStart={() => {
            setStep(1);
          }}
        />
      )}

      {/* Step 1: User Type Selection */}
      {step === 1 && (
        <View style={styles.signupOptionWrapper}>
          <View style={styles.signupOption}>
            <Text style={styles.signupOptionHeading}>
              Have a taist for something?
            </Text>
            <Text style={styles.signupOptionText}>
              Choose from people in your area to craft delicious dishes out of
              your kitchen.
            </Text>
            <Pressable style={styles.button} onPress={() => handleUserType(1)}>
              <Text style={styles.buttonText}>I am a customer</Text>
            </Pressable>
          </View>
          <View style={styles.signupOption}>
            <Text style={styles.signupOptionHeading}>
              Looking to bring a new taist?
            </Text>
            <Text style={styles.signupOptionText}>
              Be your own boss and create something special for people right
              from their kitchen.
            </Text>
            <Pressable style={styles.button} onPress={() => handleUserType(2)}>
              <Text style={styles.buttonText}>I want to be a chef</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Step 2: Email & Password */}
      {step === 2 && (
        <>
        <View style={styles.formContainer}>
          <View>
            <Text style={styles.heading}>Sign Up</Text>
            <Text style={styles.subheading}>Create your account to get started</Text>
          </View>
          <View style={styles.formContent}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor={'#999999'}
                mode="outlined"
                onChangeText={txt => onChangeEmail(txt.toLowerCase())}
                value={email}
                keyboardType="email-address"
                autoCapitalize={'none'}
                style={styles.input}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={'#999999'}
                mode="outlined"
                onChangeText={onChangePassword}
                value={password}
                textContentType="password"
                secureTextEntry={true}
                style={styles.input}
              />
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
            <Pressable style={styles.signupButton} onPress={handleEmailPasswordSubmit}>
              <Text style={styles.signupButtonText}>Continue</Text>
          </Pressable>
          <Pressable
            style={styles.loginLink}
            onPress={() => navigate.toCommon.login()}>
            <Text style={styles.loginLinkText}>Already have an account? Log in</Text>
          </Pressable>
        </View>
        <View style={styles.termsContainer}>
          <View style={styles.terms}>
            <Text style={styles.termsText}>By signing up, you agree to Taist's </Text>
            <Text
              style={styles.termsLink}
              onPress={() => navigate.toCommon.terms()}>
              Terms and Conditions
            </Text>
          </View>
        </View>
        </>
      )}

      {/* Step 3: Basic Profile (Customer only) */}
      {step === 3 && userType === 1 && (
        <StepBasicProfile
          userInfo={userInfo}
          onUpdateUserInfo={handleUpdateUserInfo}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {/* Step 4: Location (Customer only) */}
      {step === 4 && userType === 1 && (
        <StepLocation
          userInfo={userInfo}
          onUpdateUserInfo={handleUpdateUserInfo}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {/* Step 5: Preferences (Customer only) */}
      {step === 5 && userType === 1 && (
        <StepPreferences
          userInfo={userInfo}
          onComplete={handleCompleteSignup}
          onBack={() => setStep(4)}
        />
      )}
    </ScrollView>
  );
};

export default Signup;
