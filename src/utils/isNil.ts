import { isUndefined } from 'lodash-es';
import { isNull } from 'lodash-es';

/**
 * 检查值是否为 undefined 或 null
 * 检查顺序：先 isUndefined -> 再 isNull
 */
const isNil = (
  value: any,
): value is undefined | null => (
  isUndefined(value) || isNull(value)
);

export default isNil;
