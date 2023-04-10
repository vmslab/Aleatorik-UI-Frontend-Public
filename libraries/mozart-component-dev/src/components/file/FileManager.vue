<template>
  <div @dragover="onDragOver($event)" @dragleave="onDragLeave($event)" @drop="onDrop($event)">
    <DxTreeList
      :id="treeListId"
      class="moz-file-manager"
      ref="treelist"
      :height="height - 2 - (upload ? 100 : 0)"
      :data-source="dataSource"
      :allow-column-resizing="true"
      :show-row-lines="false"
      :show-column-lines="false"
      :show-borders="false"
      :hover-state-enabled="true"
      :auto-expand-all="true"
      :column-auto-width="true"
      :focused-row-enabled="focus"
      key-expr="path"
      parent-id-expr="parentPath"
      no-data-text="No data to display"
      @focusedRowChanged="onFocuedRowChanged"
      @SelectionChanged="onSelectionChanged"
    >
      <DxSelection v-if="download" mode="multiple" :recursive="true" />
      <DxEditing
        :allow-updating="allowUpdating"
        :allow-deleting="allowDeleting"
        :confirmDelete="immediate"
        :use-icons="true"
        :popup="{
          title: $t('Rename'),
          showTitle: true,
          width: 400,
          height: 210,
        }"
        mode="popup"
      />
      <DxColumn
        data-field="name"
        :headerCellTemplate="getNameHeaderCellTemplate"
        :cellTemplate="getNameCellTemplate"
      >
        <DxFormItem :editor-options="{ width: 300 }" />
      </DxColumn>
      <DxColumn :visible="showSize" data-field="size">
        <DxFormItem :visible="false" />
      </DxColumn>
      <DxColumn :visible="showLastModified" data-field="lastModified">
        <DxFormItem :visible="false" />
      </DxColumn>
      <DxColumn
        data-field="state"
        alignment="left"
        cell-template="stateTemplate"
        :visible="upload && showState"
      >
        <DxFormItem :visible="false" />
      </DxColumn>
      <DxColumn type="buttons" :width="160" alignment="right">
        <DxColumnButton :visible="allowAddItems">
          <template #default="{ data }">
            <span class="moz-treelist-row-btn">
              <label
                title="Add Files"
                class="mozart-icons m-031_file-icon moz-treelist-icon moz-treelist-file-icon"
                :for="`${fileId}-${data.data.path}`"
              />
              <input
                type="file"
                :id="`${fileId}-${data.data.path}`"
                style="display: none"
                :multiple="multiple"
                @change="onFilesChange($event, data.data.path)"
              />
            </span>
          </template>
        </DxColumnButton>
        <DxColumnButton :visible="allowAddItems">
          <template #default="{ data }">
            <span class="moz-treelist-row-btn">
              <label
                title="Add Folder"
                class="mozart-icons m-043_icon-folder moz-treelist-icon moz-treelist-folder-icon"
                :for="`${dirId}-${data.data.path}`"
              />
              <input
                type="file"
                :id="`${dirId}-${data.data.path}`"
                style="display: none"
                webkitdirectory
                :multiple="multiple"
                @change="onDirsChange($event, data.data.path)"
              />
            </span>
          </template>
        </DxColumnButton>
        <DxColumnButton
          name="edit"
          css-class="mozart-icons m-025_DxButton-edit moz-treelist-icon moz-treelist-column-icon"
        />
        <DxColumnButton
          name="delete"
          css-class="mozart-icons m-023_DxButton-delete moz-treelist-icon moz-treelist-column-icon"
        />
      </DxColumn>
      <template #stateTemplate="{ data: options }">
        <div v-if="options.data.state === 'Add'" class="moz-add-chip">
          <i class="mozart-icons m-046_icon-add"></i>
          <span>added</span>
        </div>
        <div v-else-if="options.data.state === 'Edit'" class="moz-edit-chip">
          <i class="mozart-icons m-045_icon-check"></i>
          <span>edited</span>
        </div>
        <div v-else-if="options.data.state === 'Remove'" class="moz-remove-chip">
          <i class="mozart-icons m-044_icon-exclude"></i>
          <span>removed</span>
        </div>
        <div v-else></div>
      </template>
    </DxTreeList>
    <div v-if="upload" :id="dropZoneId" class="moz-upload-drop-zone">
      <input
        type="file"
        :id="dirId"
        style="display: none"
        webkitdirectory
        :multiple="multiple"
        @change="onDirsChange($event)"
      />
      <input
        type="file"
        :id="fileId"
        style="display: none"
        :multiple="multiple"
        @change="onFilesChange($event)"
      />
      <template v-if="directory">
        <div class="moz-upload-button" id="moz-upload-button">
          <i class="mozart-icons m-046_icon-add"></i>
        </div>
      </template>
      <template v-else>
        <div class="moz-upload-button" @click="onFileUploadBtnClick">
          <i class="mozart-icons m-046_icon-add"></i>
        </div>
      </template>
      <span>{{ labelText }}</span>
    </div>
    <dx-context-menu
      :data-source="uploadMenus"
      showEvent="click"
      cssClass="moz-upload-button-context"
      target="#moz-upload-button"
      @item-click="onUploadMenuClick"
      item-template="upload-menu-item"
    >
      <template #upload-menu-item="{ data }">
        <div>
          <i :class="data.icon"></i>
          <span class="moz-upload-button-context-text">{{ data.text }}</span>
        </div>
      </template>
    </dx-context-menu>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import {
  DxTreeList,
  DxColumn,
  DxEditing,
  DxFormItem,
  DxSelection,
  DxButton as DxColumnButton,
} from "devextreme-vue/tree-list";
import { DxButton } from "devextreme-vue/button";
import { DxContextMenu } from "devextreme-vue/context-menu";

import { findElement, FileSystem, IFileInfo, generateGUID } from "mozart-common";

@Component({
  name: "FileManager",
  components: {
    DxTreeList,
    DxColumn,
    DxEditing,
    DxFormItem,
    DxSelection,
    DxButton,
    DxColumnButton,
    DxContextMenu,
  },
})
export default class FileManager extends Vue {
  @Prop({ type: Number, required: true, default: 0 }) public height!: number;
  @Prop({ type: Boolean, default: false }) public upload!: boolean;
  @Prop({ type: Boolean, default: false }) public download!: boolean;
  @Prop({ type: Boolean, default: false }) public rename!: boolean;
  @Prop({ type: Boolean, default: true }) public remove!: boolean;
  @Prop({ type: Boolean, default: false }) public immediate!: boolean;
  @Prop({ type: Boolean, default: false }) public focus!: boolean;
  @Prop({ type: Boolean, default: true }) public multiple!: boolean;
  @Prop({ type: Boolean, default: true }) public directory!: boolean;
  @Prop({ type: Boolean, default: true }) public isServerRemove!: boolean;
  @Prop({ type: Boolean, default: true }) public showSize!: boolean;
  @Prop({ type: Boolean, default: true }) public showLastModified!: boolean;
  @Prop({ type: Boolean, default: false }) public showState!: boolean;
  @Prop({ type: String, default: "Drag & Drop your file or folder here" })
  public labelText!: boolean;
  @Prop({ type: Array }) public inputs?: IFileInfo[];

  public treeListId: string = generateGUID();
  public dropZoneId: string = generateGUID();
  public fileId: string = generateGUID();
  public dirId: string = generateGUID();

  // Tree 구조의 Data (Folder 포함)
  public items: FileSystem[] = [];
  // List 구조의 Data (File만 포함)
  public files: FileSystem[] = [];
  public selectedFiles: FileSystem[] = [];

  public uploadMenus = [
    {
      text: "Folder",
      icon: "mozart-icons m-043_icon-folder moz-treelist-icon moz-treelist-folder-icon",
    },
    {
      text: "Files",
      icon: "mozart-icons m-031_file-icon moz-treelist-icon moz-treelist-file-icon",
    },
  ];

  constructor() {
    super();
  }

  public get dataSource(): object {
    return {
      key: "path",
      load: () => {
        const list: FileSystem[] = [];
        this.makeTreeListItem(list, this.items);
        return list;
      },
      update: async (key: string, values: any) => {
        const { item } = this.findItemByKey(key, this.items);
        if (!item) return;
        Object.assign(item, values);
      },
      remove: async (key: string) => {
        const { item, parents } = this.findItemByKey(key, this.items);
        if (!item || !parents) return;
        if (item.isServer) {
          if (item.isClient && item.isFile) {
            if (!this.isServerRemove) {
              item.file = undefined;
              item.client = false;
              item.calcLastModified();
              item.calcSize();
              return;
            }
          }
          this.$emit("server-remove", parents, item);
        }
        parents.splice(parents.indexOf(item), 1);
        const allFiles = this.findAllFiles(item);
        allFiles.forEach(file => this.files.splice(this.files.indexOf(file), 1));
      },
    };
  }

  @Watch("items", { deep: true })
  public onChangeItems(newVal: FileSystem[]) {
    this.$emit("items-changed", newVal);
  }

  @Watch("files", { deep: true })
  public onChangeFiles(newVal: FileSystem[]) {
    this.$emit("files-changed", newVal);
  }

  @Watch("inputs", { immediate: true })
  public onChangeInputs(newVal: IFileInfo[]) {
    if (newVal && newVal.length > 0) {
      this.items = [];
      this.files = [];
      newVal.forEach((file: IFileInfo) => {
        file.name = this.getSimpleFilePath(file.name, "\\");
        file.name.split("/").reduce(
          (parents: FileSystem, name: string) => {
            const path = parents.path ? `${parents.path}/${name}` : name;
            const fparents = parents.children?.find(x => x.name === name);
            if (!fparents) {
              if (path === file.name) {
                const fs = new FileSystem({
                  fileInfo: file,
                  name,
                  path,
                  server: true,
                });
                this.files.push(fs);
                parents.children?.push(fs);
              } else {
                const item = new FileSystem({
                  name,
                  path,
                  server: true,
                  children: [],
                });
                parents.children?.push(item);
                parents = item;
              }
            } else {
              parents = fparents;
            }
            return parents;
          },
          new FileSystem({
            name: "root",
            path: "",
            children: this.items,
          }),
        );
      });
      setTimeout(() => this.refreshFileTree(), 50);
    }
  }

  public makeTreeListItem(result: FileSystem[], items: FileSystem[], parentPath?: string) {
    items.forEach(item => {
      item.parentPath = parentPath;
      result.push(item);
      if (item.children) {
        this.makeTreeListItem(result, item.children, item.path);
      }
    });
  }

  public getNameHeaderCellTemplate(
    cellElement: HTMLElement,
    cellInfo: {
      component?: DxTreeList;
      columnIndex?: number;
      column?: any;
    },
  ) {
    const row = cellElement.parentElement?.parentElement;
    if (row) {
      const text = findElement(".dx-treelist-text-content", {
        parents: row.firstChild as HTMLElement,
      });
      if (text) {
        text.innerHTML = this.$t("Name") as string;
      }
      const selectAll = findElement(".dx-treelist-select-all", {
        parents: row,
      });
      if (!selectAll) return;
      const checkBox = findElement(".dx-select-checkbox", {
        parents: selectAll,
      });
      if (checkBox) {
        const td = document.createElement("td");
        td.className = "dx-treelist-select-all";
        td.appendChild(checkBox);
        row.insertBefore(td, row.firstChild);
      }
    }
  }

  public getNameCellTemplate(
    cellElement: HTMLElement,
    cellInfo: {
      data?: any;
      component?: DxTreeList;
      value?: any;
      oldValue?: any;
      displayValue?: any;
      text?: string;
      columnIndex?: number;
      rowIndex?: number;
      column?: any;
      row?: any;
      rowType?: string;
      watch?: Function;
    },
  ) {
    const iconContainer = findElement(".dx-treelist-icon-container", {
      parents: cellElement.parentElement,
    });

    if (iconContainer) {
      const row = cellElement.parentElement?.parentElement;
      const checkBox = findElement(".dx-select-checkbox", {
        parents: iconContainer,
      });
      if (row && checkBox) {
        const td = document.createElement("td");
        td.appendChild(checkBox);
        row.insertBefore(td, row.firstChild);
      }

      const emptySpace = findElement(".dx-treelist-empty-space", {
        parents: iconContainer,
        last: true,
      });
      if (emptySpace) {
        if (cellInfo.data.isFolder) {
          if (cellInfo.row.isExpanded) {
            emptySpace.classList.add("folder-open");
          } else {
            emptySpace.classList.add("folder-close");
          }
        } else {
          emptySpace.classList.add("file");
        }
      }
    }

    cellElement.innerHTML = `<div class="dx-treelist-text-content">${cellInfo.text}</div>`;
  }

  public allowUpdating(params: { component: any; row: { data: FileSystem } }) {
    if (!this.rename) return false;
    if (params.row.data.isServer) return true;
  }

  public allowDeleting(params: { component: any; row: { data: FileSystem } }) {
    if (!params.row.data.isClient && params.row.data.isServer && !this.isServerRemove) return false;
    return this.remove;
  }

  public allowAddItems(params: { component: any; row: { data: FileSystem } }) {
    if (!this.upload) return false;
    return params.row.data.isFolder && this.directory;
  }

  private refreshFileTree() {
    this.items.forEach(item => {
      item.calcSize();
      item.calcLastModified();
    });
    const instance = (this.$refs.treelist as DxTreeList).instance;
    if (instance) instance.refresh();
  }

  private getSimpleFilePath = (fileName: string, delimiter: string): string => {
    fileName = fileName.replaceAll(delimiter, "/");
    return fileName;
  };

  private findItemByKey(
    key: string,
    items: FileSystem[],
  ): { item: FileSystem | null; parents: FileSystem[] | null } {
    if (!key) return { item: null, parents: null };
    if (items.length === 0) return { item: null, parents: null };
    for (const item of items) {
      if (item.path === key) {
        return { item, parents: items };
      } else {
        if (item.children && item.children.length > 0) {
          const fitem = this.findItemByKey(key, item.children);
          if (fitem.item) {
            return fitem;
          } else {
            continue;
          }
        }
      }
    }
    return { item: null, parents: null };
  }

  private findAllFiles(key: string | FileSystem): FileSystem[] {
    const results: FileSystem[] = [];
    let fs: FileSystem | null;
    if (typeof key === "string") {
      const { item } = this.findItemByKey(key, this.items);
      fs = item;
    } else {
      fs = key;
    }
    if (!fs) return results;

    if (fs.isFile) {
      results.push(fs);
    } else {
      if (fs.children && fs.children.length > 0) {
        fs.children.forEach(c => results.push(...this.findAllFiles(c)));
      }
    }
    return results;
  }

  private getFileTree(parents: FileSystem, item: any, path: string = "") {
    if (item.isFile) {
      item.file((file: File) => {
        path = path ? `${path}/${file.name}` : file.name;
        const fitem = parents.children?.find(x => x.name === file.name);
        if (!fitem) {
          const fs = new FileSystem({
            file,
            name: file.name,
            path,
            client: true,
          });
          this.files.push(fs);
          parents.children?.push(fs);
        } else {
          fitem.client = true;
          fitem.file = file;
        }
      });
    } else if (item.isDirectory) {
      path = path ? `${path}/${item.name}` : item.name;
      let dir = parents.children?.find(x => x.name === item.name);
      if (!dir) {
        dir = new FileSystem({
          name: item.name,
          path,
          client: true,
          children: [],
        });
        parents.children?.push(dir);
      } else {
        dir.client = true;
      }
      const dirReader = item.createReader();
      dirReader.readEntries((entries: any[]) => {
        entries.forEach(entry => {
          this.getFileTree(dir!, entry, path);
        });
      });
    }
  }

  public onDragOver(event: any) {
    if (!this.upload) return;
    event.stopPropagation();
    event.preventDefault();
    const dropZone = findElement(`#${this.dropZoneId}`);
    if (dropZone) {
      dropZone.classList.add("moz-upload-drop-zone-state-hover");
    }
    event.dataTransfer.dropEffect = "copy";
  }

  public onDragLeave(event: any) {
    if (!this.upload) return;
    event.stopPropagation();
    event.preventDefault();
    const dropZone = findElement(`#${this.dropZoneId}`);
    if (dropZone) {
      dropZone.classList.remove("moz-upload-drop-zone-state-hover");
    }
  }

  public onDrop(event: any) {
    if (!this.upload) return;
    event.stopPropagation();
    event.preventDefault();
    const dropZone = findElement(`#${this.dropZoneId}`);
    if (dropZone) {
      dropZone.classList.remove("moz-upload-drop-zone-state-hover");
    }
    if (!this.multiple && event.dataTransfer.items.length > 1) return;

    for (const item of event.dataTransfer.items) {
      const entry = item.webkitGetAsEntry();
      if (!this.directory && entry.isDirectory) continue;
      if (entry) {
        this.getFileTree(
          new FileSystem({
            name: "root",
            path: "",
            children: this.items,
          }),
          entry,
        );
      }
    }
    setTimeout(() => this.refreshFileTree(), 50);
  }

  public onFilesChange(event: any, key?: string) {
    const { item } = this.findItemByKey(key || "", this.items);
    const pathPrefix = key ? `${key}/` : "";
    const items: FileSystem[] = item && item.children ? item.children : this.items;
    for (const file of event.target.files) {
      const fitem = items.find(x => x.name === file.name);
      if (!fitem) {
        const fs = new FileSystem({
          file,
          name: file.name,
          path: `${pathPrefix}${file.name}`,
          client: true,
        });
        this.files.push(fs);
        items.push(fs);
      } else {
        fitem.client = true;
        fitem.file = file;
      }
    }
    this.refreshFileTree();
  }

  public onDirsChange(event: any, key?: string) {
    const { item } = this.findItemByKey(key || "", this.items);
    const pathPrefix = key ? `${key}/` : "";
    const items: FileSystem[] = item && item.children ? item.children : this.items;
    for (const file of event.target.files) {
      file.webkitRelativePath.split("/").reduce(
        (parents: FileSystem, name: string) => {
          const path = parents.path ? `${parents.path}/${name}` : name;
          const fparents = parents.children?.find(x => x.name === name);
          if (!fparents) {
            if (path === file.webkitRelativePath) {
              const fs = new FileSystem({
                file,
                name,
                path: `${pathPrefix}${path}`,
                client: true,
              });
              this.files.push(fs);
              parents.children?.push(fs);
            } else {
              const item = new FileSystem({
                name,
                path: `${pathPrefix}${path}`,
                client: true,
                children: [],
              });
              parents.children?.push(item);
              parents = item;
            }
          } else {
            parents = fparents;
            parents.client = true;
            if (path === file.webkitRelativePath) {
              parents.file = file;
            }
          }
          return parents;
        },
        new FileSystem({
          name: "root",
          path: "",
          children: items,
        }),
      );
    }
    this.refreshFileTree();
  }

  public onFocuedRowChanged(event: any) {
    if (!this.focus) return;
    this.$emit("focused", event.row.data);
  }

  public onSelectionChanged(event: { selectedRowsData: FileSystem[] }) {
    this.selectedFiles = event.selectedRowsData.filter(fs => fs.isServer && fs.isFile);
  }

  public onUploadMenuClick(event: any) {
    switch (event.itemData.text) {
      case "Files":
        document.getElementById(this.fileId)?.click();
        break;
      case "Folder":
        document.getElementById(this.dirId)?.click();
        break;
      default:
        break;
    }
  }

  public onFileUploadBtnClick(event: any) {
    document.getElementById(this.fileId)?.click();
  }
}
</script>
