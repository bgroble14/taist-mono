import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native';

// NPM
import {
  faAngleLeft
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

// Types & Services
import { IUser } from '../../../types/index';

// Reducers
import { setUser } from '../../../reducers/userSlice';

// Hooks
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';

import StyledSwitch from '../../../components/styledSwitch';
import Container from '../../../layout/Container';
import { clearChef } from '../../../reducers/chefSlice';
import { clearCustomer } from '../../../reducers/customerSlice';
import { hideLoading, showLoading } from '../../../reducers/loadingSlice';
import {
  clearTable
} from '../../../reducers/tableSlice';
import { UpdateUserAPI } from '../../../services/api';
import GlobalStyles from '../../../types/styles';
import { goBack, navigate } from '../../../utils/navigation';
import { ShowInfoToast } from '../../../utils/toast';
import { styles } from './styles';

const EarnByCooking = () => {
  const self = useAppSelector(x => x.user.user);
  const dispatch = useAppDispatch();

  const [becomeChef, onChangeBecomeChef] = useState(false);

  const handleBecomeChef = async () => {
    var params: IUser = {...self, user_type: 2, is_pending: 1};
    dispatch(showLoading());
    const resp = await UpdateUserAPI(params, dispatch);
    dispatch(hideLoading());
    if (resp.success == 1) {
      ShowInfoToast('Logging in as chef');
      dispatch(setUser({}));
      dispatch(clearTable());
      dispatch(clearChef());
      dispatch(clearCustomer());
      navigate.toAuthorizedStacks.noAuthorized();
    }
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
          <Text style={styles.pageTitle}>Cook with Taist </Text>
          <Text style={styles.subheading}>
            After submitting, you will be able to provide the required
            information in order to start sharing your cooking talents with
            customers{' '}
          </Text>
          <View style={styles.switchWrapper}>
            {/* <Text style={styles.switchText}>Apply to cook for Taist? </Text> */}
            <StyledSwitch
              label="Apply to cook for Taist? "
              value={becomeChef}
              onPress={() => onChangeBecomeChef(!becomeChef)}
            />
          </View>
          <View style={styles.vcenter}>
            <Pressable
              style={becomeChef ? GlobalStyles.btn : GlobalStyles.btnDisabled}
              onPress={() => handleBecomeChef()}
              disabled={!becomeChef}>
              <Text
                style={
                  becomeChef ? GlobalStyles.btnTxt : GlobalStyles.btnDisabledTxt
                }>
                SAVE{' '}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

export default EarnByCooking;
