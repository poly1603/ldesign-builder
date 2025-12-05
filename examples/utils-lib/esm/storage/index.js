/*!
 * ***********************************
 * @examples/utils-lib v1.0.0      *
 * Built with rollup               *
 * Build time: 2024-12-05 18:04:59 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function createStorage(options = {}) {
  const { prefix = "", expires, storage = localStorage } = options;
  const getKey = (key) => prefix + key;
  return {
    /** 获取值 */
    get(key, defaultValue) {
      try {
        const raw = storage.getItem(getKey(key));
        if (!raw)
          return defaultValue;
        const { value, expires: exp } = JSON.parse(raw);
        if (exp && Date.now() > exp) {
          storage.removeItem(getKey(key));
          return defaultValue;
        }
        return value;
      } catch {
        return defaultValue;
      }
    },
    /** 设置值 */
    set(key, value, ttl) {
      const exp = ttl ?? expires;
      const data = {
        value,
        expires: exp ? Date.now() + exp : null
      };
      storage.setItem(getKey(key), JSON.stringify(data));
    },
    /** 删除值 */
    remove(key) {
      storage.removeItem(getKey(key));
    },
    /** 清空所有值 */
    clear() {
      if (prefix) {
        const keysToRemove = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key?.startsWith(prefix))
            keysToRemove.push(key);
        }
        keysToRemove.forEach((k) => storage.removeItem(k));
      } else {
        storage.clear();
      }
    },
    /** 检查是否存在 */
    has(key) {
      return storage.getItem(getKey(key)) !== null;
    },
    /** 获取所有键 */
    keys() {
      const result = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && (!prefix || key.startsWith(prefix))) {
          result.push(prefix ? key.slice(prefix.length) : key);
        }
      }
      return result;
    }
  };
}
const local = createStorage({ storage: localStorage });
const session = createStorage({ storage: sessionStorage });

export { createStorage, local, session };
/*! End of @examples/utils-lib | Powered by @ldesign/builder */
