import { Text, TextInput } from '@react-native-material/core';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';

import { goBack } from '@/app/utils/navigation';
import { useAppDispatch } from '../../../hooks/useRedux';
import { hideLoading, showLoading } from '../../../reducers/loadingSlice';
import { ForgotAPI, ResetPasswordAPI } from '../../../services/api';
import { ShowErrorToast } from '../../../utils/toast';
import { emailValidation, passwordValidation } from '../../../utils/validations';
import { styles } from './styles';

const Forgot = () => {
  const dispatch = useAppDispatch();

  const [email, onChangeEmail] = useState('');
  const [serverCode, onChangeServerCode] = useState('');
  const [code, onChangeCode] = useState('');
  const [password, onChangePassword] = useState('');
  const [confirmPassword, onChangeConfirmPassword] = useState('');

  const handleLogin = () => {
    // Navigate to login screen
    // router.push('/screens/common/login'); // Update when login route is available
   goBack();
  };
  const handleRequest = async () => {
    var errorMsg = emailValidation(email);
    if (errorMsg !== '') {
      ShowErrorToast(errorMsg);
      return;
    }

    dispatch(showLoading());
    const resp = await ForgotAPI(email);
    dispatch(hideLoading());

    if (resp.success == 0) {
      ShowErrorToast(resp.message ?? resp.error);
      return;
    }
    console.log('serverCode', resp.data);
    onChangeServerCode(resp.data);
  };

  const handleReset = async () => {
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
    if (code != serverCode) {
      ShowErrorToast('Please enter the code correctly');
      return;
    }
    if (password != confirmPassword) {
      ShowErrorToast('Passwords do not match');
      return;
    }

    dispatch(showLoading());
    const resp = await ResetPasswordAPI({code, password});
    dispatch(hideLoading());

    if (resp.success == 0) {
      ShowErrorToast(resp.message ?? resp.error);
      return;
    }

  goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.center}>
        <Image
          style={styles.logo}
          source={require('../../../assets/images/logo-2.png')}
        />
      </View>
      <View style={styles.vcenter}>
        <View>
          <Text style={styles.heading}>Forgot Password</Text>
        </View>
        {serverCode == '' ? (
          <View>
            <TextInput
              style={styles.formFields}
              inputStyle={styles.formInputFields}
              placeholder="Email "
              placeholderTextColor={'#999999'}
              variant="standard"
              onChangeText={txt => onChangeEmail(txt.toLowerCase())}
              value={email}
              keyboardType="email-address"
              color="#1a1a1a"
              autoCapitalize={'none'}
            />
          </View>
        ) : (
          <View>
            <TextInput
              style={styles.formFields}
              inputStyle={styles.formInputFields}
              placeholder="Code "
              placeholderTextColor={'#999999'}
              variant="standard"
              onChangeText={txt => onChangeCode(txt.toLowerCase())}
              value={code}
              keyboardType="default"
              color="#1a1a1a"
              autoCapitalize={'none'}
            />
            <TextInput
              style={styles.formFields}
              inputStyle={styles.formInputFields}
              placeholder="Password "
              placeholderTextColor={'#999999'}
              variant="standard"
              onChangeText={onChangePassword}
              value={password}
              textContentType="password"
              secureTextEntry
              color="#1a1a1a"
            />
            <TextInput
              style={styles.formFields}
              inputStyle={styles.formInputFields}
              placeholder="Confirmation Password "
              placeholderTextColor={'#999999'}
              variant="standard"
              onChangeText={onChangeConfirmPassword}
              value={confirmPassword}
              textContentType="password"
              secureTextEntry
              color="#1a1a1a"
            />
          </View>
        )}
      </View>
      <View style={styles.vcenter}>
        <Pressable
          style={styles.button}
          onPress={serverCode == '' ? handleRequest : handleReset}>
          <Text style={styles.buttonText}>
            {serverCode == '' ? 'Request ' : 'Reset '}
          </Text>
        </Pressable>
        <Pressable style={styles.button2} onPress={handleLogin}>
          <Text style={styles.buttonText2}>Login </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default Forgot;
