import { isBoolean, isNumber } from 'lodash-es';

export function isEmpty(value: any, options?: { skipZero?: boolean; skipBoolean?: boolean }) {
  const type = typeof value;

  if (typeof value?.getMonth === 'function') return false;

  if ((value !== null && type === 'object') || type === 'function') {
    const properties = Object.keys(value);
    if (properties.length === 0) return true;
  }

  if (options?.skipBoolean && isBoolean(value)) return false;

  if (options?.skipZero && isNumber(value)) return false;

  return !value ? true : false;
}
