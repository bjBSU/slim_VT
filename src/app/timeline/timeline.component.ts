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

  // minTime :number = Date.now();
  // maxTime :number = Date.now();
  minTime :number = 0;
  maxTime :number = Date.now();

  // selectedTime :number | null= null;
  selectedTime :number =0;

  sliderActive = false;
  //printTime :string | null=null;
  printTime :string = "Now";

  private sub!: Subscription;
  targetTimestamp: number | undefined;

  constructor(private processDataService: ProcessDataService, private TimelineStoreService: TimelineStoreService){}
  
  ngOnInit(): void {
    //listen to incoming data and push to store
    this.sub = this.processDataService.layers$.subscribe(layers => {
      layers.forEach(entry => {
        this.TimelineStoreService.add(entry);

        this.maxTime = Date.now();//keep maxtime for slider

        //this.selectedTime = this.maxTime;
        // if(this.selectedTime === 120 || this.selectedTime === 0){
        //   this.filteredLayers = this.groupByLayers(this.TimelineStoreService.getEntriesAt(this.maxTime));
        // }
      });
    });
  }
  
  //slider change
  // onTimeChange(){
  //   this.sliderActive = true;
  //   this.goLive = false;

  //   if(this.selectedTime){
  //     this.filteredLayers = this.groupByLayers(this.TimelineStoreService.getEntriesAt(this.selectedTime!));
  //     this.tempLayers = this.filteredLayers;
  //   }
    
  //   this.printTime = new Date(this.selectedTime!).toISOString().split('.')[0]; 
  // }

 onTimeChange() {
  const now = Date.now();
  const offsetMs = this.selectedTime * 1000; // slider is in seconds → ms
  const targetTime = now - offsetMs;
  this.targetTimestamp = targetTime;

  // Save or use targetTime to filter your entries
  this.filteredLayers = this.groupByLayers(this.TimelineStoreService.getEntriesAt(this.targetTimestamp!));
  console.log("targetTimestamp: ", this.targetTimestamp);
  console.log("selectedTime :", this.selectedTime);

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

  ngOnDestroy(){
    if(this.sub) this.sub.unsubscribe();
  }
}

