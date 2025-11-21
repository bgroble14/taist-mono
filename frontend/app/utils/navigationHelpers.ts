import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { goBack, navigate } from '../utils/navigation';

// Example of how to use navigation in your components
export const NavigationExamples = {
  // Navigate to a screen
  navigateToHome: () => {
    navigate.toCommon.splash();
  },

  // Navigate to auth screens
  navigateToLogin: () => {
    navigate.toCommon.login();
  },

  // Navigate to customer screens
  navigateToCustomerHome: () => {
    navigate.toCustomer.home();
  },

  // Navigate to chef screens
  navigateToChefHome: () => {
    navigate.toChef.home();
  },

  // Go back
  goBack: () => {
    goBack();
  },

  // Reset navigation stack
  resetToLogin: () => {
    navigate.toCommon.login();
  }
};

// Example Redux usage
export const useAuthNavigation = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);

  const handleLogout = () => {
    // Dispatch logout action
    dispatch({ type: 'USER_LOGOUT' });
    // Navigate to login
    navigate.toCommon.login();
  };

  const handleLogin = (userType: number) => {
    // Navigate based on user type
    if (userType === 1) { // Customer
      navigate.toCustomer.home();
    } else if (userType === 2) { // Chef
      navigate.toChef.home();
    }
  };

  return {
    handleLogout,
    handleLogin,
    user
  };
};
