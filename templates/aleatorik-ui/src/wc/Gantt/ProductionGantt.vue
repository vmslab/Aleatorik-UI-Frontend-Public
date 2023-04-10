<template>
  <production-gantt></production-gantt>
</template>

<script>
import store from "@/store";
import i18n from "@/plugins/i18n";
import { initComponent } from "@/utils/common";

import { MainModule } from "@/store/modules/mainStore";
import ProductionGantt from "@/views/Gantt/ProductionGantt.vue";

const handleResize = () => {
  MainModule.setWindow({
    width: window.innerWidth,
    height: window.innerHeight,
  });
};

export default {
  store,
  i18n,
  components: {
    ProductionGantt,
  },
  props: {
    navis: String,
    write: String,
    params: String,
    lang: String,
    i18n: String,
    themes: String,
    topHeight: Number,
    controlHeight: Number,
    drawerWidth: Number,
    font: String,
  },
  created() {
    window.addEventListener("resize", handleResize);
    handleResize();
  },
  mounted() {
    initComponent(this.$i18n, this.$props);
  },
  beforeUpdate() {
    initComponent(this.$i18n, this.$props);
  },
  destroyed() {
    window.addEventListener("resize", handleResize);
    handleResize();
  },
};
</script>
