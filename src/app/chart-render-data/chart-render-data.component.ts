import { Component, OnInit } from '@angular/core';
import { TangleLayoutService } from '../services/tangle-layout.service';

@Component({
  selector: 'app-chart-render-data',
  templateUrl: './chart-render-data.component.html',
  styleUrls: ['./chart-render-data.component.css']
})
export class ChartRenderDataComponent implements OnInit {
//get the data storage ie. arrays with details from JSON objs
  // data!: IData[];
  //   newLabel!: string;
  //   newValue!: number;

  // //background_color:string = "white";
  // constructor(private dataService: TangleLayoutService) { }

  ngOnInit(): void {
  //   this.dataService.$data.subscribe(data => {
  //     this.data = data;
  //   })
  }

  // addData(): void{
  //   let newData = {
  //     label : this.newLabel,
  //     value: this.newValue,
  //    } as IData;
  //   this.dataService.addData(newData);
  // }
}
