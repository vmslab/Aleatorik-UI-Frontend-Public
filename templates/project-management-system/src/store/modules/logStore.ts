import store from "@/store";
import { Module as Mod } from "vuex";
import { Action, getModule, Module, Mutation } from "vuex-module-decorators";
import { Get } from "@/api/mainService";
import { instancing } from "mozart-common";
import { BaseStore, IComboParams, IComboItem } from "mozart-component-dev";
import Entity from "../../generated/entity";
import { ILog, IFilter } from "@/generated/types";
import { parseFilters } from "@/utils/request";
import { IResult } from "mozart-component-dev/src/store/modules/baseStore";

@Module({ dynamic: true, namespaced: true, store, name: "logStore" })
class LogStore extends BaseStore<ILog> {
  constructor(module: Mod<ThisType<{}>, any>) {
    super("Log", Entity.entities.Log!.properties, "LogId", module);
    this.createEdit = false;
  }

  @Mutation
  protected changeItemEdit(value?: ILog) {
    if (!value) {
      value = instancing<ILog>(this.keys);
    }
    this.itemEdit = value;
  }

  @Action({ rawError: true })
  public async loadData(params: any) {
    try {
      this.initLoad();
      const result = await Get(this.type, { option: params }, "post");
      this.setData(JSON.parse(result.data));
    } catch (error) {
      this.setError(error);
    }
  }

  @Action({ rawError: true })
  public async addData(obj: ILog): Promise<boolean> {
    return false;
  }

  @Action({ rawError: true })
  public async modifyData(obj: ILog): Promise<boolean> {
    return false;
  }

  @Action({ rawError: true })
  public async removeData(obj: ILog): Promise<boolean> {
    return false;
  }

  @Action
  public setOpenEdit(value: boolean) {
    this.changeOpenEdit(value);
  }

  @Action
  public setItemEdit(value?: ILog) {
    this.changeItemEdit(value);
  }

  @Action
  public setItemEditEmpty() {
    this.changeItemEditEmpty();
  }

  @Action
  public setOpenDel(value: boolean) {
    this.changeOpenDel(value);
  }

  @Action
  public setFilters(value?: IFilter[]) {
    this.changeFilters(value);
  }

  @Action
  public getNewItem(): ILog {
    return instancing<ILog>(this.keys);
  }

  @Action
  public async getComboItems(params: IComboParams): Promise<IComboItem[]> {
    return [];
  }

  @Action
  public async addItem(params: { item: ILog; idx?: number }) {
    //
  }

  public addDataByExcel(file: File): Promise<IResult> {
    throw new Error("Method not implemented.");
  }

  @Action
  public async removeItem(item: ILog | number) {
    //
  }

  @Action
  public setDisables(params: { value: string[] }) {
    this.changeDisables(params.value);
  }

  @Action
  public setHides(params: { value: string[] }) {
    this.changeHides(params.value);
  }

  @Action
  public setShows(params: { value: string[] }) {
    this.changeShows(params.value);
  }

  public get getItems(): ILog[] {
    if (this.filters && this.filters.length > 0) {
      return this.items.filter((item: ILog) => {
        let flag = true;
        for (const filter of this.filters) {
          if (item[filter.field] !== filter.value) {
            flag = false;
          }
        }
        return flag;
      });
    } else {
      return this.items;
    }
  }

  public get getDelId(): string {
    if (this.itemEdit) {
      return String(this.itemEdit.LogId);
    }
    return "";
  }
}

export const LogModule = getModule(LogStore);
