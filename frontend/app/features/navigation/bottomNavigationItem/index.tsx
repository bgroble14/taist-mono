import React from 'react';
import {View} from 'react-native';
import {styles} from './styles';

interface IBottomNavigationItem {
  icon: React.ReactNode;
  focused: boolean;
}

const BottomNavigationItem = ({icon, focused}: IBottomNavigationItem) => {
  return <View style={styles.wrapper}>{icon}</View>;
};

export default BottomNavigationItem;
