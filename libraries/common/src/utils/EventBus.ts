import { Subscription, Observable, Observer, Subject } from "rxjs";
import { take } from "rxjs/operators";

export interface ICacheObj<T> {
  [key: string]: any;
  subject: Subject<T>;
  eventName?: string;
  id?: string;
  target?: any;
  targets: any[];
  callback?: (...rest: any[]) => any;
  subscription?: Subscription;
}

export class EventBus {
  private static _default: EventBus;
  private cache: Record<string, ICacheObj<any>> = {};

  static get default(): EventBus {
    if (!EventBus._default) {
      EventBus._default = (globalThis as any)["mozart-event-bus"];
      if (!EventBus._default) {
        EventBus._default = new EventBus();
        (globalThis as any)["mozart-event-bus"] = EventBus._default;
      }
    }
    return EventBus._default;
  }

  on<T>(eventName: string, target?: any): Observable<T> {
    this.createChache<T>(eventName);

    if (target !== undefined) {
      this.cache[eventName].targets.push(target);
    }

    return this.cache[eventName].subject;
  }

  one<T>(eventName: string, target?: any): Observable<T> {
    return this.on<T>(eventName, target).pipe(take(1));
  }

  emit<T>(eventName: string, ...rest: T[]): string {
    this.createChache<T>(eventName);

    if (rest.length === 1) this.cache[eventName].subject.next(rest[0]);
    else this.cache[eventName].subject.next(rest);

    return this.cache[eventName].target;
  }

  has(eventName: string): boolean {
    return !!this.cache[eventName];
  }

  get(eventName: string): any {
    return this.cache[eventName];
  }

  getByTarget(target: any, eventName?: string): Array<ICacheObj<any>> {
    const caches: Array<ICacheObj<any>> = [];

    Object.keys(this.cache).forEach(key => {
      const cache: ICacheObj<any> = this.cache[key];

      if (cache.targets && cache.targets.indexOf(target) > -1) {
        if (eventName) {
          if (eventName === cache.eventName) caches.push(cache);
        } else {
          caches.push(cache);
        }
      }
    });

    return caches;
  }

  off(eventName: string): any {
    if (this.cache[eventName]) {
      Object.keys(this.cache[eventName]).forEach(key => {
        if (key === "targets") this.cache[eventName][key].length = 0;
        delete this.cache[eventName][key];
      });
    }

    delete this.cache[eventName];
  }

  unsubscribe(target: any, eventName?: string) {
    const cache: Array<ICacheObj<any>> = this.getByTarget(target, eventName);

    cache.forEach(c => {
      if (c.subscription) c.subscription.unsubscribe();
    });
  }

  offAllByTarget(target: any) {
    try {
      this.offByTarget(target);
      this.unsubscribe(target);
    } catch (e) {
      console.log(e);
    }
  }

  offByTarget(target: any) {
    Object.keys(this.cache).forEach(key => {
      const cache: ICacheObj<any> = this.cache[key];
      if (cache.targets && cache.targets.indexOf(target)) delete this.cache[key];
    });
  }

  offAll(eventName?: string): void {
    if (!eventName) {
      Object.keys(this.cache).forEach(key => delete this.cache[key]);
    } else {
      delete this.cache[eventName];
    }
  }

  /**
   * create cache at emit time
   * eventName ->  subject
   */
  private createChache<T>(eventName: string): ICacheObj<T> {
    if (!this.cache[eventName]) {
      this.cache[eventName] = {
        id: this.guid(),
        eventName,
        subject: new Subject<T>(),
        targets: [],
      };
    }

    if (!this.cache[eventName].subject) {
      this.cache[eventName].subject = new Subject<T>();
    }

    return this.cache[eventName];
  }

  private guid(): string {
    return "xxxxxx-xxxx-4xxx-yxxx-xxxxxx".replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export default EventBus.default;
