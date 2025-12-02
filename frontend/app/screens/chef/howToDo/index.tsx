import { useMemo, useRef, useState } from 'react';
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

import { goBack } from '@/app/utils/navigation';
import Container from '../../../layout/Container';
import { AppColors } from '../../../../constants/theme';
import { styles } from './styles';

const HowToDo = () => {
  const dispatch = useAppDispatch();
  const screenWidth = Dimensions.get('window').width;
  const scrollRef = useRef<ScrollView>(null);
  const [pageIndex, onChangePageIndex] = useState(0);

  const pages = useMemo(
    () => [
      {
        id: '1',
        img: require('../../../assets/images/onboarding.jpg'),
        imgHeight: 200,
        title: "Here's what chefs\nhave realized.",
        texts: [
          "It's 24/7! You choose when you want to work and how much you want to work. ",
          'You set your own pricing, so you control your own profit margins! ',
          "Make whatever you'd like! Just add new items to your Menu or switch them out for later. ",
        ],
      },
      {
        id: '2',
        img: undefined,
        imgHeight: 200,
        title: 'Before the Order',
        texts: [
          "• Make sure you've added your profile pic, your availability, and a menu item. Then, set up your payment info in order to get paid. ",
          "• You'll soon receive requests from customers. Accept the order request via the Taist app. ",
          '• Buy the ingredients for the upcoming order, if needed. ',
        ],
      },
      {
        id: '3',
        img: undefined,
        imgHeight: 200,
        title: 'The Order',
        texts: [
          '• Travel to the customer with the necessary materials. Refrigerate cold ingredients during travel. ',
          "• Use the kitchen appliances required to complete the order all out of the customer's kitchen. ",
          '• Wash equipment and clean surfaces in-between cooking instead of waiting until the very end. ',
          '• Plate the completed order, if needed. ',
        ],
      },
      {
        id: '4',
        img: undefined,
        imgHeight: 200,
        title: 'Necessary',
        texts: [
          '• Any cooking equipment (pots, pans, etc.) ',
          '• Ingredients. And backup ingredients 🙂 ',
          '• Cooler with ice for cold ingredients ',
          '• Cleaning equipment (sponge, soap, surface cleaning spray, paper towels). ',
        ],
      },
      {
        id: '5',
        img: undefined,
        imgHeight: 200,
        title: 'Food Safety',
        texts: [
          "• Chill. Refrigerate cold ingredients promptly until arriving at the customer's location. ",
          '• Clean. Wash hands and any surfaces before starting the order. ',
          "• Separate. Don't let ingredients touch until mixing to avoid cross-contamination. ",
          '• Cook. Allow food to reach the proper heat levels to avoid undercooking. ',
        ],
      },
      {
        id: '6',
        imgHeight: 320,
        img: require('../../../assets/images/onboarding_end.png'),
        title: 'No Certification or Insurance Required',
        texts: [
          'All are required to pass a background check. Taist covers your insurance. ',
        ],
      },
    ],
    [],
  );

  const handleScrollIndexChange = (e: any) => {
    const {nativeEvent} = e;
    const index = Math.round(nativeEvent.contentOffset.x / (screenWidth - 20));
    onChangePageIndex(index);
  };

  const handlePagination = (idx: number) => {
    onChangePageIndex(idx);
    if (idx < pages.length) {
      scrollRef.current?.scrollTo({x: screenWidth * idx});
    } else {
      goBack();
    }
  };

  return (
    <SafeAreaView style={styles.main}>
      <Container backMode title="How To Do It">
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollIndexChange}>
          {pages.map((page, idx) => {
            return (
              <ScrollView
                contentContainerStyle={styles.pageView}
                key={`page_${idx}`}>
                <View
                  style={[
                    styles.imgContainer,
                    {height: page.imgHeight},
                    // Add white background when displaying actual images
                    page.img && {backgroundColor: '#ffffff'},
                    // Add orange background when displaying logo for proper contrast
                    !page.img && {backgroundColor: AppColors.primary},
                  ]}>
                  <Image
                    source={
                      page.img ?? require('../../../assets/images/logo.png')
                    }
                    style={page.img ? styles.pageImg : styles.logo}
                  />
                </View>
                <Text style={styles.pageTitle}>{page.title}</Text>
                <View style={styles.subPageView}>
                  {page.texts.map((text: string, index: number) => {
                    return (
                      <Text
                        style={[
                          styles.pageText,
                          (page.id === '1' || page.id === '6') && {
                            textAlign: 'center',
                          },
                        ]}
                        key={`text_${idx}_${index}`}>
                        {text}
                      </Text>
                    );
                  })}
                </View>
              </ScrollView>
            );
          })}
        </ScrollView>

        <View style={styles.bottomContainer}>
          <View style={styles.paginationContainer}>
            {pages.map((page, idx) => {
              return (
                <Pressable
                  key={`pn_${idx}`}
                  style={[
                    styles.paginationIndicator,
                    pageIndex === idx && {backgroundColor: 'white'},
                  ]}
                  onPress={() => handlePagination(idx)}
                />
              );
            })}
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handlePagination(pageIndex + 1)}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </Container>
    </SafeAreaView>
  );
};

export default HowToDo;
