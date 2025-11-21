import { Dimensions, StyleSheet } from 'react-native';

const screenHeight = Dimensions.get('window').height;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fa4616',
    borderColor: 'green',
    paddingTop: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  vcenter: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 60,
    // margin: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  signupOptionWrapper: {
    height: screenHeight - 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  signupOption: {
    width: '100%',
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#ffffff',
    padding: 10,
    marginBottom: 20,
  },
  signupOptionHeading: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  signupOptionText: {
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 30,
  },
  signupOptionButton: {
    padding: 5,
  },
  signupOptionButtonText: {
    fontSize: 18,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#ffffff',
  },
  button: {
    borderRadius: 20,
    backgroundColor: '#feffff',
    width: '100%',
    padding: 10,
    marginBottom: 5,
  },
  buttonText: {
    color: '#fa4616',
    fontSize: 18,
    textAlign: 'center',
  },
  button2: {
    width: '100%',
    padding: 10,
  },
  buttonText2: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  formFields: {
    marginTop: 20,
  },
  formInputFields: {
    color: '#ffffff',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  terms: {
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  termsText: {
    color: '#ffffff',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  termsButton: {
    color: '#ffffff',
    fontSize: 14,
    textDecorationLine: 'underline',
    letterSpacing: 0.5,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  socialIconsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 10,
  },
  socialIconContainer: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
});
