import { interpolate } from "react-native-reanimated";

const MAX_PULL = 60;
const MAX_STRETCH = 0.1;
const MAX_COMPRESS = 0.12;

/**
 * Compute liquid-glass stretch/compress transform values from overflow + press state.
 * Runs on the UI thread as a worklet.
 */
export function liquidGlassTransform(
  pressed: number,
  overflowX: number,
  overflowY: number,
  halfW: number,
  halfH: number,
) {
  "worklet";

  const pressScale = interpolate(pressed, [0, 1], [1, 1.02]);

  const signX = overflowX < 0 ? -1 : 1;
  const dampedX = signX * MAX_PULL * (1 - 1 / (Math.abs(overflowX) / MAX_PULL + 1));
  const signY = overflowY < 0 ? -1 : 1;
  const dampedY = signY * MAX_PULL * (1 - 1 / (Math.abs(overflowY) / MAX_PULL + 1));

  const absDX = Math.abs(dampedX);
  const absDY = Math.abs(dampedY);

  const stretchX = interpolate(absDX, [0, MAX_PULL], [0, MAX_STRETCH], "clamp");
  const stretchY = interpolate(absDY, [0, MAX_PULL], [0, MAX_STRETCH], "clamp");

  const compressX = interpolate(absDY, [0, MAX_PULL], [0, MAX_COMPRESS], "clamp");
  const compressY = interpolate(absDX, [0, MAX_PULL], [0, MAX_COMPRESS], "clamp");

  return {
    transform: [
      { translateX: signX * halfW * stretchX },
      { translateY: signY * halfH * stretchY },
      { scaleX: pressScale * (1 + stretchX) * (1 - compressX) },
      { scaleY: pressScale * (1 + stretchY) * (1 - compressY) },
    ],
  };
}
