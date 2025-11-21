import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import StyledProfileImage from '../../../../components/styledProfileImage';
import { IMenu, IReview, IUser } from '../../../../types/index';
import { getImageURL } from '../../../../utils/functions';
import { styles } from '../styles';
import ChefMenuItem from './chefMenuItem';

type Props = {
  chefInfo: IUser;
  reviews: Array<IReview>;
  menus: Array<IMenu>;
  gotoChefDetail: (chefId: number) => void;
  gotoOrder: (
    orderMenu: IMenu,
    chefInfo: IUser,
    reviews: Array<IReview>,
    menus: Array<IMenu>,
  ) => void;
};

const ChefCard = ({
  chefInfo,
  reviews,
  menus,
  gotoChefDetail,
  gotoOrder,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  var totalRatings = 0;
  reviews.map((item, index) => {
    totalRatings += item.rating ?? 0;
  });

  return (
    <View style={styles.chefCard}>
      <TouchableOpacity
        style={styles.chefCardMain}
        onPress={() => gotoChefDetail(chefInfo.id ?? 0)}>
        <StyledProfileImage url={getImageURL(chefInfo.photo)} size={80} />
        <View style={styles.chefCardInfo}>
          <View style={{flex: 1}}>
            <Text style={styles.chefCardTitle}>{`${
              chefInfo.first_name
            } ${chefInfo.last_name?.substring(0, 1)}. `}</Text>
            <Text style={styles.chefCardDescription} numberOfLines={2}>
              {chefInfo.bio ?? ''}
            </Text>
          </View>

          {reviews.length > 0 && (
            <View style={styles.chefCardReview}>
              <StarRatingDisplay
                rating={totalRatings / reviews.length}
                starSize={20}
                starStyle={{marginHorizontal: 0}}
              />
              <Text style={{ fontSize: 14, letterSpacing: 0.5 }}>{`(${reviews.length}) `}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setMenuOpen(!menuOpen)}
          style={{
            padding: 20,
            paddingHorizontal: 10,
          }}>
          {!menuOpen && (
            <FontAwesomeIcon icon={faAngleDown} size={20} color="#000000" />
          )}
          {menuOpen && (
            <FontAwesomeIcon icon={faAngleUp} size={20} color="#000000" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
      {menuOpen && (
        <View style={styles.chefCardMenu}>
          {menus.map((item, index) => {
            return (
              <ChefMenuItem
                item={item}
                onPress={() => gotoOrder(item, chefInfo, reviews, menus)}
                key={`menuItem_${index}`}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ChefCard;
