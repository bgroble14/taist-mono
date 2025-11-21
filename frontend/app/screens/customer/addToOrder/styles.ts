import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fa4616',
  },
  pageView: {
    padding: 10,
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  heading: {
    width: '100%',
    marginTop: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  menuInfo: {
    paddingVertical: 10,
    width: '100%',
  },
  menuInfoHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  menuInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  menuInfoPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  menuInfoSize: {
    fontSize: 12,
    color: '#ffffff',
  },
  menuInfoDescription: {
    marginTop: 10,
    color: '#ffffff',
  },
  orderQuantity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    width: '100%',
  },
  orderQuantityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  orderQuantityAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  orderQuantityButton: {
    backgroundColor: '#fa4616',
    borderRadius: 4,
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderQuantityButtonText: {
    color: '#ffffff',
    fontSize: 20,
  },
  orderQuantityValue: {
    width: 30,
    textAlign: 'center',
    color: '#000000',
  },
  orderAddonsWrapper: {
    paddingVertical: 10,
    width: '100%',
  },
  orderAddonsLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  orderAddonContainer: {
    alignItems: 'center',
    gap: 5,
    marginVertical: 10,
  },
  orderAddonCheckbox: {
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
  },
  orderAddonText: {
    color: '#ffffff',
  },
  formFields: {
    marginTop: 15,
    color: '#ffffff',
  },
  formFieldsContainer: {
    backgroundColor: 'transparent',
  },
  formInputFields: {
    color: '#ffffff',
    fontSize: 14,
  },
  vcenter: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  button: {
    borderRadius: 20,
    backgroundColor: '#feffff',
    width: '100%',
    padding: 12,
    marginBottom: 5,
  },
  buttonText: {
    color: '#fa4616',
    fontSize: 16,
    textAlign: 'center',
  },
});
