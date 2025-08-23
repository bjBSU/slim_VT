import { Injectable } from '@angular/core';
import { ModuleNode } from '../services/process-data.service';
import { BehaviorSubject, Timestamp } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimelineStoreService {
  private entries : ModuleNode[][] = [];
  private entries$ = new BehaviorSubject<ModuleNode[][]>([]);

  add(entry: ModuleNode[]){
    this.entries.push(entry);
    this.entries$.next([...this.entries]);
  }

  //input is number so before calling this method make sure this is taken into account
  getEntriesAt(time: number): ModuleNode[]{
    // const sliderIso = new Date(time).toISOString().split('.')[0].slice(0);
    // console.log("new time of the selectedTime number:", sliderIso);
    // return this.entries.flat().filter(e => 
    //   e.timestamp!.split('.')[0].slice(0) == sliderIso).map(e => ({...e}));
    
    return this.entries.flat().filter(e => {
      const entryTime = new Date(e.timestamp!).getTime();
      const temp = Math.abs(entryTime - time);
      return temp <= 20;
    }).map(e => ({...e}));
  }

  getAll$(){
    return this.entries$.asObservable();
  }
}
