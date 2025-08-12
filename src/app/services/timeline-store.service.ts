import { Injectable } from '@angular/core';
import { ModuleNode } from '../services/process-data.service';
import { BehaviorSubject, Timestamp } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimelineStoreService {
  private entries : ModuleNode[] = [];
  private entries$ = new BehaviorSubject<ModuleNode[]>([]);

  add(entry: ModuleNode){
    this.entries.push(entry);
    this.entries$.next([...this.entries]);
  }

  //input is number so before calling this method make sure this is taken into account
  getEntriesAt(time: number): ModuleNode[]{
    const sliderIso = new Date(time).toISOString().split('.')[0] + 'Z';

    return this.entries.filter( e => {
      const entryIso = e.timestamp!.split('.')[0] + 'Z';
      return entryIso === sliderIso;
    })
  }

  getAll$(){
    return this.entries$.asObservable();
  }
}
