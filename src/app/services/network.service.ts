import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export type NetworkStatus = 'online' | 'offline';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private status = new BehaviorSubject<NetworkStatus>(navigator.onLine ? 'online' : 'offline');
  status$ = this.status.asObservable();

  constructor(private ngZone: NgZone) {
    this.initNetworkMonitor();
  }

  get isOnline(): boolean {
    return this.status.value === 'online';
  }

  private initNetworkMonitor(): void {
    this.ngZone.runOutsideAngular(() => {
      const online$ = fromEvent<Event>(window, 'online').pipe(map(() => 'online' as NetworkStatus));
      const offline$ = fromEvent<Event>(window, 'offline').pipe(map(() => 'offline' as NetworkStatus));

      merge(online$, offline$).pipe(distinctUntilChanged()).subscribe((status: NetworkStatus) => {
        this.ngZone.run(() => {
          this.status.next(status);
        });
      });
    });
  }
}
