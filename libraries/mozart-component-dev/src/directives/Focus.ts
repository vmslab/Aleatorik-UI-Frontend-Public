import { VNode, VNodeDirective } from "vue";
import { setFocus } from "mozart-common";

const focusDirective = (el: HTMLElement, binding: VNodeDirective, node: VNode) => {
  node.context?.$nextTick(() => {
    setFocus(el);
  });
};

export default {
  bind: focusDirective,
};
