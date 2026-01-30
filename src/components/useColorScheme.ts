import { Appearance, ColorSchemeName } from 'react-native';

export function useColorScheme(): NonNullable<ColorSchemeName> {
  return Appearance.getColorScheme() ?? 'light';
}
