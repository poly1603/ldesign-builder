/*!
 * ***********************************
 * @examples/utils-lib v1.0.0      *
 * Built with rollup               *
 * Build time: 2024-12-05 18:04:59 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function unique(arr) {
  return [...new Set(arr)];
}
function uniqueBy(arr, key) {
  const seen = /* @__PURE__ */ new Set();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k))
      return false;
    seen.add(k);
    return true;
  });
}
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});
}
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
function flatten(arr) {
  return arr.flat();
}
function flattenDeep(arr) {
  return arr.flat(Infinity);
}
function difference(arr1, arr2) {
  const set = new Set(arr2);
  return arr1.filter((item) => !set.has(item));
}
function intersection(arr1, arr2) {
  const set = new Set(arr2);
  return arr1.filter((item) => set.has(item));
}
function union(...arrays) {
  return unique(arrays.flat());
}
function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function sampleSize(arr, size) {
  return shuffle(arr).slice(0, size);
}
function sum(arr) {
  return arr.reduce((acc, val) => acc + val, 0);
}
function average(arr) {
  return arr.length ? sum(arr) / arr.length : 0;
}
function max(arr) {
  return Math.max(...arr);
}
function min(arr) {
  return Math.min(...arr);
}
function range(start, end, step = 1) {
  const result = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

export { average, chunk, difference, flatten, flattenDeep, groupBy, intersection, max, min, range, sample, sampleSize, shuffle, sum, union, unique, uniqueBy };
/*! End of @examples/utils-lib | Powered by @ldesign/builder */
