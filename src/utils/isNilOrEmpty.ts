import isNil from './isNil';
import { isEmpty } from 'lodash-es';

/**
 * 检查值是否为 undefined、null 或空值
 * 检查顺序：isUndefined -> isNull -> isEmpty
 */
const isNilOrEmpty = (
  value: any,
): value is undefined | null | '' | [] | {} => (
  isNil(value) || isEmpty(value)
);

export default isNilOrEmpty;
