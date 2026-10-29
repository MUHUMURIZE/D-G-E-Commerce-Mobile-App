import { Platform, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import type { CSSProperties } from 'react';

export function ProductImage({ uri, style }: { uri?: string; style: StyleProp<ImageStyle> }) {
  if (Platform.OS === 'web') {
    const nativeStyle = StyleSheet.flatten(style);
    const webStyle: CSSProperties = { objectFit: 'cover' };

    if (typeof nativeStyle?.width === 'number' || typeof nativeStyle?.width === 'string') {
      webStyle.width = nativeStyle.width;
    }
    if (typeof nativeStyle?.height === 'number' || typeof nativeStyle?.height === 'string') {
      webStyle.height = nativeStyle.height;
    }
    if (typeof nativeStyle?.aspectRatio === 'number') {
      webStyle.aspectRatio = nativeStyle.aspectRatio;
    }
    if (typeof nativeStyle?.borderRadius === 'number' || typeof nativeStyle?.borderRadius === 'string') {
      webStyle.borderRadius = nativeStyle.borderRadius;
    }
    if (typeof nativeStyle?.backgroundColor === 'string') {
      webStyle.backgroundColor = nativeStyle.backgroundColor;
    }

    return (
      <img
        src={uri || undefined}
        alt=""
        style={webStyle}
      />
    );
  }

  return (
    <ExpoImage
      source={uri ? { uri } : undefined}
      style={style}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
  );
}
