import { Image } from 'expo-image';
import { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import styles from './styles';

// Generic blurhash for person silhouette placeholder
// This provides an immediate visual while the real image loads
const DEFAULT_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// Fallback image for when no URL provided
const FALLBACK_IMAGE = require('../../assets/icons/Icon_Profile.png');

type Props = {
  url?: string;
  containerStyle?: ViewStyle;
  size?: number;
  priority?: 'low' | 'normal' | 'high';
  blurhash?: string;
};

const StyledProfileImage = ({
  url,
  containerStyle,
  size,
  priority = 'normal',
  blurhash,
}: Props) => {
  // Memoize style to prevent recreating on every render
  const imageStyle = useMemo(() => {
    if (!size) return styles.img;
    return {
      ...styles.img,
      width: size,
      height: size,
      borderRadius: size,
    };
  }, [size]);

  // Determine source - fallback if no URL
  const source = url ? { uri: url } : FALLBACK_IMAGE;

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        style={imageStyle}
        source={source}
        placeholder={blurhash || DEFAULT_BLURHASH}
        placeholderContentFit="cover"
        cachePolicy="memory-disk"
        priority={priority}
        transition={200}
        contentFit="cover"
      />
    </View>
  );
};

export default StyledProfileImage;
