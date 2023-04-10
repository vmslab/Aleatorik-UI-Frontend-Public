import store from "@/store";
import { Module as Mod } from "vuex";
import { Action, getModule, Module, Mutation } from "vuex-module-decorators";
import { Add, Get, Modify, Remove, Save, Excel } from "@/api/mainService";
import { instancing } from "mozart-common";
import { BaseStore, IComboParams, IComboItem, getCboItems } from "mozart-component-dev";
import Entity from "../../generated/entity";
import { ITodo, IResult, IFilter } from "../../generated/types";
import { parseData, parseDatas } from "@/utils/request";

@Module({ dynamic: true, namespaced: true, store, name: "todoStore" })
class TodoStore extends BaseStore<ITodo> {
  constructor(module: Mod<ThisType<{}>, any>) {
    super("Todo", Entity.entities.Todo!.properties, "ID", module);
  }

  @Mutation
  protected changeItemEdit(value?: ITodo) {
    if (!value) {
      value = instancing<ITodo>(this.keys);
    }

    this.createEdit = value.TITLE === "";
    super.changeItemEdit(value);
  }

  @Action({ rawError: true })
  public async loadData(forceUpdate?: boolean) {
    try {
      if (forceUpdate || this.items.length === 0) {
        this.initLoad();
        const result = await Get(this.type);
        this.setData(JSON.parse(result.data));
      }
    } catch (error) {
      this.setError(error);
    }
  }

  @Action({ rawError: true })
  public async addData(obj: ITodo): Promise<boolean> {
    this.toggleLoading();
    try {
      const result = await Add(this.type, { obj: parseData(obj, this.keys) });
      const res: IResult = JSON.parse(result.data);
      if (res && res.count > 0 && res.obj) {
        this.update(res.obj);
      }
      return res.count > 0;
    } catch (error) {
      console.log(error);
    } finally {
      this.toggleLoading();
    }
    return false;
  }

  @Action({ rawError: true })
  public async addDataByExcel(file: File): Promise<IResult> {
    this.toggleLoading();
    try {
      const result = await Excel(`${this.type}`, file);
      const res: IResult = JSON.parse(result.data);
      if (res && res.count > 0 && res.obj) {
        this.update(res.obj);
      }
      return res;
    } catch (error) {
      console.log(error);
    } finally {
      this.toggleLoading();
    }
    return { count: 0 };
  }

  @Action({ rawError: true })
  public async modifyData(obj: ITodo): Promise<boolean> {
    this.toggleLoading();
    try {
      const result = await Modify(this.type, { obj: parseData(obj, this.keys) });
      const res: IResult = JSON.parse(result.data);
      if (res && res.count > 0 && res.obj) {
        this.update(res.obj);
      }
      return res.count > 0;
    } catch (error) {
      console.log(error);
    } finally {
      this.toggleLoading();
    }
    return false;
  }

  @Action({ rawError: true })
  public async removeData(obj: ITodo): Promise<boolean> {
    this.toggleLoading();
    try {
      const result = await Remove(this.type, { obj: parseData(obj, this.keys) });
      const res: IResult = JSON.parse(result.data);
      if (res && res.count > 0 && res.obj) {
        this.delete(res.obj);
      }
      return res.count > 0;
    } catch (error) {
      console.log(error);
    } finally {
      this.toggleLoading();
    }
    return false;
  }

  @Action({ rawError: true })
  public async saveData(obj: {
    addData: ITodo[];
    modifyData: ITodo[];
    removeData: ITodo[];
  }): Promise<boolean> {
    this.toggleLoading();
    try {
      const result = await Save(this.type, {
        addData: parseDatas(obj.addData, this.keys),
        modifyData: parseDatas(obj.modifyData, this.keys),
        removeData: parseDatas(obj.removeData, this.keys),
      });
      const res: IResult = JSON.parse(result.data);
      return res.count > 0;
    } catch (error) {
      console.log(error);
    } finally {
      this.toggleLoading();
    }
    return false;
  }

  @Action
  public setOpenEdit(value: boolean) {
    this.changeOpenEdit(value);
  }

  @Action
  public setItemEdit(value?: ITodo) {
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
  public getNewItem(): ITodo {
    return instancing<ITodo>(this.keys);
  }

  @Action
  public async getComboItems(params: IComboParams): Promise<IComboItem[]> {
    if (this.items.length === 0) {
      await this.loadData();
    }

    return await getCboItems<ITodo>(this.items, params);
  }

  @Action
  public async addItem(params: { item: ITodo; idx?: number }) {
    if (params.idx) {
      this.items.splice(params.idx, 0, params.item);
    } else {
      this.items.push(params.item);
    }
  }

  @Action
  public removeItem(item: ITodo | number) {
    if (typeof item === "number") {
      this.items.splice(item as number, 1);
    } else {
      this.items.splice(this.items.indexOf(item as ITodo), 1);
    }
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

  public get getItems(): ITodo[] {
    if (this.filters && this.filters.length > 0) {
      return this.items.filter((item: ITodo) => {
        let flag = true;
        for (const filter of this.filters) {
          if (item[filter.col!] !== filter.val!) {
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
      return this.itemEdit.TITLE;
    }
    return "";
  }
}

export const TodoModule = getModule(TodoStore);
