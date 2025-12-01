import { navigate } from '@/app/utils/navigation';
import { Text, TextInput } from 'react-native-paper';
import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { IUser } from '../../../types/index';
import { ShowErrorToast } from '../../../utils/toast';
import { emailValidation, passwordValidation } from '../../../utils/validations';
import Onboarding from './onBoarding';
import { styles } from './styles';

const Signup = () => {
  const [step, setStep] = React.useState(0);
  const [userType, setUserType] = React.useState(1);
  const [errors, setErrors] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [email, onChangeEmail] = React.useState('');
  const [password, onChangePassword] = React.useState('');

  const handleUserType = (userType: any) => {
    setUserType(userType);
    setStep(2);
  };

  const handleSignup = () => {
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

    const user: IUser = {email, password, user_type: userType};
    // navigation.navigate('Account', {user, from: 'Signup'});
    navigate.toCommon.account(user, 'Signup');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.center}>
        <Image
          style={styles.logo}
          source={require('../../../assets/images/logo-2.png')}
        />
      </View>
      {step == 0 && (
        <Onboarding
          onStart={() => {
            setStep(1);
          }}
        />
      )}
      {step == 1 && (
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
      {step == 2 && (
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
      )}
      {step == 2 && (
        <View style={styles.buttonContainer}>
          <Pressable style={styles.signupButton} onPress={() => handleSignup()}>
            <Text style={styles.signupButtonText}>Join Now</Text>
          </Pressable>
          <Pressable
            style={styles.loginLink}
            onPress={() => navigate.toCommon.login()}>
            <Text style={styles.loginLinkText}>Already have an account? Log in</Text>
          </Pressable>
        </View>
      )}
      {step == 2 && (
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
      )}
    </ScrollView>
  );
};

export default Signup;
