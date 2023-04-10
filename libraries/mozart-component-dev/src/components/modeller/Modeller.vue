<template>
  <div>
    <div class="flow-tabs" :style="tabsStyle">
      <div
        v-for="(tab, i) in tabs"
        :class="`flow-tab ${tab.selected ? 'selected' : ''}`"
        :style="tabStyle"
        :key="`tab-${i}`"
        :module-tab="tab"
        @click="onModuleClick($event, tab)"
      >
        <i class="mozart-icons m-060_icon-database"></i>
        {{ tab.name }}
        <i class="mozart-icons m-025_DxButton-edit" @click="onModuleEditClick($event, tab)"></i>
        <i class="mozart-icons m-019_DxButton_close" @click="onModuleCloseClick($event, tab)"></i>
      </div>
      <div class="flow-tab" :style="tabStyle" @click="onModuleAddClick">
        <i class="mozart-icons m-018_DxButton_add"></i>
      </div>
    </div>
    <database-edit-popup v-model="openTabEdit" :data="tabData" @test="onDbTest" @save="onDbSave">
    </database-edit-popup>
    <div ref="flow" :style="flowStyle" @drop="onDrop" @dragover="onDragOver">
      <div class="toolbox">
        <div :draggable="true" @dragstart="onDrag" data-node="table">
          <i class="toolbox-icon mozart-icons m-061_icon-data-table"></i>
        </div>
        <div :draggable="true" @dragstart="onDrag" data-node="sql">
          <i class="toolbox-icon mozart-icons m-031_file-icon"></i>
        </div>
      </div>
      <div class="toolbar">
        <DxButton
          v-tooltip="{ text: $t('Save') }"
          class="toolbar-button"
          icon="save"
          stylingMode="text"
          @click="onSave"
        />
        <DxButton
          v-tooltip="{ text: $t('MigrateUp') }"
          class="toolbar-button"
          icon="play"
          stylingMode="text"
          @click="onMigrate(false)"
        />
        <DxButton
          v-tooltip="{ text: $t('MigrateDown') }"
          class="toolbar-button"
          icon="trash"
          stylingMode="text"
          @click="onMigrate(true)"
        />
      </div>
      <div class="minimap" ref="minimap"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DxButton } from "devextreme-vue/button";
import { DxTextBox } from "devextreme-vue/text-box";
import {
  Flow,
  FlowMinimap,
  IConnectionInfo,
  IFlowWrapper,
  IFlowModule,
  IEntityDef,
  IEntityPropDef,
  ISqlDef,
} from "mozart-common";

import DatabaseEditPopup from "./popup/DatabaseEditPopup.vue";
import TableNode from "./node/TableNode.vue";
import SQLNode from "./node/SQLNode.vue";

interface IModelInfo {
  ConnectionInfos: IConnectionInfo[];
  EntityDefs: IEntityDef[];
  EntityPropDefs: IEntityPropDef[];
  SqlDefs: ISqlDef[];
}

interface IMigrateInfo {
  ConnectionInfo?: IConnectionInfo;
  EntityDefs: IEntityDef[];
  EntityPropDefs: IEntityPropDef[];
  IsDown: boolean;
}

@Component({
  name: "Modeller",
  components: {
    DxButton,
    DxTextBox,
    DatabaseEditPopup,
  },
})
export default class Modeller extends Vue {
  @Prop({ type: [String, Number], required: true, default: 800 }) public width!: number;
  @Prop({ type: [String, Number], required: true, default: 600 }) public height!: number;

  public tabHeight: number = 40;
  public openTabEdit: boolean = false;
  public tabData: IFlowModule = { name: "", data: {}, info: {}, selected: false };
  public history: IFlowWrapper[] = [];
  public historyStatus: number | null = null;
  public historyActive: boolean = false;
  public historyStop: boolean = false;
  public editor: Flow | null = null;
  public minimap: FlowMinimap | null = null;
  public handler = {
    get: (target: any, property: any, receiver: any) => {
      // console.log(JSON.stringify(target));
      if (!this.historyActive && !this.historyStop) {
        this.history.push(target);
      }
      this.historyActive = false;
      return Reflect.get(target, property, receiver);
    },
  };

  constructor() {
    super();
  }

  public get flowStyle(): object {
    return {
      height: `${this.height - this.tabHeight}px`,
      width: `${this.width}px`,
    };
  }

  public get tabsStyle(): object {
    return {
      height: `${this.tabHeight}px`,
      width: `${this.width}px`,
    };
  }

  public get tabStyle(): object {
    return {
      height: `${this.tabHeight}px`,
    };
  }

  public get tabs(): IFlowModule[] {
    if (!this.editor) return [];
    const result: IFlowModule[] = [];
    for (const key of Object.keys(this.editor.flow.flow)) {
      result.push(this.editor.flow.flow[key]);
    }
    return result;
  }

  public mounted() {
    this.editor = new Flow(this.$refs.flow as HTMLElement);
    this.editor.reroute = true;
    this.editor.rerouteFixCurvature = true;
    this.editor.forceFirstInput = false;
    // this.editor.draggableInputs = false;

    this.editor.on("click", () => {
      this.historyStop = true;
    });

    this.editor.on("mouseUp", () => {
      this.historyStop = false;
      this.historyActive = true;
      this.history.push(this.editor!.export());
      this.historyStatus = this.history.length - 1;
    });

    this.editor.flow = new Proxy(this.editor.flow, this.handler);

    const zoom = 0.05;
    this.minimap = new FlowMinimap(this.$refs.minimap as HTMLElement, this.editor, zoom);

    this.editor.start();
    this.history.splice(-2); // Fix history

    this.editor.registerNode("table", (content, id, data, module) => {
      const wrapper = new Vue({
        parent: this,
        render: h =>
          h(TableNode, {
            props: {
              id,
              data,
            },
          }),
      }).$mount();
      content.appendChild(wrapper.$el);
    });
    this.editor.registerNode("sql", (content, id, data, module) => {
      const flow = this.editor?.getModule(module)!;
      const wrapper = new Vue({
        parent: this,
        render: h =>
          h(SQLNode, {
            props: {
              id,
              data,
              conn: flow.info["connection"],
            },
            on: {
              execute: this.onExecute,
            }
          }),
      }).$mount();
      content.appendChild(wrapper.$el);
    });
  }

  public onUndo(event: any) {
    if (!this.editor) return;
    if (this.historyStatus === 1) {
      return;
    }
    if (this.historyStatus === null) {
      this.historyStatus = history.length;
    }
    if (this.historyStatus === history.length) {
      this.historyActive = true;
      this.history.push(this.editor.export());
      this.history.splice(-1); // Fix editor export two events;
    }
    this.historyStatus = this.historyStatus - 1;
    this.historyActive = true;
    this.editor.import(this.history[this.historyStatus]);
    this.editor.flow = new Proxy(this.editor.flow, this.handler);
  }

  public onRedo(event: any) {
    if (!this.editor) return;

    if (this.historyStatus !== null && this.historyStatus < this.history.length - 1) {
      this.historyStatus = this.historyStatus + 1;
      this.historyActive = true;
      this.editor.import(this.history[this.historyStatus]);
      this.editor.flow = new Proxy(this.editor.flow, this.handler);
    }
  }

  public onLoad(modelInfo: IModelInfo) {
    if (!this.editor) return;

    const module = this.editor.export();
    modelInfo.ConnectionInfos.filter(x => x.Diagram).forEach((conn, i) => {
      module.flow[conn.Name] = JSON.parse(conn.Diagram!);
      delete conn.Diagram;
      module.flow[conn.Name].info["connection"] = conn;
    });

    for (const moduleKey of Object.keys(module.flow)) {
      for (const nodeKey of Object.keys(module.flow[moduleKey].data)) {
        const node = module.flow[moduleKey].data[+nodeKey];
        if (node.html === "table") {
          const entity = modelInfo.EntityDefs.find(x => x.ID === node.data.name);
          if (!entity) continue;
          const entityProps = modelInfo.EntityPropDefs.filter(x => x.EntityName === entity.Name);
          node.data.entity = entity;
          node.data.entityProps = entityProps;
          delete node.data.name;
        } else if (node.html === "sql") {
          const sql = modelInfo.SqlDefs.find(x => x.ID === node.data.name);
          if (!sql) continue;
          node.data.sql = sql;
          delete node.data.name;
        }
      }
    }

    this.editor.import(module);
  }

  public onSave() {
    if (!this.editor) return;
    const modelInfo: IModelInfo = {
      ConnectionInfos: [],
      EntityDefs: [],
      EntityPropDefs: [],
      SqlDefs: [],
    };
    const module = this.editor.export();
    for (const moduleKey of Object.keys(module.flow)) {
      for (const nodeKey of Object.keys(module.flow[moduleKey].data)) {
        const node = module.flow[moduleKey].data[+nodeKey];
        if (node.html === "table") {
          const entity: IEntityDef = node.data["entity"];
          modelInfo.EntityDefs.push(entity);
          const entityProps = node.data["entityProps"];
          entityProps.forEach((x: IEntityPropDef) => (x.EntityName = entity.Name));
          modelInfo.EntityPropDefs.push(...entityProps);
          node.data = { name: entity.ID };
        } else if (node.html === "sql") {
          const sql: ISqlDef = node.data["sql"];
          modelInfo.SqlDefs.push(sql);
          node.data = { name: sql.ID };
        }
      }

      const connection: IConnectionInfo = module.flow[moduleKey].info["connection"];
      module.flow[moduleKey].info = { connection: connection.ID };
      connection.Diagram = JSON.stringify(module.flow[moduleKey]);
      delete connection.Tables;
      modelInfo.ConnectionInfos.push(connection);
    }
    this.$emit("save", modelInfo);
  }

  public onMigrate(isDown: boolean) {
    if (!this.editor) return;
    if (!this.editor.module) return;
    const migrateInfo: IMigrateInfo = {
      ConnectionInfo: undefined,
      EntityDefs: [],
      EntityPropDefs: [],
      IsDown: isDown,
    };
    const module = this.editor.getModule(this.editor.module);
    if (!module) return;
    migrateInfo.ConnectionInfo = module.info["connection"];
    for (const dataKey of Object.keys(module.data)) {
      const conNode = this.editor.getNodeFromId(+dataKey);
      if (conNode.name !== "table") continue;
      const entity: IEntityDef = conNode.data["entity"];
      migrateInfo.EntityDefs.push(entity);
      const entityProps = conNode.data["entityProps"];
      entityProps.forEach((x: IEntityPropDef) => (x.EntityName = entity.Name));
      migrateInfo.EntityPropDefs.push(...entityProps);
    }
    this.$emit("migrate", migrateInfo);
  }

  public onDrag(event: any) {
    event.dataTransfer.setData("node", event.target.getAttribute("data-node"));
  }

  public onDragOver(event: any) {
    event.preventDefault();
  }

  public onDrop(event: any) {
    event.preventDefault();
    if (!this.editor) return;
    if (!this.editor.precanvas) return;
    if (this.editor.editorMode !== "edit") return;
    const type = event.dataTransfer.getData("node");
    const posX =
      event.clientX *
        (this.editor.precanvas.clientWidth /
          (this.editor.precanvas.clientWidth * this.editor.zoom)) -
      this.editor.precanvas.getBoundingClientRect().x *
        (this.editor.precanvas.clientWidth /
          (this.editor.precanvas.clientWidth * this.editor.zoom));
    const posY =
      event.clientY *
        (this.editor.precanvas.clientHeight /
          (this.editor.precanvas.clientHeight * this.editor.zoom)) -
      this.editor.precanvas.getBoundingClientRect().y *
        (this.editor.precanvas.clientHeight /
          (this.editor.precanvas.clientHeight * this.editor.zoom));
    switch (type) {
      case "table":
        this.editor.addNode("table", 1, 0, posX, posY, "", {}, "table", true);
        break;
      case "sql":
        this.editor.addNode("sql", 1, 0, posX, posY, "", {}, "sql", true);
        break;
      default:
        break;
    }
  }

  public onModuleClick(event: any, module: IFlowModule) {
    if (!this.editor) return;
    if (this.editor.module === module.name) return;
    this.tabs.forEach(x => {
      x.selected = x.name === module.name;
    });
    this.editor.changeModule(module.name);
  }

  public onModuleEditClick(event: any, module: IFlowModule) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.editor) return;
    this.openTabEdit = true;
    this.tabData = module;
  }

  public onModuleCloseClick(event: any, module: IFlowModule) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.editor) return;
    module.selected = false;
    this.editor.changeModule(module.name);
    this.editor.removeModule(module.name);
  }

  public onModuleAddClick() {
    this.tabData = { name: "", data: {}, info: {}, selected: false };
    this.openTabEdit = true;
  }

  public onExecute(params: { sql: string }, resolve: Function) {
    const promise = new Promise((subResolve: Function) => {
      this.$emit("execute", params, subResolve);
    });
    promise.then(result => {
      resolve(result);
    });
  }

  public onDbTest(conn: IConnectionInfo) {
    const promise = new Promise((resolve: Function) => {
      this.$emit("connecte", { conn }, resolve);
    });
    promise.then(result => {
      console.log(result);
    });
  }

  public onDbSave(conn: IConnectionInfo) {
    if (!this.editor) return;
    if (!this.tabData) return;
    if (Reflect.has(this.tabData.info, "connection")) {
      const oldConn = this.tabData.info["connection"] as IConnectionInfo;
      this.editor.flow.flow[this.tabData.name].info["connection"] = conn;
      this.editor.renameModule(oldConn.Name, conn.Name);
    } else {
      this.tabData.info["connection"] = conn;
      this.tabData.name = conn.Name;
      this.tabs.push(this.tabData);
      this.editor.addModule(this.tabData);
    }
    const promise = new Promise((resolve: Function) => {
      this.$emit("connecte", { conn }, resolve);
    });
    promise.then(result => {
      console.log(result);
    });
  }
}
</script>
