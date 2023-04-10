import { get, set, camelCase } from "lodash";
import { Module as Mod } from "vuex";
import { VuexModule, Mutation } from "vuex-module-decorators";
import { IProperty } from "mozart-common";
import { IFilter } from "mozart-dev";

export interface IInputOption {
  // combo
  items?: any[];
  // combo, file
  multiple?: boolean;
  // date
  min?: string;
  // date
  max?: string;
}

export interface IEditParams {
  result: boolean;
  add?: boolean;
  keepAdd?: boolean;
  data: any;
}

export interface IResult {
  readonly [index: string]: any;
  count: number;
  obj?: string;
  msg?: string;
  systemId?: string;
}

export interface IComboParams {
  optional: boolean;
  propkey?: string;
  propname?: string;
  whereprop?: string;
  wherevalue?: string;
}

export interface IComboItem {
  value: any;
  text: any;
  tag?: any;
}

export interface IBaseState<T extends object> {
  type: string;
  keys: any;

  addItems: T[];
  updateItems: T[];
  removeItems: T[];
  itemEdit: T | null;
  prevItemEdit: T | null;
  filters: IFilter[];
  disables: string[];
  hides: string[];
  shows: string[];

  // Edit Dialog
  createEdit: boolean;
  openEdit: boolean;

  // Delete Dialog
  openDel: boolean;

  // State
  isLoading: boolean;
  error: any;
}

export abstract class BaseStore<T extends object> extends VuexModule implements IBaseState<T> {
  public type: string;
  public name: string;
  public keys: IProperty[];
  public keyCol: string;
  protected items: T[] = [];
  public addItems: T[] = [];
  public updateItems: T[] = [];
  public removeItems: T[] = [];
  public isLoading: boolean = false;
  public error: any = null;
  public createEdit: boolean = true;
  public openEdit: boolean = false;
  public itemEdit: T | null = null;
  public prevItemEdit: T | null = null;
  public filters: IFilter[] = [];
  public disables: string[] = [];
  public hides: string[] = [];
  public shows: string[] = [];

  public openDel: boolean = false;

  constructor(type: string, keys: any[], keyCol: string, module: Mod<ThisType<{}>, any>) {
    super(module);

    this.type = type;
    this.name = camelCase(type);
    this.keys = keys.map((key: IProperty) => {
      set(key, "key", key.name === keyCol);
      return key;
    });
    this.keyCol = keyCol;
  }

  @Mutation
  protected changeOpenEdit(value: boolean) {
    this.openEdit = value;
  }

  @Mutation
  protected changeItemEdit(value?: T) {
    if (this.itemEdit) {
      this.prevItemEdit = this.itemEdit;
    }
    this.itemEdit = value || null;
  }

  @Mutation
  protected changeOpenDel(value: boolean) {
    this.openDel = value;
  }

  @Mutation
  protected initLoad() {
    this.items = [];
    this.isLoading = true;
    this.error = null;
  }

  @Mutation
  protected setData(data: T[]) {
    this.items = data;
    this.isLoading = false;
    this.error = null;
  }

  @Mutation
  protected setError(error: any) {
    this.items = [];
    this.isLoading = false;
    this.error = error;
  }

  @Mutation
  protected toggleLoading() {
    this.isLoading = !this.isLoading;
  }

  @Mutation
  protected changeFilters(value?: IFilter[]) {
    if (value) {
      this.filters = value;
    } else {
      this.filters = [];
    }
  }

  @Mutation
  protected insert(item: any) {
    this.items.push(item);
  }

  @Mutation
  protected update(item: any) {
    const fitem = this.items.find((r: T) => {
      const oldKey = get(r, this.keyCol);
      const newKey = get(item, this.keyCol);
      return oldKey && newKey && oldKey === newKey;
    });
    if (fitem) {
      this.items.splice(this.items.indexOf(fitem), 1);
    }
    this.items.push(item);
  }

  @Mutation
  protected delete(item: any) {
    const fitem = this.items.find((r: T) => {
      const oldKey = get(r, this.keyCol);
      const newKey = get(item, this.keyCol);
      return oldKey && newKey && oldKey === newKey;
    });
    if (fitem) {
      this.items.splice(this.items.indexOf(fitem), 1);
    }
  }

  @Mutation
  protected changeItemEditEmpty() {
    this.prevItemEdit = this.itemEdit;
    this.itemEdit = null;
  }

  @Mutation
  protected changeDisables(value: string[]) {
    this.disables = value;
  }

  @Mutation
  protected changeHides(value: string[]) {
    this.hides = value;
  }

  @Mutation
  protected changeShows(value: string[]) {
    this.shows = value;
  }

  public abstract loadData(param?: any): Promise<void>;

  // public abstract saveData(): Promise<void>;

  public abstract addData(obj: T): Promise<boolean>;

  public abstract addDataByExcel(file: File): Promise<IResult>;

  public abstract modifyData(obj: T): Promise<boolean>;

  public abstract removeData(obj: T): Promise<boolean>;

  public abstract setOpenEdit(value: boolean): void;

  public abstract setOpenDel(value: boolean): void;

  public abstract setItemEdit(value?: T): void;

  public abstract setItemEditEmpty(): void;

  public abstract setFilters(value?: IFilter[]): void;

  public abstract getNewItem(): T;

  public abstract addItem(params: { item: T; idx?: number }): void;

  public abstract removeItem(item: T | number): void;

  public abstract getComboItems(params: IComboParams): Promise<IComboItem[]>;

  public abstract setDisables(params: { value: string[] }): void;

  public abstract setHides(params: { value: string[] }): void;

  public abstract setShows(params: { value: string[] }): void;

  public abstract get getItems(): T[];

  public abstract get getDelId(): string;
}
