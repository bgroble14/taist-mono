import {faSquare, faSquareCheck} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {Text, TouchableOpacity} from 'react-native';
import {styles} from '../styles';

type Props = {
  title: string;
  completed: boolean;
  onPress: () => void;
};
const SettingItem = ({title, completed, onPress}: Props) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <FontAwesomeIcon
        icon={completed ? faSquareCheck : faSquare}
        color={'#ffffff'}
        size={40}
      />
      <Text style={styles.text} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default SettingItem;
