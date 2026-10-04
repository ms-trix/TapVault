import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

type Props = { size?: number; color?: string };

export function NfcMark({ size = 24, color = colors.ink }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 7c-3 2-3 8 0 10M12 4c-6 3-6 13 0 16m3-13c3 2 3 8 0 10"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
