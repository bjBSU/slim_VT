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
  @Input() mode: 'top' | 'bottom' = 'top';

  @Output() filteredLayers:ModuleNode[][] = [];
  formattedData: ModuleNode[] = [];
  whole_json: any[] = [];
  newFormat!: Observable<ModuleNode[][]>;
  constructor(private webSocketService: WebSocketService, private processDataService: ProcessDataService){}

  ngOnInit(): void {

    //assign the observable once
    this.newFormat = this.processDataService.layers$;

    this.webSocketService.getServerLoggerMessages().subscribe((message) => {
      this.whole_json.push(message);
      const modTest: ModuleNode = JSON.parse(message);
      this.formattedData.push(modTest);
      
      this.processDataService.processDataService(this.formattedData)
    });

    this.newFormat.subscribe(layers => {
      this.filteredLayers = layers;
    });
  }
  stringify(object: any): string {
    return JSON.stringify(object, null, 2);  // Converts to a readable JSON string
  }
}

  
