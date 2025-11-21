import { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Types & Services
import {
  IMenu,
  IMenuCustomization
} from '../../../types/index';

// Hooks
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';

import { goBack, navigate } from '@/app/utils/navigation';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'react-native';
import StyledButton from '../../../components/styledButton';
import StyledSwitch from '../../../components/styledSwitch';
import StyledTextInput from '../../../components/styledTextInput';
import Container from '../../../layout/Container';
import { hideLoading, showLoading } from '../../../reducers/loadingSlice';
import {
  CreateCategoryAPI,
  CreateMenuAPI,
  UpdateMenuAPI
} from '../../../services/api';
import { convertStringToNumber, getImageURL } from '../../../utils/functions';
import { ShowErrorToast, ShowSuccessToast } from '../../../utils/toast';
import { styles } from './styles';

 
const AddMenuItem = () => {
  const params = useLocalSearchParams(); 
  const self = useAppSelector(x => x.user.user);
  const categories = useAppSelector(x => x.table.categories);
  const appliances   = useAppSelector(x => x.table.appliances);
  const allergen = useAppSelector(x => x.table.allergens);
  const dispatch = useAppDispatch();
  const info: IMenu | undefined = typeof params?.info === 'string'
    ? JSON.parse(params.info as string)
    : (params?.info as IMenu | undefined);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [categoryIds, setCategoryIds] = useState<Array<number>>([]);
  const [isNewCategory, setEnableNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [applianceIds, setApplianceIds] = useState<Array<number>>([1]);
  const [allergyIds, setAllergyIds] = useState<Array<number>>([]);
  const [completionTimeId, setCompletionTimeId] = useState('1');
  const [size, setSize] = useState(1);
  const [price, setPrice] = useState('');
  const [customizations, setCustomizations] = useState<
    Array<IMenuCustomization>
  >([]);
  const [displayItem, setDisplayItem] = useState(true);

  const completionTimes = useMemo(
    () => [
      {id: '1', value: '2 hr + ', m: 120},
      {id: '2', value: '1.5 hr ', m: 90},
      {id: '3', value: '1 hr ', m: 60},
      {id: '4', value: '45 m ', m: 45},
      {id: '5', value: '30 m ', m: 30},
      {id: '6', value: '15 m ', m: 15},
    ],
    [],
  );

  useEffect(() => {
    if (info) {
      setName(info.title ?? '');
      setDesc(info.description ?? '');
      setCategoryIds(
        (info.category_ids ?? '').split(',').map(x => {
          return parseInt(x);
        }),
      );
      setApplianceIds(
        (info.appliances ?? '').split(',').map(x => {
          return parseInt(x);
        }),
      );
      setAllergyIds(
        (info.allergens ?? '').split(',').map(x => {
          return parseInt(x);
        }),
      );
      setCompletionTimeId(
        completionTimes.find(x => x.m == info.estimated_time)?.id ?? '',
      );
      setSize(info.serving_size ?? 0);
      setPrice(info.price ? info.price.toFixed(2) : '');
      setDisplayItem(info.is_live == 1 ? true : false);
      setCustomizations(info.customizations ?? []);
    }
  }, []);

  const handleCategoryPress = (id: number) => {
    var tempIds = [...categoryIds];
    var index = tempIds.findIndex(x => x === id);
    if (index >= 0) {
      tempIds.splice(index, 1);
    } else {
      tempIds.push(id);
    }
    setCategoryIds(tempIds);
  };

  const handleAppliancePress = (id: number) => {
    var tempIds = [...applianceIds];
    var index = tempIds.findIndex(x => x === id);
    if (index >= 0) {
      tempIds.splice(index, 1);
    } else {
      tempIds.push(id);
    }
    if (tempIds.length == 0) {
      tempIds.push(appliances[0].id ?? 0);
    }
    setApplianceIds(tempIds);
  };

  const handleAllergyPress = (id: number) => {
    var tempIds = [...allergyIds];
    var index = tempIds.findIndex(x => x === id);
    if (index >= 0) {
      tempIds.splice(index, 1);
    } else {
      tempIds.push(id);
    }
    setAllergyIds(tempIds);
  };

  const handleCompletionTimePress = (id: string) => {
    setCompletionTimeId(id);
  };

  const handleAddCustomization = () => {
    navigate.toChef.addOnCustomization(handleAddCustomizationInner);
  };

  const handleAddCustomizationInner = (item: {
    name: string;
    upcharge_price: number;
  }) => {
    setCustomizations([...customizations, {...item}]);
  };

  const handleRemoveCustomization = (idx: number) => {
    var newCustomizations = [...customizations];
    newCustomizations.splice(idx, 1);
    setCustomizations(newCustomizations);
  };

  const handleSubmit = async () => {
    if (categoryIds.length == 0 && (!isNewCategory || newCategoryName == '')) {
      ShowErrorToast('Please select one or more categories');
      return;
    }

    if (name == '') {
      ShowErrorToast('Please input the name');
      return;
    }

    if (desc == '') {
      ShowErrorToast('Please input the description');
      return;
    }

    if (completionTimeId == '') {
      ShowErrorToast('Please select the estimated time');
      return;
    }

    if (size <= 0) {
      ShowErrorToast('Please enter the serving size');
      return;
    }

    if (price == '') {
      ShowErrorToast('Please enter the price');
      return;
    }

    if (applianceIds.length == 0) {
      ShowErrorToast('Please select one or more appliances');
      return;
    }

    var category_id_list = [...categoryIds];
    dispatch(showLoading());
    if (isNewCategory && newCategoryName != '') {
      const resp_new_category = await CreateCategoryAPI(
        {name: newCategoryName},
        dispatch,
      );
      if (resp_new_category.success == 1) {
        category_id_list.push(resp_new_category.data.id);
      }
    }

    var params: IMenu & any = {
      title: name,
      description: desc,
      price,
      serving_size: size,
      meals: 'breakfast',
      category_ids: category_id_list.join(','),
      allergens: allergyIds.join(','),
      appliances: applianceIds.join(','),
      estimated_time:
        completionTimes.find(x => x.id == completionTimeId)?.m ?? 0,
      is_live: displayItem ? 1 : 0,
      customizations: JSON.stringify(customizations),
    };

    let resp_menu;
    if (info && info.id !== undefined) {
      params.id = info.id;
      resp_menu = await UpdateMenuAPI(params, dispatch);
    } else {
      resp_menu = await CreateMenuAPI(params, dispatch);
    }
    if (resp_menu.success == 1) {
      ShowSuccessToast('Added the menu item successfully!');
    } else {
      ShowErrorToast(resp_menu.error || resp_menu.message);
    }

    dispatch(hideLoading());
    goBack();
  };

  return (
    <SafeAreaView style={styles.main}>
      <Container
        backMode
        title="Add Menu Item"
        containerStyle={{marginBottom: 0}}>
        <ScrollView contentContainerStyle={styles.pageView}>
          <View style={styles.subMainContainer}>
            <Text style={styles.title}>Name </Text>
            <Text style={styles.subTitle}>
              This is the name that will be displayed to customers.{' '}
            </Text>
            <StyledTextInput
              placeholder="* Menu Item Name "
              onChangeText={setName}
              value={name}
            />
          </View>

          <View style={styles.subMainContainer}>
            <Text style={styles.title}>Description </Text>
            <Text style={styles.subTitle}>
              Give customers a short summary of the item.{' '}
            </Text>
            <StyledTextInput
              placeholder="* Description "
              onChangeText={setDesc}
              value={desc}
              multiline
            />
          </View>

          <View style={styles.subMainContainer}>
            <Text style={styles.title}>Categories * </Text>
            <Text style={styles.subTitle}>Select one or more catetories </Text>
            <View style={styles.tabContainer}>
              {categories.map((category, idx) => {
                const isSelected = categoryIds.includes(category.id ?? 0);
                return (
                  <TouchableOpacity
                    style={isSelected ? styles.tab : styles.tabDisabled}
                    key={`category_${idx}`}
                    onPress={() => handleCategoryPress(category.id ?? 0)}>
                    <Text
                      style={
                        isSelected ? styles.tabText : styles.tabDisabledText
                      }>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {/* <Text style={styles.title}>Request a new Category? </Text> */}
            <StyledSwitch
              label="Request a new Category?"
              value={isNewCategory}
              onPress={() => {
                setEnableNewCategory(!isNewCategory);
              }}
            />
            {isNewCategory && (
              <StyledTextInput
                placeholder="* Category Name "
                onChangeText={setNewCategoryName}
                value={newCategoryName}
              />
            )}
          </View>

          <View style={styles.subMainContainer}>
            <Text style={styles.title}>Required Appliances </Text>
            <Text style={styles.subTitle}>
              Select the customer's kitchen appliances that are required to make
              the item.{' '}
            </Text>
            <View style={styles.applianceContainer}>
              {appliances.map((appliance, idx) => {
                const isSelected = applianceIds.includes(appliance.id ?? 0);
                if (isSelected == false && appliance.name == 'Sink') {
                  handleAppliancePress(appliance.id ?? 0);
                }
                return (
                  <TouchableOpacity
                    style={
                      isSelected
                        ? styles.applianceSelected
                        : styles.applianceNormal
                    }
                    onPress={() => handleAppliancePress(appliance.id ?? 0)}
                    disabled={appliance.name == 'Sink'}
                    key={`appliance_${idx}`}>
                    <Image
                      source={{uri: getImageURL(appliance.image)}}
                      style={styles.applianceImg}
                    />
                    <Text
                      style={
                        isSelected
                          ? styles.applianceTextSelected
                          : styles.applianceText
                      }>
                      {appliance.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.subMainContainer}>
            <Text style={styles.title}>Allergens </Text>
            <Text style={styles.subTitle}>
              For Customers with Allergies, select below if your Menu Item
              contains any of the following.{' '}
            </Text>
            {allergen.map((allergy, idx) => {
              const isSelected = allergyIds.includes(allergy.id ?? 0);
              return (
                <StyledSwitch
                  key={`allergy_${idx}`}
                  label={allergy.name ?? ''}
                  value={isSelected}
                  onPress={() => {
                    handleAllergyPress(allergy.id ?? 0);
                  }}
                />
              );
            })}
          </View>

          <View style={styles.subMainContainer}>
            <Text style={styles.title}>Estimated Completion Time </Text>
            <Text style={styles.subTitle}>
              Select the estimated time it takes to complete the item from start
              to finish. This inlcudes cleanup.{' '}
            </Text>
            <View style={styles.completionTimeContainer}>
              {completionTimes.map((ct, idx) => {
                const isSelected = ct.id === completionTimeId;
                return (
                  <TouchableOpacity
                    style={isSelected ? styles.tab : styles.tabDisabled}
                    key={`ct_${idx}`}
                    onPress={() => handleCompletionTimePress(ct.id)}>
                    <Text
                      style={
                        isSelected ? styles.tabText : styles.tabDisabledText
                      }>
                      {ct.value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.subMainContainer}>
            <Text style={styles.title}>{`Serving (${size}) `} </Text>
            <Text style={styles.subTitle}>
              How many people does this menu item serve? *Customers will be able
              to order any quantity of the menu item.{' '}
            </Text>
            {/* <StyledTextInput
              placeholder="* Serving Size "
              onChangeText={txt => setSize(convertStringToNumber(txt))}
              value={size <= 0 ? '' : size.toString()}
              keyboardType={'number-pad'}
            /> */}
            <Slider
              style={{width: '100%', height: 50}}
              minimumValue={1}
              maximumValue={10}
              minimumTrackTintColor={'#ffffff'}
              maximumTrackTintColor="#000000"
              step={1}
              value={size}
              onValueChange={setSize}
            />
          </View>

          <View style={styles.subMainContainer}>
            <Text style={styles.title}>Price </Text>
            <Text style={styles.subTitle}>
              {
                'Choose the price you want to charge for the item.\n*Customers will be charged a multiple of this price, depending on the quantity of this menu item they order. '
              }
            </Text>
            <StyledTextInput
              placeholder="* Price Per Item ($) "
              onChangeText={setPrice}
              onEndEditing={() => {
                setPrice(convertStringToNumber(price).toFixed(2));
              }}
              value={price}
              keyboardType={'decimal-pad'}
            />
          </View>

          <View style={styles.subMainContainer}>
            <Text style={styles.title}>Customizations </Text>
            <Text style={styles.subTitle}>
              Charge for any customizations customers can add to this item{' '}
            </Text>
            <View style={{gap: 5}}>
              {customizations.map((customization, idx) => {
                return (
                  <View
                    style={styles.customizationItem}
                    key={`customization_${idx}`}>
                    <Text style={styles.text1}>{customization.name}</Text>
                    <Text style={styles.text1}>
                      {`$${(customization.upcharge_price ?? 0).toFixed(2)} `}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveCustomization(idx)}>
                      <FontAwesomeIcon
                        icon={faClose}
                        size={20}
                        color="#000000"
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
            <StyledButton
              title={'+ ADD CUSTOMIZATION '}
              onPress={() => {
                handleAddCustomization();
              }}
            />
            <Text style={styles.title}>Display this item on Menu? </Text>
            <StyledSwitch
              label="Yes"
              value={displayItem}
              onPress={() => {
                setDisplayItem(!displayItem);
              }}
            />
          </View>

          <View style={styles.submitContainer}>
            <StyledButton
              title={'SAVE '}
              onPress={() => {
                handleSubmit();
              }}
            />
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

export default AddMenuItem;
