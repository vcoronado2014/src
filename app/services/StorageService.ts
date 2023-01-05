import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    //await this._storage.defineDriver()
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Create and expose methods that users of this service can
  // call, for example:
  public set(key: string, value: any, uspId: string, fecha: string) {
    let newKey = key + '-' + uspId;
    if (value.RespuestaBase != null){
      value.RespuestaBase.UspId = uspId;
      value.RespuestaBase.FechaActualizacion = fecha;
    }
    else{
      if (key == 'dataVacunas'){
        value = {
          Vacunas: value,
          RespuestaBase : {
            UspId: uspId,
            FechaActualizacion: fecha
          }
        };
      }
      else{
        value.RespuestaBase = {
          UspId: uspId,
          FechaActualizacion: fecha
        }
      }

    }

    this._storage?.set(newKey, value);
  }

  public get(key: string, uspId: string) {
    let newKey = key + '-' + uspId;
    return this.storage.get(newKey);
  }
}