import {useRef} from 'react';
import {SafeAreaView} from 'react-native';
import {styles} from './styles';
import Container from '../../../layout/Container';
import WebView from 'react-native-webview';
import {HTML_URL} from '../../../services/api';

const Privacy = ({navigation}: any) => {
  const ref = useRef<WebView>(null);
  return (
    <SafeAreaView style={styles.main}>
      <Container backMode title="Privacy Policy ">
        <WebView
          ref={ref}
          source={{uri: `${HTML_URL}privacy.html`}}
          style={{flex: 1}}
          onContentProcessDidTerminate={e => {
            ref.current?.reload();
          }}
        />
      </Container>
    </SafeAreaView>
  );
};

export default Privacy;
