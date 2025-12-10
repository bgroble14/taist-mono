import {faCheckCircle, faCircle, faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {Text, TouchableOpacity, View} from 'react-native';
import {styles} from '../styles';

type Props = {
  title: string;
  completed: boolean;
  onPress: () => void;
  isNext?: boolean; // Indicates this is the next step to complete
  subtitle?: string; // Optional subtitle text (e.g., for pending status)
};
const SettingItem = ({title, completed, onPress, isNext = false, subtitle}: Props) => {
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
      <View style={{flex: 1}}>
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
        {subtitle && (
          <Text
            style={{
              fontSize: 12,
              color: '#999',
              marginTop: 4,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <FontAwesomeIcon
        icon={faChevronRight}
        color={completed ? '#4CAF50' : isNext ? '#fa4616' : '#CCCCCC'}
        size={20}
      />
    </TouchableOpacity>
  );
};

export default SettingItem;
