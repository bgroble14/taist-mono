import { Image } from 'expo-image';
import { useState } from 'react';
import { View, ViewStyle } from 'react-native';
import styles from './styles';

type Props = {
  url?: string;
  containerStyle?: ViewStyle;
  size?: number;
};

const StyledProfileImage = (props: Props) => {
  const [isLoaded, setLoaded] = useState(false);
  var style = {...styles.img};
  if (props.size) {
    style = {
      ...style,
      width: props.size,
      height: props.size,
      borderRadius: props.size,
    };
  }

  const handleLoadStart = () => {
    setLoaded(false);
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  return (
    <View style={[styles.container, props.containerStyle]}>
      <Image
        style={style}
        source={{uri: props.url}}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        cachePolicy="memory-disk"
        contentFit="cover"
        transition={200}
      />
      {!isLoaded && (
        <View style={styles.overlay}>
          <Image
            source={require('../../assets/icons/Icon_Profile.png')}
            style={styles.imgPlaceholder}
            contentFit="contain"
          />
        </View>
      )}
    </View>
  );
};

export default StyledProfileImage;
