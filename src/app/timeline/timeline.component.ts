import { Component, Input, OnInit } from '@angular/core';
import { ModuleNode, ProcessDataService } from '../services/process-data.service'; 
import { Subscription } from 'rxjs';
import { TimelineStoreService } from '../services/timeline-store.service';


@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {
  // this filtered layers is constantly recieving new module information
  @Input() filteredLayers: ModuleNode[][] = [];
  //temoLayer is used to print the layers to the console
  tempLayers : ModuleNode[][] = [];

  //slider defaults
  minTime :number = 0;
  maxTime :number = Date.now();
  selectedTime :number =0;
  sliderActive = false;
  printTime :string = "Now";
  goLiveMode: boolean = true;

  private sub!: Subscription;
  targetTimestamp: number | undefined;

  constructor(private processDataService: ProcessDataService, private TimelineStoreService: TimelineStoreService){}
  
  /**
   * listen to incoming data through sub and push to store
   */
  ngOnInit(): void {
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
    this.goLiveMode = false;//freeze slider
    
    //calculate targetTime (the desired time to get entries at)
    const now = Date.now();
    const offsetMs = this.selectedTime * 1000; 
    const targetTime = now - offsetMs;
    this.targetTimestamp = targetTime;

    // Save or use targetTime to filter your entries
    this.filteredLayers = this.groupByLayers(this.TimelineStoreService.getEntriesAt(this.targetTimestamp!));
    this.tempLayers = this.filteredLayers;
    
    // calculated how long ago the slider will show from current
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

