import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { TangleLayoutService } from '../services/tangle-layout.service';
import { ModuleNode } from '../services/process-data.service'; 



@Component({
  selector: 'app-chart-render-data',
  templateUrl: './chart-render-data.component.html',
  styleUrls: ['./chart-render-data.component.css']
})
export class ChartRenderDataComponent implements OnInit {
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }
}

