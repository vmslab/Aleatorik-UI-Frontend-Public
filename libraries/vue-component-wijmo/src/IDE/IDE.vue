<template>
  <div ref="menuRef"></div>
  <div ref="mainRef"></div>
  <div ref="statusRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, render, h, useSlots, defineExpose } from "vue";
import { IDEMain, IDEMenu, IDEStatus, IIDEParams, IMenuItem, ICommandOptions } from "@aleatorik-ui/common-ui";
// import HelloWorldWidget from "./Widget/HelloWorldWidget.vue";

const props = defineProps<{
  commands: Record<string, ICommandOptions>;
  menus: IMenuItem[];
  initializeIde?: (params: IIDEParams) => void;
  registerAccordian?: (child: any, content: HTMLElement, id: number, data: Record<string, any>) => void;
  registerDock?: (child: any, content: HTMLElement, id: number, data: Record<string, any>) => void;
}>();

const menuRef = ref(null);
const mainRef = ref(null);
const statusRef = ref(null);

const menu = ref(null as IDEMenu | null);
const main = ref(null as IDEMain | null);
const status = ref(null as IDEStatus | null);

onMounted(() => {
  // let cnt = 1;
  menu.value = new IDEMenu({ container: menuRef.value, commands: props.commands, menus: props.menus });
  menu.value.draw();

  main.value = new IDEMain(mainRef.value);
  main.value.draw();
  // main.registerDock("hello", (content, id, data) => {
  //   render(h(HelloWorldWidget, { data }), content);
  // });
  // main.registerAccordian("hello", (content, id, data) => {
  //   render(h(HelloWorldWidget, { data }), content);
  // });

  const slots = useSlots();
  const defaultSlots = (slots.default as any)();

  defaultSlots
    .filter((slot: any) => slot.type && slot.type.__file)
    .forEach((slot: any) => {
      if (!main || !main.value) return;
      if (slot.props["data-position"] === "accordian") {
        main.value.registerAccordian(slot.props["data-type"], (content, id, data) => {
          if (props.registerAccordian) {
            props.registerAccordian(slot, content, id, data);
          }
        });
        if (slot.props["data-add"]) {
          main.value.addAccordian({
            key: slot.props["data-type"],
            type: slot.props["data-type"],
            icon: slot.props["data-icon"],
            active: slot.props["data-active"],
          });
        }
      } else if (slot.props["data-position"] === "dock") {
        main.value.registerDock(slot.props["data-type"], (content, id, data) => {
          if (props.registerDock) {
            props.registerDock(slot, content, id, data);
          }
        });
        if (slot.props["data-add"]) {
          main.value.addDock({
            key: slot.props["data-type"],
            type: slot.props["data-type"],
            title: slot.props["data-title"],
          });
        }
      }
    });

  status.value = new IDEStatus(statusRef.value);
  status.value.draw();

  if (props.initializeIde) {
    props.initializeIde({
      main: main.value as IDEMain,
      menu: menu.value as IDEMenu,
      status: status.value as IDEStatus,
    });
  }
});

defineExpose({
  mainRef,
  menuRef,
  statusRef,
  main,
  menu,
  status,
});
</script>
