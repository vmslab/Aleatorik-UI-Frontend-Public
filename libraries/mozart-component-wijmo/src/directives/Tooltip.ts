import { VNode, VNodeDirective } from "vue";
import { addTooltipEvent } from "mozart-common";

const tooltipDirective = (el: HTMLElement, binding: VNodeDirective, node: VNode) => {
  node.context?.$nextTick(() => {
    addTooltipEvent(el, binding.value.text, binding.value.tb || true);
  });
};

export default {
  bind: tooltipDirective,
  update: tooltipDirective,
};
