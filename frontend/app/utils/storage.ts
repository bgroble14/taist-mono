import AsyncStorage from '@react-native-async-storage/async-storage';

export const ClearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('STORE ERROR', error);
  }
};

export const StoreLoginData = async (value:{}) => {
  await StoreDataToStorage('@login', value);
};
  
export const ReadLoginData = async () => {
  const data = await ReadDataFromStorage('@login');
  return data;
};

export const StoreDataToStorage = async (key:string, value:{}) => {
  try {
    console.log('STORE DATA', value);
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('STORE ERROR', error);
  }
};
  
export const ReadDataFromStorage = async (key:string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    console.log('READ DATA', jsonValue);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('READ ERROR', error);
    return null;
  }
};