import {Text, View} from 'react-native';
import styles from './styles';
 
type Props = {
  text: string;
};

const EmptyListView = (props: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.txt}>{props.text}</Text>
    </View>
  );
};

export default EmptyListView;
