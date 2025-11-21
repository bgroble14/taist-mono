import { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Hooks
import { useAppDispatch } from '../../../hooks/useRedux';
import { navigate } from '../../../utils/navigation';

import { styles } from './styles';


const Onboarding = () => {
  const dispatch = useAppDispatch();
  const screenWidth = Dimensions.get('window').width;
  const scrollRef = useRef<ScrollView>(null);
  const [pageIndex, onChangePageIndex] = useState(0);

  const handleScrollIndexChange = (e: any) => {
    const {nativeEvent} = e;
    const index = Math.round(nativeEvent.contentOffset.x / (screenWidth - 20));
    onChangePageIndex(index);
  };

  const handlePagination = (idx: number) => {
    onChangePageIndex(idx);
    if (idx < 5) {
      scrollRef.current?.scrollTo({x: screenWidth * idx});
    } else {
      navigate.toChef.tabs();
    }
  };

  const onboardPage = ({img, title, texts}: any) => {
    return (
      <View style={styles.pageView}>
        <Image source={img} style={styles.pageImg} />
        <Text style={styles.pageTitle}>{title}</Text>
        <View style={styles.subPageView}>
          {texts.map((text: string, index: number) => {
            return (
              <Text style={styles.pageText} key={`text_${index}`}>
                {text}
              </Text>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.main}>
      {/* <HeaderWithBack /> */}
      <View style={{flex: 1, paddingBottom: 50}}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollIndexChange}
          // snapToInterval={screenWidth}
        >
          {onboardPage({
            img: require('../../../assets/images/onboarding.jpg'),
            title: 'Set up your account and profile picture ',
            texts: [
              'Ability to view this step already compleeted (checked off) due to user populating information after choosing to become a chef',
              'Ability to require and only allow profile picture to access camera an NOT cameral roll/photo library ',
            ],
          })}
          {onboardPage({
            img: require('../../../assets/images/onboarding.jpg'),
            title: 'Create your menu ',
            texts: [
              'Ability to require at least one menu item saved (“On Menu”) for this step to be checked off ',
              'Ability to direct user back to Home tab after first menu item is saved (On Menu”) with above requirements; Otherwise, error message shows ',
            ],
          })}
          {onboardPage({
            img: require('../../../assets/images/onboarding.jpg'),
            title: 'Complete your profile ',
            texts: [
              'Ability to require input of at least one day of the week (and time) in the Availability section for this step to be checked off ',
              'Ability to also require a minimum number of characters in the Bio section for this step to be checked off ',
              'Ability to direct user back to Home tab after the form/page is saved with above requirements;\nOtherwise, error message shows ',
            ],
          })}
          {onboardPage({
            img: require('../../../assets/images/onboarding.jpg'),
            title: 'Submit payment info ',
            texts: [
              'Ability to require correct and complete execution of Stripe setup process for this step to be checked off ',
            ],
          })}
          {onboardPage({
            img: require('../../../assets/images/onboarding.jpg'),
            title: 'Begin background check ',
            texts: [
              'Ability to require correct and complete execution of service’s process for this step to be checked off ',
            ],
          })}
        </ScrollView>
        <View style={styles.paginationContainer}>
          <Pressable
            style={[
              styles.paginationIndicator,
              pageIndex === 0 && {backgroundColor: 'white'},
            ]}
            onPress={() => handlePagination(0)}
          />
          <Pressable
            style={[
              styles.paginationIndicator,
              pageIndex === 1 && {backgroundColor: 'white'},
            ]}
            onPress={() => handlePagination(1)}
          />
          <Pressable
            style={[
              styles.paginationIndicator,
              pageIndex === 2 && {backgroundColor: 'white'},
            ]}
            onPress={() => handlePagination(2)}
          />
          <Pressable
            style={[
              styles.paginationIndicator,
              pageIndex === 3 && {backgroundColor: 'white'},
            ]}
            onPress={() => handlePagination(3)}
          />
          <Pressable
            style={[
              styles.paginationIndicator,
              pageIndex === 4 && {backgroundColor: 'white'},
            ]}
            onPress={() => handlePagination(4)}
          />
        </View>

        <View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handlePagination(pageIndex + 1)}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
