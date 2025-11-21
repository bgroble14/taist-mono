import {Dimensions, StyleSheet} from 'react-native';
const {width, height} = Dimensions.get('window');

export const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fa4616',
  },
  pageView: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    gap: 20,
  },
  formFields: {
    width: '100%',
    marginTop: 15,
    color: '#ffffff',
  },
  formFieldsContainer: {
    backgroundColor: 'transparent',
  },
  formInputFields: {
    color: '#ffffff',
    fontSize: 16,
  },
  addressTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  addressText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    width: '100%',
  },
  switchWrapper: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  switchText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  dropdownBox: {
    width: '100%',
    borderRadius: 4,
    marginTop: 15,
    borderColor: '#ffffff',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  dropdownInput: {
    color: '#ffffff',
    fontSize: 16,
    paddingLeft: 5,
  },
  dropdown: {
    borderColor: '#ffffff',
    borderRadius: 4,
  },
  dropdownText: {
    color: '#ffffff',
    borderColor: '#ffffff',
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
  buttonDisabled: {
    borderRadius: 20,
    backgroundColor: '#cccccc',
    width: '100%',
    padding: 12,
    marginBottom: 5,
  },
  modalBG: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: width * 0.75,
    backgroundColor: '#fa4616',
    borderRadius: 12,
    padding: 12,
    paddingVertical: 20,
    gap: 20,
  },
  modalText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
});
