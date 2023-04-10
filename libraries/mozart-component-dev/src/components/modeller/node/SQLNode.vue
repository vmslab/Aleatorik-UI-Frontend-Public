<template>
  <div class="dx-card">
    <div class="dx-card-title">
      <div class="dx-card-title-text">SQL</div>
      <div class="spacer"></div>
      <div class="dx-card-title-action">
        <DxButton v-tooltip="{ text: $t('Edit') }" icon="edit" @click="onEdit" />
      </div>
    </div>
    <div class="dx-card-text">
      <div class="flex-center">
        <i class="mozart-icons m-031_file-icon" style="font-size: 40px"></i>
      </div>
      <div class="flex-center">{{ sql.Name }}</div>
      <SQLEditPopup v-model="edit" :conn="conn" :sql="sql" @save="onSave" @execute="onExecute"></SQLEditPopup>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DxButton } from "devextreme-vue/button";
import { DxTextBox } from "devextreme-vue/text-box";
import { generateGUID, IConnectionInfo, ISqlDef } from "mozart-common";

import SQLEditPopup from "../popup/SQLEditPopup.vue";

@Component({
  components: {
    DxButton,
    DxTextBox,
    SQLEditPopup,
  },
})
export default class SQLNode extends Vue {
  @Prop({ type: Number, required: true, default: 1 }) public id!: number;
  @Prop({ type: Object, required: true }) public data!: Record<string, any>;
  @Prop({ type: Object, required: true }) public conn!: IConnectionInfo;

  public edit: boolean = false;

  constructor() {
    super();
  }

  public get sql(): ISqlDef {
    const sql: ISqlDef = {
      ID: generateGUID(),
      Name: "",
      Contents: "",
      Params: [],
    };

    if (!this.data["sql"]) {
      this.data["sql"] = sql;
    }
    return this.data["sql"];
  }

  public onExecute(params: { sql: string }, resolve: Function) {
    const promise = new Promise((subResolve: Function) => {
      this.$emit("execute", params, subResolve);
    });
    promise.then(result => {
      resolve(result);
    });
  }

  public onEdit(e: any) {
    this.edit = true;
  }

  public onSave() {}
}
</script>
