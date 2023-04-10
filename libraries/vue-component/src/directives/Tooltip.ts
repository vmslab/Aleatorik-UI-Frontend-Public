import { DirectiveBinding } from "vue";
import { addTooltipEvent } from "mozart-common";

const tooltipDirective = (el: HTMLElement, binding: DirectiveBinding) => {
  binding.instance?.$nextTick(() => {
    addTooltipEvent(el, binding.value.text, binding.value.tb || true);
  });
};

export default {
  mounted: tooltipDirective,
  updated: tooltipDirective,
};
