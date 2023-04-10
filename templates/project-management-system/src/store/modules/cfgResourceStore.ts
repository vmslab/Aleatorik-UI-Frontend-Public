import store from "@/store";
import { Module as Mod } from "vuex";
import { Action, Module, Mutation, MutationAction, VuexModule, getModule } from "vuex-module-decorators";
import { BaseStore, IComboItem, IComboParams } from "mozart-component-dev";
import { IResult } from "mozart-component-dev/src/store/modules/baseStore";
import { IFilter } from "mozart-dev";
import { ICfgResourceMaster } from "@/generated/types";
import { Add, Get, Modify, Remove, RemoveBatch } from "@/api/mainService";
import Entity from "@/generated/entity";
import { parseData, parseDatas } from "@/utils/request";
import { instancing } from "mozart-common";

@Module({ dynamic: true, namespaced: true, store, name: "resoureStore" })
class CfgResourceStore extends BaseStore<ICfgResourceMaster> {
  constructor(module: Mod<ThisType<{}>, any>) {
    super("CfgResourceMaster", Entity.entities.CfgResourceMaster!.properties, "CfgResourceMaster", module);
  }

  @Mutation
  protected changeItemEdit(value?: ICfgResourceMaster) {
    if (!value) {
      value = instancing<ICfgResourceMaster>(this.keys);
    }
    this.createEdit = value.RESOURCE_ID === '';
    super.changeItemEdit(value);
  } 

  @Action({ rawError: true })
  public async loadData(param?: any): Promise<void> {
    console.log("loadData Start")
    try {
      this.initLoad();
      console.log("loadData Get")
      const result = await Get("CfgResourceMaster");
      console.log("loadData Get End")
      this.setData(JSON.parse(result.data));
      console.log("loadData SetData End")
    } catch (error) {
      console.log("loadData Error", error)
      this.setError(error);
    }
    console.log("loadData End")
  }

  @Action({ rawError: true })
  public async addData(obj: ICfgResourceMaster): Promise<boolean> {
    try {
      this.toggleLoading();
      const result = await Add(this.type, { obj: parseData(obj, this.keys) });
      const res: IResult = JSON.parse(result.data);
      if (res && res.count > 0 && res.obj) this.update(res.obj);
      return res.count > 0;
    } catch (error) {
      console.log(error);
    } finally {
      this.toggleLoading();
    }
    return false;
  }

  @Action({ rawError: true })
  public addDataByExcel(file: File): Promise<IResult> {
    throw new Error("Method not implemented.");
  }

  @Action({ rawError: true })
  public async modifyData(obj: ICfgResourceMaster): Promise<boolean> {
    try {
      this.toggleLoading();
      const result = await Modify(this.type, { obj: parseData(obj, this.keys) });
      const res: IResult = JSON.parse(result.data);
      if (res && res.count > 0 && res.obj) this.update(res.obj);
      return res.count > 0;
    } catch (error) {
      console.log(error);
    } finally {
      this.toggleLoading();
    }
    return false;
  }

  @Action({ rawError: true })
  public async removeData(obj: ICfgResourceMaster): Promise<boolean> {
    try {
      this.toggleLoading();
      const result = await Remove(this.type, { obj: parseData(obj, this.keys) });
      const res: IResult = JSON.parse(result.data);
      if (res && res.count > 0 && res.obj) this.delete(res.obj);
      return res.count > 0;
    } catch (error) {
      console.log(error);
    } finally {
      this.toggleLoading();
    }
    return false;
  }

  @Action({ rawError: true })
  public setOpenEdit(value: boolean): void {
    this.changeOpenEdit(value);
  }

  @Action({ rawError: true })
  public setOpenDel(value: boolean): void {
    throw new Error("Method not implemented.");
  }

  @Action({ rawError: true })
  public setItemEdit(value?: ICfgResourceMaster): void {
    this.changeItemEdit(value);
  }

  @Action({ rawError: true })
  public setItemEditEmpty(): void {
    throw new Error("Method not implemented.");
  }

  @Action({ rawError: true })
  public setFilters(value?: IFilter[]): void {
    throw new Error("Method not implemented.");
  }

  @Action({ rawError: true })
  public getNewItem(): ICfgResourceMaster {
    return instancing<ICfgResourceMaster>(this.keys);
  }

  @Action({ rawError: true })
  public addItem(params: { item: ICfgResourceMaster; idx?: number | undefined; }): void {
    throw new Error("Method not implemented.");
  }

  @Action({ rawError: true })
  public removeItem(item: number | ICfgResourceMaster): void {
    throw new Error("Method not implemented.");
  }

  @Action({ rawError: true })
  public getComboItems(params: IComboParams): Promise<IComboItem[]> {
    throw new Error("Method not implemented.");
  }

  @Action({ rawError: true })
  public setDisables(params: { value: string[]; }): void {
    throw new Error("Method not implemented.");
  }

  @Action({ rawError: true })
  public setHides(params: { value: string[]; }): void {
    throw new Error("Method not implemented.");
  }

  @Action({ rawError: true })
  public setShows(params: { value: string[]; }): void {
    throw new Error("Method not implemented.");
  }

  public get getItems(): ICfgResourceMaster[] {
    return this.items;
  }

  public get getDelId(): string {
    throw new Error("Method not implemented.");
  }

  /**
   * custom function
   * 
   * 
   * @param obj 
   * @returns 
   */

  @Action({ rawError: true })
  public async removeBatchData(obj: ICfgResourceMaster[]): Promise<boolean> {
    try {
      this.toggleLoading();
      const result = await RemoveBatch(this.type, { removeData: parseDatas(obj, this.keys) });
      const res: IResult = JSON.parse(result.data);
      if (res && res.count > 0 && res.obj) {
        for (let i = 0; i < res.obj.length; i++) {
          this.delete(res.obj[i]);
        }
      };
      return res.count > 0;
    } catch (error) {
      console.log(error);
    } finally {
      this.toggleLoading();
    }
    return false;
  }
}

export const CfgResourceModule = getModule(CfgResourceStore);