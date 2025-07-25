import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import {Bundle, Link, TangleLayoutService, Node} from '../services/tangle-layout.service';
import * as _ from 'lodash';
import { ModuleNode } from '../services/process-data.service';
@Component({
  selector: 'app-chart-render',
  templateUrl: './chart-render.component.html',
  styleUrls: ['./chart-render.component.css']
})
export class ChartRenderComponent implements OnChanges {
    @ViewChild('chart', { static: true }) chart!: ElementRef<SVGElement>;
    @Input() data: ModuleNode[][] = []; 
  
    background_color = 'white';
  
    constructor(private tangleLayoutService: TangleLayoutService) {}
  
    ngOnChanges(changes: SimpleChanges): void {
      if (changes['data'] && this.data?.length > 0) {
        this.renderChart();
      }
    }
    
    public debugNodes: any[] = [];
    public levels: any[] = [];
    public levelNodes: Node[] = [];
    async renderChart(): Promise<void> {
      const svg = d3.select(this.chart.nativeElement);
      svg.selectAll('*').remove(); // Clear previous render
      const OFFSET_X = 50;
      const tangleLayout = await this.tangleLayoutService.constructTangleLayout(_.cloneDeep(this.data));

      this.debugNodes = tangleLayout.nodes;
      this.levels = tangleLayout.levels;
      this.levelNodes = this.levels.flat();
      svg
        .attr('width', 1000)//tangleLayout.layout.width
        .attr('height', 800)//tangleLayout.layout.height
        .style('background-color', this.background_color);
  
      const options = {
        color: (i: number) => d3.schemeCategory10[i % 50]
      };
  
      // Draw bundles
      console.log("Chart-render bundles:", tangleLayout.bundles)
      tangleLayout.bundles.forEach((b: Bundle, i: number) => {
        if(!b.links || b.links.length === 0)return;//skips bundles with no links
        b.links.forEach(l => {
          if(!l.xt || !l.yt ||!l.xs || !l.ys){
            console.warn("Broken links: ", l);
            return;
          }

          /**
           * source = starting node(child)
           * target = the ending node(parent)
           * xt,yt = top anchor point
           * xb,yb = midpoint or bend control
           * xs,ys = bottom anchor point
           * c1,c2 = control radii for 
           */
          const d = `
            M${l.xt! + OFFSET_X} ${l.yt}
            L${l.xb! - l.c1! + OFFSET_X} ${l.yt}
            A${l.c1} ${l.c1} 90 0 1 ${l.xb! + OFFSET_X} ${l.yt! + l.c1!}
            L${l.xb! + OFFSET_X} ${l.ys! - l.c2!}
            A${l.c2} ${l.c2} 90 0 0 ${l.xb! + l.c2! + OFFSET_X} ${l.ys}
            L${l.xs! + OFFSET_X} ${l.ys}
          `;
    
          svg.append('path')
            .attr('class', 'link')
            .attr('d', d)
            .attr('stroke', options.color(i))
            .attr('stroke-width', 2)
            .attr('fill', 'none');
        }
      );
    });
  
      this.debugNodes.forEach((n: any) => {
        const x = n.x;
        const y = n.y;

        if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
          console.warn('Skipping node with invalid coordinates:', n);
          return;
        }

        const xPosition = x + OFFSET_X;

        svg.append('circle')
          .attr('cx', xPosition)
          .attr('cy', y)
          .attr('r', 10)
          .attr('fill', 'orange')
          .attr('stroke', 'black')
          .attr('stroke-width', 2);

          svg.append('text')
            .attr('x', xPosition)
            .attr('y', y - 12)
            .text(n.module)
            .attr('font-size', '12px')
            .style('pointer-events', 'none');
      });
    }
  }