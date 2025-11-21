import { navigate } from '@/app/utils/navigation';
import { IconButton, Text, TextInput } from '@react-native-material/core';
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
          source={require('../../../assets/images/logo.png')}
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
        <View style={styles.vcenter}>
          <View>
            <Text style={styles.heading}>Sign Up</Text>
          </View>
          <View>
            <TextInput
              style={styles.formFields}
              inputStyle={styles.formInputFields}
              placeholder="Email "
              placeholderTextColor={'#ffffff'}
              variant="standard"
              onChangeText={txt => onChangeEmail(txt.toLowerCase())}
              value={email}
              keyboardType="email-address"
              color="#ffffff"
              autoCapitalize={'none'}
            />
            <TextInput
              style={styles.formFields}
              inputStyle={styles.formInputFields}
              placeholder="Password "
              placeholderTextColor={'#ffffff'}
              variant="standard"
              onChangeText={onChangePassword}
              value={password}
              textContentType="password"
              secureTextEntry={true}
              color="#ffffff"
              trailing={props => (
                <IconButton icon={props => <></>} {...props} />
              )}
            />
          </View>
        </View>
      )}
      {step == 2 && (
        <View style={styles.vcenter}>
          <Pressable style={styles.button} onPress={() => handleSignup()}>
            <Text style={styles.buttonText}>Join Now</Text>
          </Pressable>
          <Pressable
            style={styles.button2}
            onPress={() => navigate.toCommon.login()}>
            <Text style={styles.buttonText2}>Login</Text>
          </Pressable>
        </View>
      )}
      {step == 2 && (
        <View style={styles.vcenter}>
          {/* <View>
            <Text style={styles.heading2}>Or sign up with:</Text>
          </View>
          <View style={styles.socialIconsWrapper}>
            <View style={styles.socialIconContainer}>
              <Image
                style={styles.socialIcon}
                source={require('../../../assets/icons/apple.png')}
              />
            </View>
            <View style={styles.socialIconContainer}>
              <Image
                style={styles.socialIcon}
                source={require('../../../assets/icons/google.png')}
              />
            </View>
          </View> */}
          <View style={styles.terms}>
            <Text style={styles.termsText}>I agree to Taist's </Text>
            <Text
              style={styles.termsButton}
              onPress={() => navigate.toCommon.terms()}>
              Terms and Conditions{' '}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default Signup;
