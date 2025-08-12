import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { TangleLayoutService } from '../services/tangle-layout.service';
import { ModuleNode, ProcessDataService } from '../services/process-data.service'; 
import { Observable, Subscription } from 'rxjs';
import { TimelineStoreService } from '../services/timeline-store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {
  @Input() filteredLayers: ModuleNode[][] = [];
  minTime :number = 0;
  maxTime :number = Date.now();
  selectedTime :number | null= null;
  sliderActive = false;

  private sub!: Subscription;

  constructor(private processDataService: ProcessDataService, private TimelineStoreService: TimelineStoreService){}
  
  ngOnInit(): void {
    //listen to incoming data and push to store
    this.sub = this.processDataService.layers$.subscribe(layers => {
      layers.flat().forEach(entry => {
        this.TimelineStoreService.add(entry);
        this.maxTime = Date.now();//keep maxtime for slider

        if(!this.sliderActive){
          this.selectedTime = this.maxTime;
          console.log("from timeline component:", this.selectedTime);
          this.filteredLayers = this.groupByLayers(this.TimelineStoreService.getEntriesAt(this.maxTime));
          console.log("from timeline.component, filtered layers", this.filteredLayers);
        }
      });
    });
  }
  
  onTimeChange():void{
    this.sliderActive = true;
    this.filteredLayers = this.groupByLayers(this.TimelineStoreService.getEntriesAt(this.selectedTime!));
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
    return Object.values(map);
  }

  unlockSlider(){
    this.sliderActive = false;
    this.filteredLayers = this.groupByLayers(this.TimelineStoreService.getEntriesAt(this.maxTime));
  }

  ngOnDestroy(){
    if(this.sub) this.sub.unsubscribe();
  }
}

