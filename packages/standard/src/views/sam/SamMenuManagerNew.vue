<template>
  <Controller :show-filter="options.filter">
    <DxButton
      v-tooltip="{ text: $t('Save') }"
      class="moz-default-button"
      icon="save"
      type="default"
      :focusStateEnabled="false"
      :disabled="!isEditing"
      :text="$t('Save')"
      @click="saveData"
    />
    <input ref="file" type="file" :onchange="uploadFile" style="display: none" />
    <DxButton
      v-tooltip="{ text: $t('Import') }"
      class="moz-default-button"
      icon="import"
      type="default"
      :focusStateEnabled="false"
      :text="$t('Import')"
      @click="file.click()"
    />
    <DxButton
      v-tooltip="{ text: $t('Export') }"
      class="moz-default-button"
      icon="export"
      type="default"
      :focusStateEnabled="false"
      :text="$t('Export')"
      @click="exportData"
    />
    <DxButton
      v-tooltip="{ text: $t('Refresh') }"
      class="moz-default-button"
      icon="refresh"
      type="default"
      :focusStateEnabled="false"
      :text="$t('Refresh')"
      @click="loadData"
    />
    <!-- <template #title>
      <i
        v-if="options.filter"
        v-tooltip="{ text: t('HideFilter') }"
        @click="options.filter = !options.filter"
        class="mozart-icons moz-filter-icon-tap controller-title-button"
      />
      <i
        v-else
        v-tooltip="{ text: t('ShowFilter') }"
        @click="options.filter = !options.filter"
        class="mozart-icons moz-filter-icon controller-title-button"
      />
    </template> -->
    <!-- <template #filter>
      <div>
        <label>{{ $t("Menu") }} {{ $t("ID") }}</label>
        <DxTextBox v-model="newItem.menuId" />
      </div>
      <div>
        <label>{{ $t("Menu") }} {{ $t("Name") }}</label>
        <DxTextBox v-model="newItem.name" />
      </div>
      <div>
        <label>{{ $t("Menu") }} {{ $t("Path") }}</label>
        <DxTextBox v-model="newItem.path" />
      </div>
      <div>
        <label>{{ $t("Menu") }} {{ $t("Type") }}</label>
        <DxSelectBox v-model="newItem.type" :items="['Menu', 'Category']" />
      </div>

      <div>
        <DxButton
          v-tooltip="{ text: `${$t('Add')}(${$t('Top')})` }"
          class="moz-default-button"
          icon="add"
          type="default"
          :focusStateEnabled="false"
          :text="`${$t('Add')}(${$t('Top')})`"
          @click="addNodeFirst"
        />
        <DxButton
          v-tooltip="{ text: `${$t('Add')}(${$t('Bottom')})` }"
          class="moz-default-button"
          icon="add"
          type="default"
          :focusStateEnabled="false"
          :text="`${$t('Add')}(${$t('Bottom')})`"
          @click="addNodeLast"
        />
      </div>
      <div>
        <DxButton
          v-tooltip="{ text: `${$t('Add')}(${$t('Next')})` }"
          class="moz-default-button"
          icon="add"
          type="default"
          :focusStateEnabled="false"
          :text="`${$t('Add')}(${$t('Next')})`"
          @click="addNodeNext"
        />
        <DxButton
          v-tooltip="{ text: `${$t('Add')}(${$t('Child')})` }"
          class="moz-default-button"
          icon="add"
          type="default"
          :focusStateEnabled="false"
          :text="`${$t('Add')}(${$t('Child')})`"
          :disabled="!(options.selectedType === 'Category')"
          @click="addNodeChild"
        />
      </div>
    </template> -->
  </Controller>
  <div class="menu-manager moz-frame-for-outer-control" style="display: flex" ref="container">
    <div class="dx-card" :style="{ width: '100%', height: `var(--size-content-inner-height-outer-controller)` }">
      <div class="dx-card-title">
        <div class="dx-card-title-text">{{ $t("Menu") }} {{ $t("Setting") }}</div>
        <div class="spacer"></div>
        <div class="dx-card-title-action">
          <DxButton
            v-tooltip="{ text: $t('Change Display Info') }"
            icon="verify"
            stylingMode="text"
            @click="options.displayMemberName = !options.displayMemberName"
          />
          <DxButton v-tooltip="{ text: $t('Delete') }" icon="trash" stylingMode="text" @click="removeSelectedNode" />
        </div>
      </div>
      <div class="dx-card-text">
        <WjTreeView
          :items-source="menuItems"
          :displayMemberPath="options.displayMemberName ? 'name' : 'path'"
          childItemsPath="children"
          :initialized="onInitialized"
          :isReadOnly="true"
          :autoCollapse="false"
          :allowDragging="currentMenu?.isWrite"
          :formatItem="onFormatItem"
          :loadedItems="onLoadedItems"
          :dragOver="onDragOver"
          :dragEnd="onDragEnd"
          :itemClicked="onItemClicked"
          :selectedItemChanged="onSelectedItemChanged"
          :isCollapsedChanging="onIsCollapsedChanging"
        >
        </WjTreeView>
      </div>
    </div>
    <WjPopup
      style="min-width: 400px; max-width: 400px; width: 400px"
      :removeOnHide="true"
      :initialized="onInitializedPopup"
      showTrigger="None"
      :hideTrigger="options.keepPopup ? 'None' : 'Blur'"
      :fadeIn="false"
      :fadeOut="false"
      class="moz-popup"
      :hiding="onHiding"
      :position="PopupPosition.RightBottom"
    >
      <div class="moz-area-padding">
        <DxForm
          ref="dataForm"
          class="moz-form"
          validation-group="validationMenu"
          :form-data="selectedItem"
          :show-colon-after-label="false"
          @field-data-changed="onFieldDataChanged"
        >
          <DxItem
            data-field="menuId"
            :tabindex="4"
            :editor-options="{
              onKeyPress: onValueChanged,
            }"
          >
            <DxRequiredRule message="Menu Id is required" />
          </DxItem>
          <DxItem
            data-field="name"
            :tabindex="1"
            :editor-options="{
              onKeyPress: onValueChanged,
            }"
          >
            <DxRequiredRule message="Menu Name is required" />
          </DxItem>
          <DxItem
            data-field="path"
            :tabindex="2"
            :editor-options="{
              onKeyPress: onValueChanged,
            }"
          >
            <DxRequiredRule message="Menu Path is required" />
          </DxItem>
        </DxForm>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: space-between; padding: 0 12px 12px 12px">
        <div>
          <DxButton
            id="add-next-item-btn"
            class="moz-default-button"
            icon="add"
            :focusStateEnabled="false"
            :text="`${$t('Add')}(${$t('Next')})`"
          />
          <!-- @click="addNodeNext" -->
          <DxButton
            id="add-child-item-btn"
            v-show="options.selectedType === 'Category'"
            class="moz-default-button"
            icon="add"
            :focusStateEnabled="false"
            :text="`${$t('Add')}(${$t('Child')})`"
          />
          <!-- @click="addNodeChild" -->
        </div>
        <div>
          <DxButton
            class="moz-default-button"
            icon="trash"
            :focusStateEnabled="false"
            :text="$t('Remove')"
            @click="removeSelectedNode"
          />
          <DxButton
            :tabindex="3"
            class="moz-default-button"
            icon="close"
            :focusStateEnabled="false"
            :text="$t('Close')"
            @click="menuEditor?.hide()"
          />
        </div>
      </div>
    </WjPopup>

    <DxContextMenu
      :data-source="addItemTypes"
      :width="200"
      target="#add-next-item-btn"
      show-event="dxclick"
      @item-click="addNextItem"
      @showing="options.keepPopup = true"
      @hiding="
        () => {
          options.keepPopup = false;
          menuEditor?.focus();
        }
      "
    />
    <DxContextMenu
      :data-source="addItemTypes"
      :width="200"
      target="#add-child-item-btn"
      show-event="dxclick"
      @item-click="addChildItem"
      @showing="options.keepPopup = true"
      @hiding="
        () => {
          options.keepPopup = false;
          menuEditor?.focus();
        }
      "
    />

    <DxLoadPanel
      :visible="options.loading"
      :show-indicator="true"
      :show-pane="true"
      :shading="true"
      :hideOnOutsideClick="false"
      container=".menu-manager"
      shading-color="rgba(0,0,0,0.4)"
      message="Please, wait..."
    />
    <DxLoadPanel
      :visible="!options.isValid"
      :show-indicator="false"
      :show-pane="false"
      message=""
      container=".dx-drawer-panel-content"
      shading-color="rgba(0,0,0,0.4)"
    />
    <DxLoadPanel
      :visible="!options.isValid"
      :show-indicator="false"
      :show-pane="false"
      message=""
      container=".moz-top-app"
      shading-color="rgba(0,0,0,0.4)"
    />
    <DxLoadPanel
      :visible="!options.isValid"
      :show-indicator="false"
      :show-pane="false"
      message=""
      container=".moz-controller-root"
      shading-color="rgba(0,0,0,0.4)"
    />
  </div>
</template>

<script setup lang="ts">
import { Get, Save } from "../../stores/queryStore";
import { onMounted, ref, reactive } from "vue";
import { useMutation, useQuery, useQueryClient } from "vue-query";

import { CancelEventArgs, EventArgs, PopupPosition, Tooltip, format } from "@grapecity/wijmo";
import {
  TreeView,
  TreeNodeDragDropEventArgs,
  FormatNodeEventArgs,
  DropPosition,
  TreeNodeEventArgs,
  TreeNode,
} from "@grapecity/wijmo.nav";
import { Popup } from "@grapecity/wijmo.input";
import { WjTreeView } from "@grapecity/wijmo.vue2.nav";
import { WjPopup } from "@grapecity/wijmo.vue2.input";

import { DxForm, DxItem, DxLabel, DxRequiredRule } from "devextreme-vue/form";
import { DxContextMenu } from "devextreme-vue/context-menu";
import ValidationEngine from "devextreme/ui/validation_engine";

import "devextreme-vue/text-area";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { useTranslation } from "i18next-vue";
import { showMessage, showConfirm } from "../../utils/dialog";
import { Controller } from "../../components";
import DxButton from "devextreme-vue/button";
import { systemId } from "../../utils/env";
import { generateGUID } from "@aleatorik-ui/common-ui";

import { storeToRefs } from "pinia";
import { useMenuStore } from "../../stores/mainStore";
import { nextTick } from "process";

const menuModule = useMenuStore();
const { isEditing, currentMenu } = storeToRefs(menuModule);
const { t } = useTranslation();
interface IMenu {
  menuId: string;
  systemId: string;
  categoryId?: string;
  name: string;
  path: string;
  sequence: number;
  type: string;
  separator: boolean;
  children?: IMenu[];
  state: "loaded" | "added" | "removed";
}

const newItem = ref<IMenu>({
  menuId: "",
  systemId: systemId,
  name: "",
  path: "",
  sequence: 0,
  type: "Menu",
  separator: false,
  children: [],
  state: "added",
});
const newItemNo = ref(1);
const addItemTypes = ref([
  { text: `${t("Menu")}`, value: "Menu" },
  { text: `${t("Category")}`, value: "Category" },
]);

const menuItems = ref<IMenu[] | null>([]);
const removeItems = ref<IMenu[] | null>([]);
const container = ref<HTMLElement>();

const file = ref();

let treeView: TreeView | null = null;
let menuEditor: Popup | null = null;

const selectedNode = ref<TreeNode | null>(null);
const selectedItem = ref<any>({});

const options = reactive({
  loading: false,
  filter: true,
  isValid: true,
  activeDelete: false,
  displayMemberName: true,
  keepPopup: false,
  selectedType: null,
});
const queryClient = useQueryClient();

useQuery("Menu", ({ queryKey }) => Get(queryKey[0], systemId), {
  refetchOnWindowFocus: false,
  onSuccess: result => {
    menuModule.endEdit();
    removeItems.value = [];
    if (result && result.data) {
      const parseDatas = createMenuItems(
        result.data.map((d: IMenu) => {
          d.state = "loaded";
          return d;
        }),
      );
      menuItems.value = parseDatas;

      setTimeout(() => {
        treeView?.collapseToLevel(100000);
      }, 100);
    } else menuItems.value = [];

    showMessage("Data load complete", true);
  },
  onError: err => {
    removeItems.value = [];
    showMessage("An error occurred while loading data", false);
    menuItems.value = [];
  },
});

const saveMenu = useMutation(param => Save("Menu", param), {
  onSuccess: result => {
    removeItems.value = [];
    if (result) showMessage(`Affected ${result.data} Row${result.data > 1 ? "s" : ""}`, result.data > 0);
    menuModule.endEdit();
  },
  onError: err => {
    removeItems.value = [];
    showMessage("An error occurred while saving data", false);
  },
});

onMounted(async () => {
  await loadData();
});

const onInitialized = (view: TreeView) => {
  treeView = view;
  const frameEl = container.value || document.getElementsByClassName("menu-manager")[0];
  if (!frameEl) return;

  frameEl.addEventListener("contextmenu", e => {
    options.displayMemberName = !options.displayMemberName;
    e.preventDefault();
  });
};
const onInitializedPopup = (popup: Popup) => {
  menuEditor = popup;
};
const onHiding = (s: Popup, e: CancelEventArgs) => {
  const valid = ValidationEngine.validateGroup("validationMenu");
  if (!valid.isValid) {
    e.cancel = true;
    return;
  }
  options.isValid = true;
};
const addNextItem = async (e: any) => {
  newItem.value.type = e.itemData.value;
  menuModule.beginEdit();
  await addNodeNext();
};
const addChildItem = async (e: any) => {
  newItem.value.type = e.itemData.value;
  menuModule.beginEdit();
  await addNodeChild();
};

const loadData = async () => {
  options.loading = true;
  queryClient.invalidateQueries("Menu");
  options.loading = false;
};

const saveData = () => {
  const item = [...createFlatMenuItems(menuItems.value as any[]), ...(removeItems.value as any[])];
  saveMenu.mutateAsync(item as any);
};

const exportData = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(menuItems.value, null, 2)], {
      type: "application/json",
    }),
  );
  a.setAttribute("download", `${systemId}_menus.json`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const uploadFile = async (e: any) => {
  if (!file.value.length || !file.value.files.length) return;

  if (isEditing.value) {
    const result = await showConfirm({ message: "Current changes will be reset. continue?", title: "Import" });
    if (!result) return;
  }
  menuModule.endEdit();

  const reader = new FileReader();
  reader.onload = evt => {
    const text = evt.target?.result?.toString();
    if (!text || text.length === 0) return;

    const json = JSON.parse(text);
    if (!json || json.length === 0) return;

    menuItems.value?.forEach(item => {
      removeChildItem(item);
    });

    menuItems.value = json.map((item: any) => {
      item.menuMapId = generateGUID();
      return item;
    });

    setTimeout(() => {
      treeView?.collapseToLevel(100000);
    }, 100);
  };
  reader.readAsText(file.value.files[0]);
};

const onFormatItem = (s: TreeView, e: FormatNodeEventArgs) => {
  const isCategory = e.dataItem.type === "Category";
  if (isCategory) e.element.style.fontWeight = "700";
};

const onLoadedItems = (s: TreeView, e: EventArgs) => {
  const tooltip = new Tooltip();
  tooltip.position = PopupPosition.RightTop;
  if (!treeView) return;

  for (let node = treeView.nodes[0]; node; node = node.next(false)) {
    const tooltipContent = format(
      `<b>${t("Menu")} ${t("Type")}:</b> {type}<br> <b>${t("Menu")} ${t("Name")}:</b> {name}<br><b>${t(
        "Path",
      )}:</b> {path}`,
      node.dataItem,
    );

    const owner = node.element.getElementsByTagName("span")[0] || node.element;
    tooltip.setTooltip(owner, tooltipContent);
  }
};

const onItemClicked = (s: TreeView, e: EventArgs) => {
  if (!currentMenu.value?.isWrite) return;
  showMenuEditor(s);
};

const showMenuEditor = (s: TreeView) => {
  if (!menuEditor) return;
  menuEditor.hide();

  selectedItem.value = s.selectedItem;
  selectedNode.value = s.selectedNode;

  const owner = s.selectedNode.element.getElementsByTagName("span")[0] || s.selectedNode.element;
  menuEditor.owner = owner;
  menuEditor.show();
  options.isValid = false;
};

const onValueChanged = (e: any) => {
  menuModule.beginEdit();
};

const onFieldDataChanged = (e: any) => {
  switch (e.dataField) {
    case "name":
    case "path":
      selectedNode.value?.refresh();
      break;
  }
};

const createMenuItems = (datas: IMenu[]): any[] => {
  try {
    const datasMap: any = {};
    datas.forEach(data => {
      datasMap[data.menuId] = data;
    });

    const cloneDatas = JSON.parse(JSON.stringify(datas));
    cloneDatas
      .filter((cdata: IMenu) => cdata.categoryId && cdata.categoryId.length > 0)
      .forEach((cdata: IMenu) => {
        if (!cdata.categoryId) return;

        const parentData = datasMap[cdata.categoryId];
        const childIdx = datas.findIndex(data => cdata.menuId == data.menuId);
        if (!parentData || childIdx < 0) return;

        const childData = datas.splice(childIdx, 1);

        if (!parentData.children) parentData.children = [];

        parentData.children.push(...childData);
        parentData.children.sort((x: IMenu, y: IMenu) => x.sequence - y.sequence);
      });
    datas.sort((x, y) => x.sequence - y.sequence);
    return datas;
  } catch (e) {
    console.log(e);
  }
  return [];
};

const createFlatMenuItems = (datas: any[], categoryId: string = "", flatMenus: any[] = []): any[] => {
  if (!datas || datas.length === 0) return [];
  try {
    datas.forEach((data, sequence) => {
      flatMenus.push(Object.assign(data, { categoryId, sequence }));
      if (data.children && data.children.length > 0) {
        createFlatMenuItems(data.children, data.menuId, flatMenus);
      }
    });
  } catch (e) {
    console.log(e);
  }
  return flatMenus;
};

// const addNodeFirst = async () => {
//   if (!treeView) return;
//   const result = await validateNewNode();
//   if (result) return;

//   const newMenu = JSON.parse(JSON.stringify(newItem.value));
//   const node = treeView.selectedNode;
//   const parent = node?.parentNode;

//   if (!newMenu.path || newMenu.path.length === 0) {
//     newMenu.path = `${
//       parent && parent.dataItem.path !== "/" ? `${parent.dataItem.path}/` : `/${systemId}/`
//     }${newMenu.name.toLowerCase().replace(/ /gi, "")}`;
//   }
//   const targetNode = parent ? parent : treeView;
//   const selectedNode = targetNode ? targetNode.addChildNode(0, newMenu) : treeView.addChildNode(0, newMenu);

//   newItem.value = { ...newItem.value, menuId: "", name: "", path: "" };

//   treeView.refresh();
//   treeView.loadTree();
//   menuEditor?.hide();

//   setTimeout(() => {
//     selectedNode.element.click();
//   }, 100);
// };

// const addNodeLast = async () => {
//   if (!treeView) return;
//   const result = await validateNewNode();
//   if (result) return;

//   const newMenu = JSON.parse(JSON.stringify(newItem.value));
//   const node = treeView.selectedNode;
//   const parent = node?.parentNode;

//   if (!newMenu.path || newMenu.path.length === 0) {
//     newMenu.path = `${
//       parent && parent.dataItem.path !== "/" ? `${parent.dataItem.path}/` : `/${systemId}/`
//     }${newMenu.name.toLowerCase().replace(/ /gi, "")}`;
//   }
//   const targetNode = parent ? parent : treeView;
//   const index = targetNode && targetNode.nodes ? targetNode.nodes.length : treeView.nodes ? treeView.nodes.length : 0;
//   const selectedNode = targetNode ? targetNode.addChildNode(index, newMenu) : treeView.addChildNode(index, newMenu);
//   newItem.value = { ...newItem.value, menuId: "", name: "", path: "" };

//   treeView.refresh();
//   treeView.loadTree();
//   menuEditor?.hide();

//   setTimeout(() => {
//     selectedNode.element.click();
//   }, 100);
// };

const addNodeNext = async () => {
  if (!treeView) return;
  const result = await validateNewNode();
  if (result) return;

  const newMenu = JSON.parse(JSON.stringify(newItem.value));
  const node = treeView.selectedNode;
  const parent = node?.parentNode;

  if (!newMenu.path || newMenu.path.length === 0) {
    newMenu.path = `${
      parent && parent.dataItem.path !== "/" ? `${parent.dataItem.path}/` : `/${systemId}/`
    }${newMenu.name.toLowerCase().replace(/ /gi, "")}`;
  }
  const targetNode = parent ? parent : treeView;
  const index = node.index + 1;
  const selectedNode = targetNode ? targetNode.addChildNode(index, newMenu) : treeView.addChildNode(index, newMenu);
  newItem.value = { ...newItem.value, menuId: "", name: "", path: "" };

  treeView.refresh();
  treeView.loadTree(true);
  menuEditor?.hide();

  nextTick(() => {
    if (!treeView) return;
    const addedNode = findNode(treeView.nodes, newMenu.menuId);
    addedNode?.element.click();
  });
};

const addNodeChild = async () => {
  if (!treeView) return;
  const result = await validateNewNode();
  if (result) return;

  const newMenu = JSON.parse(JSON.stringify(newItem.value));
  const node = treeView.selectedNode;

  if (!newMenu.path || newMenu.path.length === 0) {
    newMenu.path = `${node && node.dataItem.path !== "/" ? `${node.dataItem.path}/` : `/${systemId}/`}${newMenu.name
      .toLowerCase()
      .replace(/ /gi, "")}`;
  }
  const targetNode = node ? node : treeView;
  const index = targetNode && targetNode.nodes ? targetNode.nodes.length : treeView.nodes ? treeView.nodes.length : 0;
  const selectedNode = targetNode ? targetNode.addChildNode(index, newMenu) : treeView.addChildNode(index, newMenu);
  newItem.value = { ...newItem.value, menuId: "", name: "", path: "" };

  treeView.refresh();
  treeView.loadTree(true);
  menuEditor?.hide();

  nextTick(() => {
    if (!treeView) return;
    const addedNode = findNode(treeView.nodes, newMenu.menuId);
    addedNode?.element.click();
  });
};

const removeSelectedNode = async () => {
  if (!treeView) return;

  const node = treeView.selectedNode;
  const result = await showConfirm({ message: `Remove ${node.dataItem.name}.\nContinue?`, title: "Remove" });
  if (!result) return;

  removeChildItem(node.dataItem);
  treeView.selectedNode?.remove();

  treeView.refresh();
  menuModule.beginEdit();
  menuEditor?.hide();
};

const removeChildItem = (menu: IMenu) => {
  if (menu.children && menu.children.length > 0) {
    menu.children.forEach((child: IMenu) => {
      removeChildItem(child);
    });
  }

  if (menu.state === "loaded") {
    menu.state = "removed";
    removeItems.value?.push(menu);
  }
};

const findNode = (nodes: TreeNode[], menuId: string): TreeNode | null => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.dataItem.menuId === menuId) return node;
    if (node.hasChildren) {
      const childNode = findNode(node.nodes, menuId);
      if (childNode) return childNode;
    }
  }
  return null;
};

const validateNewNode = () => {
  return new Promise(async resolve => {
    const newMenu = newItem.value;
    if (!newMenu.menuId || newMenu.menuId.length === 0) {
      newMenu.menuId = generateGUID();
    }
    if (!newMenu.name || newMenu.name.length === 0) {
      newMenu.name = `New Menu ${newItemNo.value++}`;
    }
    if (menuItems.value && validateMenuId(menuItems.value, newMenu.menuId)) {
      showMessage("Already Resisted MenuId", false);
      return resolve(true);
    }
    return resolve(false);
  });
};

const validateMenuId = (menus: IMenu[], targetId: string): boolean => {
  return menus?.some(menu => {
    if (menu.menuId === targetId) return true;
    if (menu.children && menu.children.length > 0) {
      return validateMenuId(menu.children, targetId);
    }
    return false;
  });
};

const onDragOver = (s: TreeView, e: TreeNodeDragDropEventArgs) => {
  if (e.dropTarget.dataItem.type !== "Category" && e.position == DropPosition.Into) {
    e.position = DropPosition.Before;
  }
};

const onDragEnd = (s: TreeView, e: EventArgs) => {
  menuModule.beginEdit();
};

const onSelectedItemChanged = (s: TreeView, e: EventArgs) => {
  options.selectedType = s.selectedItem?.type;
};

const onIsCollapsedChanging = (s: TreeView, e: TreeNodeEventArgs) => {
  if (!e.node.isCollapsed) e.cancel = true;
};
</script>
<style>
.wj-node .wj-node-text {
  color: var(--color-font4);
}
</style>
