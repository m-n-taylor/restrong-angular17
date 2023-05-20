import { Injectable } from '@angular/core';

@Injectable()
export class TransferState {
  private _map = new Map<string, any>();

  constructor() {}

  keys() {
    return this._map.keys();
  }

  get(key: string): any {
    return this._map.get(key);
  }

  set(key: string, value: any): Map<string, any> {
    return this._map.set(key, value);
  }

  toJson(): any {
    const obj = {};
    Array.from(this.keys())
      .forEach(key => {
        obj[key] = this.get(key);
      });
    return obj;
  }

  initialize(obj: any): void {
    Object.keys(obj)
      .forEach(key => {
        this.set(key, obj[key]);
      });
  }

  inject(): void {}
}

// update: 2025-07-31T20:24:24.665989

// update: 2025-08-01T01:05:53.509106
