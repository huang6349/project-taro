import hasValue from './hasValue';
import { eq } from 'lodash-es';

/**
 * 安全相等性比较：先检查有效性，再比较值
 * 避免在空值上进行比较时出现错误
 */
const safeEq = <T>(
  value1: T, value2: T,
): boolean => {
  // 如果两个值都是空值，则认为相等
  if (!hasValue(value1) && !hasValue(value2))
    return !0;
  // 如果只有一个值是空值，则认为不相等
  if (!hasValue(value1) || !hasValue(value2))
    return !1;
  // 两个值都有有效值，使用 lodash 的 eq 进行深度比较
  return eq(value1, value2);
};

export default safeEq;
