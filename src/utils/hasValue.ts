import isNil from './isNil';

/**
 * 反向检查：是否有有效值（非undefined、非null）
 */
const hasValue = <T>(
  value: T,
): value is NonNullable<T> => (
  !isNil(value)
);

export default hasValue;
