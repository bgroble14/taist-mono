import {Text, View} from 'react-native';
import {IMessage, IUser} from '../../../../types/index';
import {styles} from '../styles';
import {getFormattedTimeA} from '../../../../utils/validations';

type Props = {
  msg: IMessage;
  fromUser: IUser;
  toUser: IUser;
  isMy: boolean;
};
const TextBubble = ({msg, isMy}: Props) => {
  return (
    <View style={isMy ? styles.myBubbleContainer : styles.bubbleContainer}>
      <Text style={styles.bubbleTimeText}>
        {getFormattedTimeA((msg.created_at ?? 0) * 1000)}
      </Text>
      <View style={isMy ? styles.myBubble : styles.bubble}>
        <Text style={styles.bubbleText}>{msg.message}</Text>
      </View>
    </View>
  );
};

export default TextBubble;
