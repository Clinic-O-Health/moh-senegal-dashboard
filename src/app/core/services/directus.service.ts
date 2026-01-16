import { Injectable } from '@angular/core';
import { authentication, createDirectus, realtime, rest } from '@directus/sdk';
import { environment } from '@environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class DirectusService {
  storage = new LocalStorage();
  public readonly directus = createDirectus(environment.apiUrl)
    .with(rest())
    .with(authentication())
    .with(realtime());
}

class LocalStorage {
  get() {
    return JSON.parse(localStorage.getItem('directus-data') ?? '');
  }
  set(data : any) {
    localStorage.setItem('directus-data', JSON.stringify(data));
  }
}
