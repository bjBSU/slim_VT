import { Component, ContentChild, ElementRef, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { WebSocketService } from '../services/web-socket.service';
import { ProcessDataService, ModuleNode } from '../services/process-data.service';
import { bufferCount, Observable, Subscription } from 'rxjs';
import { TangleLayoutService, TangleLayout } from '../services/tangle-layout.service';//TangleLayout, Node,

@Component({
  selector: 'app-logger-display',
  templateUrl: './logger-display.component.html',
  styleUrls: ['./logger-display.component.css']
})

/**
 * Responsible for recieving real-time
 * logs via Web Sockets, structuring them into LogEntry[]'s and
 * sending batches of them to the service
 */
export class LoggerDisplayComponent implements OnInit {
  @Input() mode: 'top' | 'bottom' = 'top';//keeps track of the "mode" or page the user is on

  //Sending Filtered Layers to timeline Component
  @Output() filteredLayers:ModuleNode[][] = [];

  //adjust the format to be ModuleNode
  formattedData: ModuleNode[] = [];
  whole_json: any[] = [];
  newFormat!: Observable<ModuleNode[][]>;
  constructor(private webSocketService: WebSocketService, private processDataService: ProcessDataService){}

  ngOnInit(): void {

    //assign the observable once, gets any current layers
    this.newFormat = this.processDataService.layers$;

    //Gets JSON objects from web socket service
    this.webSocketService.getServerLoggerMessages().subscribe((message) => {
      this.whole_json.push(message);
      const modTest: ModuleNode = JSON.parse(message);//parse data to fit the ModuleNode format
      this.formattedData.push(modTest);
      
      this.processDataService.processDataService(this.formattedData);//checks that all formatted data is created correctly 
    });

    //sets filteredLayers
    this.newFormat.subscribe(layers => {
      this.filteredLayers = layers;
    });
  }
}

  
