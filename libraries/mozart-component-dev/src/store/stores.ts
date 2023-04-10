import { get, set, upperFirst, camelCase } from "lodash";
import { BaseStore } from "./modules/baseStore";

export class Stores {
  private static _default: Stores;

  private stores: object = {};

  public static get default(): Stores {
    if (!Stores._default) {
      Stores._default = new Stores();
    }
    return Stores._default;
  }

  public constructor() {
    //
  }

  public setStore(name: string, store: BaseStore<any>) {
    set(this.stores, upperFirst(camelCase(name)), store);
  }

  public getStore(name: string): BaseStore<any> | undefined {
    return get(this.stores, upperFirst(camelCase(name)));
  }
}

export default Stores.default;
