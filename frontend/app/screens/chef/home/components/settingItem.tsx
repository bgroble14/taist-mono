import {faCheckCircle, faCircle, faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {Text, TouchableOpacity, View} from 'react-native';
import {styles} from '../styles';

type Props = {
  title: string;
  completed: boolean;
  onPress: () => void;
  isNext?: boolean; // Indicates this is the next step to complete
};
const SettingItem = ({title, completed, onPress, isNext = false}: Props) => {
  return (
    <TouchableOpacity 
      style={[
        styles.settingItemCard,
        completed && styles.settingItemCompleted,
        isNext && !completed && styles.settingItemNext,
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemIcon}>
        {completed ? (
          <FontAwesomeIcon
            icon={faCheckCircle}
            color={'#4CAF50'} // Green for completed
            size={28}
          />
        ) : (
          <FontAwesomeIcon
            icon={faCircle}
            color={isNext ? '#fa4616' : '#CCCCCC'} // Orange for next, gray for future
            size={28}
          />
        )}
      </View>
      <Text 
        style={[
          styles.settingItemText,
          completed && styles.settingItemTextCompleted,
          isNext && !completed && styles.settingItemTextNext,
        ]} 
        numberOfLines={2}
      >
        {title}
      </Text>
      <FontAwesomeIcon
        icon={faChevronRight}
        color={completed ? '#4CAF50' : isNext ? '#fa4616' : '#CCCCCC'}
        size={20}
      />
    </TouchableOpacity>
  );
};

export default SettingItem;
