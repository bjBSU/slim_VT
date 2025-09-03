import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { TangleLayoutService } from '../services/tangle-layout.service';
import { ModuleNode, ProcessDataService } from '../services/process-data.service'; 
import { Observable, Subscription } from 'rxjs';
import { TimelineStoreService } from '../services/timeline-store.service';


@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {
  @Input() filteredLayers: ModuleNode[][] = [];
  tempLayers : ModuleNode[][] = [];

  minTime :number = 0;
  maxTime :number = Date.now();
  selectedTime :number =0;

  sliderActive = false;
  printTime :string = "Now";

  private sub!: Subscription;
  targetTimestamp: number | undefined;

  goLiveMode: boolean = true;

  constructor(private processDataService: ProcessDataService, private TimelineStoreService: TimelineStoreService){}
  
  ngOnInit(): void {
    //listen to incoming data and push to store
    this.sub = this.processDataService.layers$.subscribe(layers => {
      layers.forEach(entry => {
        this.TimelineStoreService.add(entry);

        this.filteredLayers = this.groupByLayers(this.TimelineStoreService.getEntriesAt(Date.now()));
        if (this.goLiveMode) {
          this.tempLayers = this.filteredLayers;
        }
      });
    });
  }

  /**
   * Once the slider has moved that is detected and the
   * new time it lands on is returned and processed.
   */
  onTimeChange() {
    this.goLiveMode = false;
    
    const now = Date.now();
    const offsetMs = this.selectedTime * 1000; 
    const targetTime = now - offsetMs;
    this.targetTimestamp = targetTime;

    // Save or use targetTime to filter your entries
    this.filteredLayers = this.groupByLayers(this.TimelineStoreService.getEntriesAt(this.targetTimestamp!));
    this.tempLayers = this.filteredLayers;
    
    // Pretty print
    if (this.selectedTime === 120) {
      this.printTime = 'Now';
    } else if (this.selectedTime < 60) {
      this.printTime = `about ${this.selectedTime} seconds ago`;
    } else {
      const minutes = Math.floor(this.selectedTime / 60);
      const seconds = this.selectedTime % 60;
      this.printTime = seconds === 0
        ? `about ${minutes} min ago`
        : `about ${minutes} min ${seconds} sec ago`;
    }
  }

  /**
   * GoLive tells the display to show all of the most recent incoming 
   * json data objects
   */
  goLive() {
    this.goLiveMode = true;
    this.selectedTime = 0;
    this.printTime = "Now";
    this.tempLayers = this.filteredLayers;
  }

  /**
   * groupByLayers takes all of the entries and finds the 
   * ones that they best corespond with based on their level
   * @param entries 
   * @returns 
   */
  private groupByLayers(entries:ModuleNode[]): ModuleNode[][]{
    const map: {[layer:number]: ModuleNode[]} = {};
    entries.forEach(e => {
      if(e.level == null)return;
      const layerIndex = Number(e.level);
      if(map[layerIndex]){
        map[layerIndex].push(e);
      }else{
        map[layerIndex] = [e];
      }
    });
    return Object.values(map).map(layer => layer.map(e => ({...e})));
  }

  /**
   * Unsubscribes to the incoming data
   */
  ngOnDestroy(){
    if(this.sub) this.sub.unsubscribe();
  }
}

