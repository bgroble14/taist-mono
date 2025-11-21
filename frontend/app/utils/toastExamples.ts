import { ShowErrorToast, ShowInfoToast, ShowSuccessToast } from '../utils/toast';

// Example of how to use Toast in your components
export const ToastExamples = {
  // Success toast
  showSuccess: (message: string) => {
    ShowSuccessToast(message, 'Success');
  },

  // Error toast
  showError: (message: string) => {
    ShowErrorToast(message, 'Error');
  },

  // Info toast
  showInfo: (message: string) => {
    ShowInfoToast(message, 'Info');
  },

  // Login success example
  showLoginSuccess: (userName: string) => {
    ShowSuccessToast(`Welcome back, ${userName}!`, 'Login Successful');
  },

  // Login error example
  showLoginError: (error: string) => {
    ShowErrorToast(error, 'Login Failed');
  },

  // Order success example
  showOrderSuccess: (orderNumber: string) => {
    ShowSuccessToast(`Order ${orderNumber} placed successfully!`, 'Order Confirmed');
  }
};

// Example usage in a component:
/*
import { ToastExamples } from '../utils/toastExamples';

const MyComponent = () => {
  const handleLogin = async () => {
    try {
      const response = await loginAPI();
      ToastExamples.showLoginSuccess(response.user.name);
    } catch (error) {
      ToastExamples.showLoginError(error.message);
    }
  };

  return (
    // Your component JSX
  );
};
*/
