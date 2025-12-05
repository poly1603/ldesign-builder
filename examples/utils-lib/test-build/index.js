//#region src/types/index.ts
/** 类型断言函数 */
function isString(val) {
	return typeof val === "string";
}
function isNumber(val) {
	return typeof val === "number" && !Number.isNaN(val);
}
function isBoolean(val) {
	return typeof val === "boolean";
}
function isArray(val) {
	return Array.isArray(val);
}
function isObject(val) {
	return val !== null && typeof val === "object" && !Array.isArray(val);
}
function isFunction(val) {
	return typeof val === "function";
}
function isNull(val) {
	return val === null;
}
function isUndefined(val) {
	return typeof val === "undefined";
}
function isNullOrUndefined(val) {
	return isNull(val) || isUndefined(val);
}
function isDefined(val) {
	return !isNullOrUndefined(val);
}

//#endregion
//#region src/string/index.ts
/**
* 字符串工具函数
*/
/** 首字母大写 */
function capitalize(str) {
	if (!str) return "";
	return str.charAt(0).toUpperCase() + str.slice(1);
}
/** 驼峰转短横线 */
function kebabCase(str) {
	return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
/** 短横线转驼峰 */
function camelCase(str) {
	return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
/** 短横线转帕斯卡 */
function pascalCase(str) {
	return capitalize(camelCase(str));
}
/** 截断字符串 */
function truncate(str, length$1, suffix = "...") {
	if (str.length <= length$1) return str;
	return str.slice(0, length$1 - suffix.length) + suffix;
}
/** 移除 HTML 标签 */
function stripHtml(html) {
	return html.replace(/<[^>]*>/g, "");
}
/** 转义 HTML */
function escapeHtml(str) {
	const escapeMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	};
	return str.replace(/[&<>"']/g, (char) => escapeMap[char]);
}
/** 生成随机字符串 */
function randomString(length$1 = 8) {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	return Array.from({ length: length$1 }, () => chars[Math.floor(Math.random() * 62)]).join("");
}
/** 模板字符串替换 */
function template(str, data) {
	return str.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? "");
}
/** 字符串填充 */
function padStart(str, length$1, char = " ") {
	return str.padStart(length$1, char);
}
function padEnd(str, length$1, char = " ") {
	return str.padEnd(length$1, char);
}

//#endregion
//#region src/array/index.ts
/**
* 数组工具函数
*/
/** 数组去重 */
function unique(arr) {
	return [...new Set(arr)];
}
/** 按属性去重 */
function uniqueBy(arr, key) {
	const seen = /* @__PURE__ */ new Set();
	return arr.filter((item) => {
		const k = item[key];
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});
}
/** 数组分组 */
function groupBy(arr, key) {
	return arr.reduce((acc, item) => {
		const k = String(item[key]);
		(acc[k] = acc[k] || []).push(item);
		return acc;
	}, {});
}
/** 数组分块 */
function chunk(arr, size) {
	const result = [];
	for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
	return result;
}
/** 数组扁平化 */
function flatten(arr) {
	return arr.flat();
}
/** 深度扁平化 */
function flattenDeep(arr) {
	return arr.flat(Infinity);
}
/** 数组差集 */
function difference(arr1, arr2) {
	const set$1 = new Set(arr2);
	return arr1.filter((item) => !set$1.has(item));
}
/** 数组交集 */
function intersection(arr1, arr2) {
	const set$1 = new Set(arr2);
	return arr1.filter((item) => set$1.has(item));
}
/** 数组并集 */
function union(...arrays) {
	return unique(arrays.flat());
}
/** 随机打乱数组 */
function shuffle(arr) {
	const result = [...arr];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
/** 获取随机元素 */
function sample(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
/** 获取多个随机元素 */
function sampleSize(arr, size) {
	return shuffle(arr).slice(0, size);
}
/** 数组求和 */
function sum(arr) {
	return arr.reduce((acc, val) => acc + val, 0);
}
/** 数组平均值 */
function average(arr) {
	return arr.length ? sum(arr) / arr.length : 0;
}
/** 获取最大值 */
function max(arr) {
	return Math.max(...arr);
}
/** 获取最小值 */
function min(arr) {
	return Math.min(...arr);
}
/** 范围数组 */
function range(start, end, step = 1) {
	const result = [];
	for (let i = start; i < end; i += step) result.push(i);
	return result;
}

//#endregion
//#region src/object/index.ts
/**
* 对象工具函数
*/
/** 深拷贝 */
function deepClone(obj) {
	if (obj === null || typeof obj !== "object") return obj;
	if (Array.isArray(obj)) return obj.map(deepClone);
	const result = {};
	for (const key in obj) if (Object.prototype.hasOwnProperty.call(obj, key)) result[key] = deepClone(obj[key]);
	return result;
}
/** 深度合并 */
function deepMerge(target, ...sources) {
	if (!sources.length) return target;
	const source = sources.shift();
	if (source) {
		for (const key in source) if (Object.prototype.hasOwnProperty.call(source, key)) {
			const sourceVal = source[key];
			const targetVal = target[key];
			if (isPlainObject(sourceVal) && isPlainObject(targetVal)) target[key] = deepMerge(targetVal, sourceVal);
			else target[key] = sourceVal;
		}
	}
	return deepMerge(target, ...sources);
}
/** 是否为纯对象 */
function isPlainObject(val) {
	return Object.prototype.toString.call(val) === "[object Object]";
}
/** 选取对象属性 */
function pick(obj, keys) {
	const result = {};
	keys.forEach((key) => {
		if (key in obj) result[key] = obj[key];
	});
	return result;
}
/** 排除对象属性 */
function omit(obj, keys) {
	const result = { ...obj };
	keys.forEach((key) => delete result[key]);
	return result;
}
/** 获取嵌套属性 */
function get(obj, path, defaultValue) {
	const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
	let result = obj;
	for (const key of keys) {
		if (result == null) return defaultValue;
		result = result[key];
	}
	return result ?? defaultValue;
}
/** 设置嵌套属性 */
function set(obj, path, value) {
	const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
	let current = obj;
	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		if (!(key in current)) current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
		current = current[key];
	}
	current[keys[keys.length - 1]] = value;
}
/** 对象转查询字符串 */
function toQueryString(obj) {
	return Object.entries(obj).filter(([, v]) => v != null).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}
/** 查询字符串转对象 */
function parseQueryString(str) {
	return str.replace(/^\?/, "").split("&").reduce((acc, pair) => {
		const [key, value] = pair.split("=").map(decodeURIComponent);
		if (key) acc[key] = value;
		return acc;
	}, {});
}
/** 检查对象是否为空 */
function isEmpty(obj) {
	return Object.keys(obj).length === 0;
}

//#endregion
//#region src/date/index.ts
/**
* 日期工具函数
*/
/** 格式化日期 */
function formatDate(date, format = "YYYY-MM-DD HH:mm:ss") {
	const d = new Date(date);
	const pad = (n) => String(n).padStart(2, "0");
	return format.replace("YYYY", String(d.getFullYear())).replace("MM", pad(d.getMonth() + 1)).replace("DD", pad(d.getDate())).replace("HH", pad(d.getHours())).replace("mm", pad(d.getMinutes())).replace("ss", pad(d.getSeconds()));
}
/** 相对时间 */
function timeAgo(date) {
	const now = Date.now();
	const diff = now - new Date(date).getTime();
	const seconds = Math.floor(diff / 1e3);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	if (days > 0) return `${days}天前`;
	if (hours > 0) return `${hours}小时前`;
	if (minutes > 0) return `${minutes}分钟前`;
	return "刚刚";
}
/** 获取日期范围 */
function getDateRange(start, end) {
	const dates = [];
	const current = new Date(start);
	while (current <= end) {
		dates.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}
	return dates;
}
/** 是否为同一天 */
function isSameDay(d1, d2) {
	return d1.toDateString() === d2.toDateString();
}
/** 添加天数 */
function addDays(date, days) {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

//#endregion
//#region src/math/index.ts
/**
* 数学工具函数
*/
/** 限制数值范围 */
function clamp(value, min$1, max$1) {
	return Math.min(Math.max(value, min$1), max$1);
}
/** 四舍五入到指定小数位 */
function round(value, decimals = 0) {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
}
/** 随机整数 */
function randomInt(min$1, max$1) {
	return Math.floor(Math.random() * (max$1 - min$1 + 1)) + min$1;
}
/** 随机浮点数 */
function randomFloat(min$1, max$1) {
	return Math.random() * (max$1 - min$1) + min$1;
}
/** 线性插值 */
function lerp(start, end, t) {
	return start + (end - start) * t;
}
/** 角度转弧度 */
function degToRad(deg) {
	return deg * (Math.PI / 180);
}
/** 弧度转角度 */
function radToDeg(rad) {
	return rad * (180 / Math.PI);
}
/** 百分比 */
function percentage(value, total) {
	return total === 0 ? 0 : value / total * 100;
}
/** 精确除法 */
function divide(a, b, defaultValue = 0) {
	return b === 0 ? defaultValue : a / b;
}

//#endregion
//#region src/async/index.ts
/**
* 异步工具函数
*/
/** 延迟执行 */
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
/** 防抖函数 */
function debounce(fn, wait) {
	let timer = null;
	return function(...args) {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), wait);
	};
}
/** 节流函数 */
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
/** 重试函数 */
async function retry(fn, options = {}) {
	const { times = 3, delay: delayMs = 1e3 } = options;
	let lastError;
	for (let i = 0; i < times; i++) try {
		return await fn();
	} catch (e) {
		lastError = e;
		if (i < times - 1) await delay(delayMs);
	}
	throw lastError;
}
/** 并发控制 */
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
/** 超时包装 */
function withTimeout(promise, ms) {
	return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(/* @__PURE__ */ new Error("Timeout")), ms))]);
}

//#endregion
//#region src/dom/index.ts
/**
* DOM 工具函数
*/
/** 获取元素 */
function $(selector, parent = document) {
	return parent.querySelector(selector);
}
/** 获取多个元素 */
function $$(selector, parent = document) {
	return Array.from(parent.querySelectorAll(selector));
}
/** 添加事件监听 */
function on(el, event, handler, options) {
	el.addEventListener(event, handler, options);
	return () => el.removeEventListener(event, handler, options);
}
/** 添加类名 */
function addClass(el, ...classes) {
	el.classList.add(...classes);
}
/** 移除类名 */
function removeClass(el, ...classes) {
	el.classList.remove(...classes);
}
/** 切换类名 */
function toggleClass(el, className, force) {
	return el.classList.toggle(className, force);
}
/** 是否有类名 */
function hasClass(el, className) {
	return el.classList.contains(className);
}
function css(el, propOrStyles, value) {
	if (typeof propOrStyles === "string") {
		if (value === void 0) return getComputedStyle(el).getPropertyValue(propOrStyles);
		el.style.setProperty(propOrStyles, value);
	} else Object.entries(propOrStyles).forEach(([k, v]) => el.style.setProperty(k, v));
}
/** 获取元素位置 */
function getRect(el) {
	return el.getBoundingClientRect();
}
/** 滚动到元素 */
function scrollTo(el, options) {
	el.scrollIntoView({
		behavior: "smooth",
		...options
	});
}
/** 复制到剪贴板 */
async function copyToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.style.position = "fixed";
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);
		textarea.select();
		const result = document.execCommand("copy");
		document.body.removeChild(textarea);
		return result;
	}
}

//#endregion
//#region src/validate/index.ts
/**
* 验证工具函数
*/
/** 邮箱验证 */
function isEmail(str) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}
/** 手机号验证（中国） */
function isPhone(str) {
	return /^1[3-9]\d{9}$/.test(str);
}
/** URL 验证 */
function isUrl(str) {
	try {
		new URL(str);
		return true;
	} catch {
		return false;
	}
}
/** 身份证验证（中国） */
function isIdCard(str) {
	return /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(str);
}
/** 纯数字 */
function isNumeric(str) {
	return /^\d+$/.test(str);
}
/** 字母数字 */
function isAlphanumeric(str) {
	return /^[a-zA-Z0-9]+$/.test(str);
}
/** 中文 */
function isChinese(str) {
	return /^[\u4e00-\u9fa5]+$/.test(str);
}
/** IP 地址 */
function isIP(str) {
	return /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(str);
}
/** 密码强度 */
function passwordStrength(password) {
	let score = 0;
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
	if (/\d/.test(password)) score++;
	if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
	if (score <= 2) return "weak";
	if (score <= 4) return "medium";
	return "strong";
}
/** 必填验证 */
function required(value) {
	if (value === null || value === void 0) return false;
	if (typeof value === "string") return value.trim().length > 0;
	if (Array.isArray(value)) return value.length > 0;
	return true;
}
/** 长度验证 */
function length(value, min$1, max$1) {
	const len = value.length;
	if (max$1 === void 0) return len >= min$1;
	return len >= min$1 && len <= max$1;
}

//#endregion
//#region src/storage/index.ts
/** 创建存储实例 */
function createStorage(options = {}) {
	const { prefix = "", expires, storage = localStorage } = options;
	const getKey = (key) => prefix + key;
	return {
		get(key, defaultValue) {
			try {
				const raw = storage.getItem(getKey(key));
				if (!raw) return defaultValue;
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
		set(key, value, ttl) {
			const exp = ttl ?? expires;
			const data = {
				value,
				expires: exp ? Date.now() + exp : null
			};
			storage.setItem(getKey(key), JSON.stringify(data));
		},
		remove(key) {
			storage.removeItem(getKey(key));
		},
		clear() {
			if (prefix) {
				const keysToRemove = [];
				for (let i = 0; i < storage.length; i++) {
					const key = storage.key(i);
					if (key?.startsWith(prefix)) keysToRemove.push(key);
				}
				keysToRemove.forEach((k) => storage.removeItem(k));
			} else storage.clear();
		},
		has(key) {
			return storage.getItem(getKey(key)) !== null;
		},
		keys() {
			const result = [];
			for (let i = 0; i < storage.length; i++) {
				const key = storage.key(i);
				if (key && (!prefix || key.startsWith(prefix))) result.push(prefix ? key.slice(prefix.length) : key);
			}
			return result;
		}
	};
}
/** 默认 localStorage 实例 */
const local = createStorage({ storage: localStorage });
/** 默认 sessionStorage 实例 */
const session = createStorage({ storage: sessionStorage });

//#endregion
export { $, $$, addClass, addDays, average, camelCase, capitalize, chunk, clamp, copyToClipboard, createStorage, css, debounce, deepClone, deepMerge, degToRad, delay, difference, divide, escapeHtml, flatten, flattenDeep, formatDate, get, getDateRange, getRect, groupBy, hasClass, intersection, isAlphanumeric, isArray, isBoolean, isChinese, isDefined, isEmail, isEmpty, isFunction, isIP, isIdCard, isNull, isNullOrUndefined, isNumber, isNumeric, isObject, isPhone, isPlainObject, isSameDay, isString, isUndefined, isUrl, kebabCase, length, lerp, local, max, min, omit, on, pLimit, padEnd, padStart, parseQueryString, pascalCase, passwordStrength, percentage, pick, radToDeg, randomFloat, randomInt, randomString, range, removeClass, required, retry, round, sample, sampleSize, scrollTo, session, set, shuffle, stripHtml, sum, template, throttle, timeAgo, toQueryString, toggleClass, truncate, union, unique, uniqueBy, withTimeout };