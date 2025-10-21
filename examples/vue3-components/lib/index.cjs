/*!
 * *******************************************
 * @ldesign/vue3-components-example v1.0.0 *
 * Built with rollup                       *
 * Build time: 2024-09-29 15:12:37         *
 * Build mode: production                  *
 * Minified: No                            *
 * *******************************************
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index$1 = require('./button/index.cjs');
var index$2 = require('./input/index.cjs');
var index$3 = require('./modal/index.cjs');
require('./modal/Modal.vue.cjs');
var Modal_vue_vue_type_script_setup_true_lang = require('./modal/Modal.vue2.cjs');
require('./input/Input.vue.cjs');
var Input_vue_vue_type_script_setup_true_lang = require('./input/Input.vue2.cjs');
require('./button/Button.vue.cjs');
var Button_vue_vue_type_script_setup_true_lang = require('./button/Button.vue2.cjs');

const components = [Button_vue_vue_type_script_setup_true_lang.default, Input_vue_vue_type_script_setup_true_lang.default, Modal_vue_vue_type_script_setup_true_lang.default];
const VERSION = "1.0.0";
const LIBRARY_INFO = {
  name: "@ldesign/vue3-components-example",
  version: VERSION,
  description: "Vue3 \u7EC4\u4EF6\u5E93\u793A\u4F8B - \u5C55\u793A\u5982\u4F55\u4F7F\u7528 @ldesign/builder \u6253\u5305 Vue3 \u7EC4\u4EF6\u5E93",
  author: "LDesign Team",
  license: "MIT",
  repository: "https://github.com/ldesign/ldesign",
  homepage: "https://ldesign.dev"
};
function install(app, options = {}) {
  if (install.installed) {
    return;
  }
  install.installed = true;
  components.forEach((component) => {
    if (component.install) {
      component.install(app);
    } else if (component.name) {
      app.component(component.name, component);
    }
  });
  if (options.addLibraryInfo !== false) {
    app.config.globalProperties.$LDESIGN_VUE3_COMPONENTS = LIBRARY_INFO;
  }
}
function getLibraryInfo() {
  return LIBRARY_INFO;
}
function printLibraryInfo() {
  console.log(`
\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E
\u2502                   Vue3 Components Example                   \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502 Name:        ${LIBRARY_INFO.name.padEnd(43)} \u2502
\u2502 Version:     ${LIBRARY_INFO.version.padEnd(43)} \u2502
\u2502 Description: ${LIBRARY_INFO.description.slice(0, 43).padEnd(43)} \u2502
\u2502 Author:      ${LIBRARY_INFO.author.padEnd(43)} \u2502
\u2502 License:     ${LIBRARY_INFO.license.padEnd(43)} \u2502
\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F
  `);
}
var index = {
  install,
  VERSION,
  LIBRARY_INFO,
  getLibraryInfo,
  printLibraryInfo,
  // 组件
  Button: Button_vue_vue_type_script_setup_true_lang.default,
  Input: Input_vue_vue_type_script_setup_true_lang.default,
  Modal: Modal_vue_vue_type_script_setup_true_lang.default
};

exports.BUTTON_COMPONENT_NAME = index$1.BUTTON_COMPONENT_NAME;
exports.INPUT_COMPONENT_NAME = index$2.INPUT_COMPONENT_NAME;
exports.MODAL_COMPONENT_NAME = index$3.MODAL_COMPONENT_NAME;
exports.Modal = Modal_vue_vue_type_script_setup_true_lang.default;
exports.Input = Input_vue_vue_type_script_setup_true_lang.default;
exports.Button = Button_vue_vue_type_script_setup_true_lang.default;
exports.LIBRARY_INFO = LIBRARY_INFO;
exports.VERSION = VERSION;
exports.default = index;
exports.getLibraryInfo = getLibraryInfo;
exports.printLibraryInfo = printLibraryInfo;
/*! End of @ldesign/vue3-components-example | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
