import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
//import {IData} from services chart-render.interface
import * as _ from 'lodash';
import { TangleLayout, TangleLayoutService } from '../services/tangle-layout.service';
import * as d3 from 'd3';
import { color } from 'd3';

@Component({
  selector: 'app-chart-render',
  templateUrl: './chart-render.component.html',
  styleUrls: ['./chart-render.component.css']
})
export class ChartRenderComponent implements OnInit {
  @ViewChild("containerRenderChart") element : ElementRef | undefined;
  //call the chart-render-data

  private svg: any;
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);

  background_color:string = "white";
  svgContent: string | undefined;

  color = d3.scaleOrdinal(d3.schemeDark2);

  constructor() { }

   ngOnInit(): void {
    this.createSvg();
    this.renderChart(this.element).then((result) => {//RENDER CHART
      console.log('Chart rendered: ', result);
    }).catch((error) => {
      console.log('Error rendering chart:', error);
    });
    }

    private createSvg(): void {
      this.svg = d3.select("figure#bar")
      .append("svg")
      .attr("width", this.width + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
    }

   public renderChart(data:any, options:any={}): Promise<string>{
    options.color ||= (d: any, i: string) => color(i);
    //return tangleLayout = TangleLayoutService.constructTangleLayout(_.cloneDeep(data), options);
    return TangleLayoutService.constructTangleLayout(_.cloneDeep(data), options).then((tangleLayout: TangleLayout) => {
      this.svgContent = `<svg width="${tangleLayout.layout.width}", height="${
      tangleLayout.layout.height}", style="background-color: ${this.background_color}">
      <style>
        text {
          font-family: sans-serif;
          font-size: 10px;
        }
        .node{
            stroke-linecap: round;
        }
        .link {
            fill: none;
        }
      </style>

      ${tangleLayout.bundles.map((b:any, i:any) =>{
        let d = b.links.map(
          (l:any) => `
          M${l.xt} ${l.yt}
          L${l.bx - l.c1} ${l.yt}
          A${l.c1} ${l.c1} 90 0 1 ${l.xb} ${l.yt + l.c1}
          L${l.xb} ${l.ys - l.c2}
          A${l.c2} ${l.c2} 90 0 0 ${l.xb + l.c2} ${l.ys}
          L${l.xs} ${l.ys}`
          )
          .join("");
        return `
          <path class="link" d="${d}" stroke="${this.background_color}" stroke-width="5"/>
          <path class="link" d="${d}" stroke="${options.color(b, i)}" stroke-width="2"/>
        `;
      }).join('')}

      ${tangleLayout.nodes.map(
        (n:any) => `
        <path class="selectable node" data-id="${
          n.id
        }" stroke="black" stroke-width="8" d="M${n.x} ${n.y - n.height / 2} L${
          n.x
        } ${n.y + n.height / 2}"/>
        <path class="node" stroke="white" stroke-width="4" d="M${n.x} ${n.y -
          n.height / 2} L${n.x} ${n.y + n.height / 2}"/>

        <text class="selectable" data-id="${n.id}" x="${n.x + 4}" y="${n.y -
          n.height / 2 -
          4}" stroke="${this.background_color}" stroke-width="2">${n.id}</text>
        <text x="${n.x + 4}" y="${n.y -
          n.height / 2 -
          4}" style="pointer-events: none;">${n.id}</text>
      `
      ).join('')}

      </svg>`;
     return this.svgContent;
    }).catch((error: any) => {
      console.error("Error rendering chart:", error);
      return '';
    });
  }  
}

