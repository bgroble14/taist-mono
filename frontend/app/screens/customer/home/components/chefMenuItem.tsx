import { memo, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { IMenu, IMenuCustomization, IReview, IUser } from '../../../../types/index';
import { styles } from '../styles';

type Props = {
  item: IMenu;
  chefInfo: IUser;
  reviews: Array<IReview>;
  menus: Array<IMenu>;
  onNavigate: (chefId: number) => void;
};

const ChefMenuItem = ({
  item,
  chefInfo,
  onNavigate,
}: Props) => {
  // Memoize customization calculations - only recalculates when item.customizations changes
  const { price_customizations, names_customizations } = useMemo(() => {
    const customizations: Array<IMenuCustomization> = item.customizations ?? [];
    let price = 0;
    const names: string[] = [];

    customizations.forEach((c) => {
      price += c.upcharge_price ?? 0;
      names.push(c.name ?? '');
    });

    return { price_customizations: price, names_customizations: names };
  }, [item.customizations]);

  // Stable callback - navigates to chef detail (same as tapping chef card)
  const handlePress = useCallback(() => {
    onNavigate(chefInfo.id ?? 0);
  }, [onNavigate, chefInfo.id]);

  return (
    <TouchableOpacity onPress={handlePress} style={styles.chefCardMenuItem}>
      <View style={styles.chefCardMenuItemHeading}>
        <View style={{flex: 1}}>
          <Text style={styles.chefCardMenuItemTitle}>{item.title}</Text>
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
            style={styles.chefCardMenuItemPrice}>{`$${item.price?.toFixed(
            2,
          )} `}</Text>
          <Text style={styles.chefCardMenuItemSize}>{`${
            item.serving_size ?? 0
          } Person${(item.serving_size ?? 0) > 1 ? 's' : ''} `}</Text>
        </View>
      </View>
      <Text style={styles.chefCardMenuItemDescription}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );
};

// Custom comparison - only re-render if menu item ID or chef ID changes
export default memo(ChefMenuItem, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.chefInfo.id === nextProps.chefInfo.id &&
    prevProps.onNavigate === nextProps.onNavigate
  );
});
