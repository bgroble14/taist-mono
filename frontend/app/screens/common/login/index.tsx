import { Button, IconButton, Text, TextInput } from '@react-native-material/core';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';

import { navigate } from '@/app/utils/navigation';
import { useAppDispatch } from '../../../hooks/useRedux';
import { hideLoading, showLoading } from '../../../reducers/loadingSlice';
import { LoginAPI } from '../../../services/api';
import { ShowErrorToast } from '../../../utils/toast';
import { emailValidation, passwordValidation } from '../../../utils/validations';
import { styles } from './styles';

const Login = () => {
  const dispatch = useAppDispatch();

  const [errors, setErrors] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [email, onChangeEmail] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const [visiblePassword, onChangeVisiblePassword] = useState(false);
  const [chefMode, onChangeChefMode] = useState(false);
  const [pendingChef, onChangePending] = useState(false);

  const handleLogin = async () => {
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

    dispatch(showLoading());
    const resp = await LoginAPI({email, password, remember: true}, dispatch);
    dispatch(hideLoading());

    if (resp.success == 0) {
      ShowErrorToast(resp.message ?? resp.error);
      return;
    }

    // Navigate to appropriate home screen based on user type
    if (resp.data?.user?.user_type == 1) {
      navigate.toAuthorizedStacks.customerAuthorized();
    } else {
      navigate.toAuthorizedStacks.chefAuthorized();
    }
  };

  const handleForgot = async () => {
   navigate.toCommon.forget(); // Update when forgot route is available
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.center}>
        <Image
          style={styles.logo}
          source={require('../../../assets/images/logo.png')}
        />
      </View>
      <View style={styles.vcenter}>
        <View>
          <Text style={styles.heading}>Login</Text>
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
            secureTextEntry={!visiblePassword}
            color="#ffffff"
            trailing={props => (
              <IconButton
                icon={props => (
                  <Image
                    style={{
                      width: 20,
                      height: 20,
                      resizeMode: 'contain',
                      tintColor: 'white',
                    }}
                    source={
                      visiblePassword
                        ? require('../../../assets/icons/icon_invisible.png')
                        : require('../../../assets/icons/icon_visible.png')
                    }
                  />
                )}
                onPress={() => {
                  onChangeVisiblePassword(!visiblePassword);
                }}
                {...props}
              />
            )}
          />
        </View>
        <Button
          style={styles.forgot}
          variant="text"
          uppercase={false}
          titleStyle={styles.forgotText}
          compact={true}
          title="Forgot Password?"
          onPress={handleForgot}
        />
      </View>
      <View style={styles.vcenter}>
        <Pressable style={styles.button} onPress={() => handleLogin()}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
        <Pressable
          style={styles.button2}
          onPress={() =>   navigate.toCommon.signup()}>
          <Text style={styles.buttonText2}>Sign Up</Text>
        </Pressable>
      </View>
      {/* <View
        style={{
          alignItems: 'center',
          marginTop: 30,
          gap: 10,
        }}>
        <StyledCheckBox
          value={chefMode}
          onPress={() => onChangeChefMode(!chefMode)}
          label="Chef Mode "
        />
        {chefMode && (
          <StyledCheckBox
            value={pendingChef}
            onPress={() => onChangePending(!pendingChef)}
            label="Pending Chef"
          />
        )}
      </View> */}
    </ScrollView>
  );
};

export default Login;
