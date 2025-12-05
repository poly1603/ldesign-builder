/*!
 * ***********************************
 * @examples/utils-lib v1.0.0      *
 * Built with rollup               *
 * Build time: 2024-12-05 18:04:59 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== "object")
    return obj;
  if (Array.isArray(obj))
    return obj.map(deepClone);
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone(obj[key]);
    }
  }
  return result;
}
function deepMerge(target, ...sources) {
  if (!sources.length)
    return target;
  const source = sources.shift();
  if (source) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceVal = source[key];
        const targetVal = target[key];
        if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
          target[key] = deepMerge(targetVal, sourceVal);
        } else {
          target[key] = sourceVal;
        }
      }
    }
  }
  return deepMerge(target, ...sources);
}
function isPlainObject(val) {
  return Object.prototype.toString.call(val) === "[object Object]";
}
function pick(obj, keys) {
  const result = {};
  keys.forEach((key) => {
    if (key in obj)
      result[key] = obj[key];
  });
  return result;
}
function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}
function get(obj, path, defaultValue) {
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let result = obj;
  for (const key of keys) {
    if (result == null)
      return defaultValue;
    result = result[key];
  }
  return result ?? defaultValue;
}
function set(obj, path, value) {
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}
function toQueryString(obj) {
  return Object.entries(obj).filter(([, v]) => v != null).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}
function parseQueryString(str) {
  return str.replace(/^\?/, "").split("&").reduce((acc, pair) => {
    const [key, value] = pair.split("=").map(decodeURIComponent);
    if (key)
      acc[key] = value;
    return acc;
  }, {});
}
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export { deepClone, deepMerge, get, isEmpty, isPlainObject, omit, parseQueryString, pick, set, toQueryString };
/*! End of @examples/utils-lib | Powered by @ldesign/builder */
