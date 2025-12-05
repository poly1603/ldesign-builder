/*!
 * ***********************************
 * @examples/utils-lib v1.0.0      *
 * Built with rollup               *
 * Build time: 2024-12-05 18:04:59 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function debounce(fn, wait) {
  let timer = null;
  return function(...args) {
    if (timer)
      clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}
function throttle(fn, wait) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
async function retry(fn, options = {}) {
  const { times = 3, delay: delayMs = 1e3 } = options;
  let lastError;
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < times - 1)
        await delay(delayMs);
    }
  }
  throw lastError;
}
async function pLimit(tasks, limit) {
  const results = [];
  const executing = [];
  for (const task of tasks) {
    const p = task().then((r) => {
      results.push(r);
    });
    executing.push(p);
    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(executing.findIndex((e) => e === p), 1);
    }
  }
  await Promise.all(executing);
  return results;
}
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise(
      (_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)
    )
  ]);
}

export { debounce, delay, pLimit, retry, throttle, withTimeout };
/*! End of @examples/utils-lib | Powered by @ldesign/builder */
