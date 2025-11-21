import { Text, TouchableOpacity, View } from 'react-native';
import { IMenu, IMenuCustomization } from '../../../../types/index';
import { styles } from '../styles';

type Props = {
  item: IMenu;
  onPress: () => void;
};
const ChefMenuItem = (props: Props) => {
  const customizations: Array<IMenuCustomization> =
    props.item.customizations ?? [];
  var price_customizations = 0;
  var names_customizations: Array<string> = [];
  customizations.map((c, idx) => {
    price_customizations += c.upcharge_price ?? 0;
    names_customizations.push(c.name ?? '');
  });
  return (
    <TouchableOpacity onPress={props.onPress} style={styles.chefCardMenuItem}>
      <View style={styles.chefCardMenuItemHeading}>
        <View style={{flex: 1}}>
          <Text style={styles.chefCardMenuItemTitle}>{props.item.title}</Text>
          {/* {customizations.length > 0 && (
            <Text style={[styles.chefCardMenuItemSize]} numberOfLines={1}>
              {`Customizations: ${names_customizations.join(
                ' & ',
              )} (+$${price_customizations.toFixed(2)})`}
            </Text>
          )} */}
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text
            style={styles.chefCardMenuItemPrice}>{`$${props.item.price?.toFixed(
            2,
          )} `}</Text>
          <Text style={styles.chefCardMenuItemSize}>{`${
            props.item.serving_size ?? 0
          } Person${(props.item.serving_size ?? 0) > 1 ? 's' : ''} `}</Text>
        </View>
      </View>
      <Text style={styles.chefCardMenuItemDescription}>
        {props.item.description}
      </Text>
    </TouchableOpacity>
  );
};

export default ChefMenuItem;
