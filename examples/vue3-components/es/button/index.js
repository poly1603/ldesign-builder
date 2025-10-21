/*!
 * *******************************************
 * @ldesign/vue3-components-example v1.0.0 *
 * Built with rollup                       *
 * Build time: 2024-09-29 15:12:37         *
 * Build mode: production                  *
 * Minified: No                            *
 * *******************************************
 */
import './Button.vue.js';
import script from './Button.vue2.js';

script.install = function(app) {
  app.component(script.name || "LButton", script);
};
const BUTTON_COMPONENT_NAME = "LButton";

export { BUTTON_COMPONENT_NAME, script as Button, script as default };
/*! End of @ldesign/vue3-components-example | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
