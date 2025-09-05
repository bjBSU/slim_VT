import { Injectable } from '@angular/core';
import { ModuleNode } from '../services/process-data.service';
import { BehaviorSubject, Timestamp } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimelineStoreService {
  private entries : ModuleNode[][] = [];//creates a sort of array of arrays
  private entries$ = new BehaviorSubject<ModuleNode[][]>([]);//cumulative collection of entries
  
  /**
   * Adds incoming entries
   * @param entry 
   */
  add(entry: ModuleNode[]){
    this.entries.push(entry);
    this.entries$.next([...this.entries]);
  }

  
  /**
   * Filters through the recorded entries and grabs the ones with the 
   * adjusted timestamp closest to time
   * @param time 
   * @returns 
   */
  getEntriesAt(time: number): ModuleNode[]{    
    return this.entries.flat().filter(e => {
      const entryTime = new Date(e.timestamp!).getTime();
      const temp = Math.abs(entryTime - time);
      return temp <= 1000 || temp >= 1000;
    }).map(e => ({...e}));
  }

/**
 * Returns all entries. Used for testing.
 * @returns 
 */
  getAll$(){
    return this.entries$.asObservable();
  }
}
