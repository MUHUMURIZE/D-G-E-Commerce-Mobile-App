import { Image as NativeImage, Platform, type ImageStyle, type StyleProp } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

export function ProductImage({ uri, style }: { uri?: string; style: StyleProp<ImageStyle> }) {
  const source = uri ? { uri } : undefined;

  if (Platform.OS === 'web') {
    return <NativeImage source={source} style={style} resizeMode="cover" />;
  }

  return <ExpoImage source={source} style={style} contentFit="cover" cachePolicy="memory-disk" />;
}
