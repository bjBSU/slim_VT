// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class TangleLayoutService {

//   constructor() { }
// }

import * as d3 from 'd3';
import { Injectable } from '@angular/core';

export interface Node {
  id: string;
  level?: number;
  parents?: Node[];
  bundle?: Bundle;
  bundles?: Bundle[];
  bundles_index?: Record<string, Bundle[]>;
  height?: number;
  x?: number;
  y?: number;
}

export interface Bundle {
  id: string;
  parents: Node[];
  level: number;
  span: number;
  i?: number;
  x?: number;
  y?: number;
  links?: Link[];
}

export interface Link {
  source: Node;
  bundle: Bundle;
  target: Node;
  xs?: number;
  ys?: number;
  xb?: number;
  yb?: number;
  xt?: number;
  yt?: number;
  c1?: number;
  c2?: number;
}

export interface LayoutOptions{
  c?: number;
  bigc?: number;
}

export interface Layout {
  width: number;
  height: number;
  node_height: number;
  node_width: number;
  bundle_width: number;
  level_y_padding: number;
  metro_d: number;
}

export interface Level extends Array<Node>{
  bundles?: Bundle[];
}

export interface TangleLayout {
  levels: Node[][];
  nodes: Node[];
  nodes_index: Record<string, Node>;//{ [key: string]: Node };
  links: Link[];
  bundles: Bundle[];
  layout: Layout;
}

@Injectable({
  providedIn: 'root',
})
export class TangleLayoutService {
  static constructTangleLayout(levels: Level[], options: LayoutOptions = {}): Promise<TangleLayout>{
    return new Promise((resolve, reject)=> {
      //   levels: Node[][];
      //   nodes: Node[];
      //   nodes_index: Record<string, Node>;
      //   links: Link[];
      //   bundles: Bundle[];
      //   layout: Layout;
      // } {
        levels.forEach((l, i) => l.forEach(n => (n.level = i)));

        const nodes = levels.flat();
        const nodes_index: Record<string, Node> = {};
        nodes.forEach(d => (nodes_index[d.id] = d));

        nodes.forEach(d => {
          d.parents = (d.parents || []).map(p => nodes_index[p.id]);
        });

        levels.forEach((l, i) => {
          const index: Record<string, Bundle> = {};
          l.forEach(n => {
            if (!n.parents || n.parents.length === 0) return;

            const id = n.parents.map(d => d.id).sort().join('-X-');
            if (index[id]) {
              index[id].parents = [...index[id].parents, ...n.parents];
            } else {
              index[id] = {
                id,
                parents: [...n.parents],
                level: i,
                span: i - d3.min(n.parents, p => p.level || 0)!
              };
            }
            n.bundle = index[id];
          });
          l['bundles'] = Object.values(index);
          l['bundles'].forEach((b, i) => (b.i = i));
        });

        const links: Link[] = [];
        nodes.forEach(d => {
          if(!d.parents) return;
          d.parents.forEach(p =>
            links.push({ source: d, bundle: d.bundle!, target: p })
          );
        });

        const bundles = levels.flatMap(l => l['bundles']);
        
        bundles.forEach(b => {
          if(!b) return;
          b.parents.forEach(p => {
            p.bundles_index = p.bundles_index || {};
            p.bundles_index[b.id] = p.bundles_index[b.id] || [];
            p.bundles_index[b.id].push(b);
          })
      });

        nodes.forEach(n => {
          n.bundles = Object.values(n.bundles_index || {}).flat();
          n.bundles.sort((a, b) => d3.descending(a.span, b.span));
          //n.bundles.sort((a, b) => d3.descending(d3.max(a, d => d.span)!, d3.max(b, d => d.span)!));
          n.bundles.forEach((b, i) => (b.i = i));
        });

        links.forEach(l => {
          l.bundle.links = l.bundle.links || [];
          l.bundle.links.push(l);
        });

        const padding = 8;
        const node_height = 22;
        const node_width = 70;
        const bundle_width = 14;
        const level_y_padding = 16;
        const metro_d = 4;
        const min_family_height = 22;
        
        options.c ||= 16;
        const c = options.c;
        options.bigc ||= node_width + c;

        nodes.forEach(n => (n.height = (Math.max(1, (n.bundles?.length || 0)) - 1) * metro_d));

        let x_offset = padding;
        let y_offset = padding;
        levels.forEach(l => {
          x_offset += (l['bundles']?.length || 0) * bundle_width;
          y_offset += level_y_padding;
          l.forEach(n => {
            n.x = n.level! * node_width + x_offset;
            n.y = node_height + y_offset + (n.height || 0) / 2;
            y_offset += node_height + (n.height || 0);
          });
        });

        let i = 0;
        levels.forEach(l => {
          l['bundles']?.forEach(b => {
            b.x = d3.max(b.parents, d => d.x!)! + node_width + ((l['bundles']?.length || 0) - 1 - b.i!) * bundle_width;
            b.y = i * node_height;
          });
          i += l.length;
        });

        links.forEach(l => {
          const firstBundle = l.target.bundles_index![l.bundle.id]?.[0];
          l.xt = l.target.x!;
          //l.yt = l.target.y! + l.target.bundles_index![l.bundle.id].i! * metro_d - ((l.target.bundles?.length || 0) * metro_d) / 2 + metro_d / 2;
          l.yt = l.target.y! + (firstBundle?.i ?? 0) * metro_d - ((l.target.bundles?.length || 0) * metro_d) / 2 + metro_d / 2;
          l.xb = l.bundle.x!;
          l.yb = l.bundle.y!;
          l.xs = l.source.x!;
          l.ys = l.source.y!;
        });

        const layout: Layout = {
          width: d3.max(nodes, n => n.x!)! + node_width + 2 * padding,
          height: d3.max(nodes, n => n.y!)! + node_height / 2 + 2 * padding,
          node_height,
          node_width,
          bundle_width,
          level_y_padding,
          metro_d
        };

      resolve({
        levels, 
      nodes, 
      nodes_index, 
      links, 
      bundles : bundles.filter((b): b is Bundle => b !== undefined),
      layout
      });
    });
  // //   levels: Node[][];
  // //   nodes: Node[];
  // //   nodes_index: Record<string, Node>;
  // //   links: Link[];
  // //   bundles: Bundle[];
  // //   layout: Layout;
  // // } {
  //   levels.forEach((l, i) => l.forEach(n => (n.level = i)));

  //   const nodes = levels.flat();
  //   const nodes_index: Record<string, Node> = {};
  //   nodes.forEach(d => (nodes_index[d.id] = d));

  //   nodes.forEach(d => {
  //     d.parents = (d.parents || []).map(p => nodes_index[p.id]);
  //   });

  //   levels.forEach((l, i) => {
  //     const index: Record<string, Bundle> = {};
  //     l.forEach(n => {
  //       if (!n.parents || n.parents.length === 0) return;

  //       const id = n.parents.map(d => d.id).sort().join('-X-');
  //       if (index[id]) {
  //         index[id].parents = [...index[id].parents, ...n.parents];
  //       } else {
  //         index[id] = {
  //           id,
  //           parents: [...n.parents],
  //           level: i,
  //           span: i - d3.min(n.parents, p => p.level || 0)!
  //         };
  //       }
  //       n.bundle = index[id];
  //     });
  //     l['bundles'] = Object.values(index);
  //     l['bundles'].forEach((b, i) => (b.i = i));
  //   });

  //   const links: Link[] = [];
  //   nodes.forEach(d => {
  //     if(!d.parents) return;
  //     d.parents.forEach(p =>
  //       links.push({ source: d, bundle: d.bundle!, target: p })
  //     );
  //   });

  //   const bundles = levels.flatMap(l => l['bundles']);
    
  //   bundles.forEach(b => {
  //     if(!b) return;
  //     b.parents.forEach(p => {
  //       p.bundles_index = p.bundles_index || {};
  //       p.bundles_index[b.id] = p.bundles_index[b.id] || [];
  //       p.bundles_index[b.id].push(b);
  //     })
  // });

  //   nodes.forEach(n => {
  //     n.bundles = Object.values(n.bundles_index || {}).flat();
  //     n.bundles.sort((a, b) => d3.descending(a.span, b.span));
  //     //n.bundles.sort((a, b) => d3.descending(d3.max(a, d => d.span)!, d3.max(b, d => d.span)!));
  //     n.bundles.forEach((b, i) => (b.i = i));
  //   });

  //   links.forEach(l => {
  //     l.bundle.links = l.bundle.links || [];
  //     l.bundle.links.push(l);
  //   });

  //   const padding = 8;
  //   const node_height = 22;
  //   const node_width = 70;
  //   const bundle_width = 14;
  //   const level_y_padding = 16;
  //   const metro_d = 4;
  //   const min_family_height = 22;
    
  //   options.c ||= 16;
  //   const c = options.c;
  //   options.bigc ||= node_width + c;

  //   nodes.forEach(n => (n.height = (Math.max(1, (n.bundles?.length || 0)) - 1) * metro_d));

  //   let x_offset = padding;
  //   let y_offset = padding;
  //   levels.forEach(l => {
  //     x_offset += (l['bundles']?.length || 0) * bundle_width;
  //     y_offset += level_y_padding;
  //     l.forEach(n => {
  //       n.x = n.level! * node_width + x_offset;
  //       n.y = node_height + y_offset + (n.height || 0) / 2;
  //       y_offset += node_height + (n.height || 0);
  //     });
  //   });

  //   let i = 0;
  //   levels.forEach(l => {
  //     l['bundles']?.forEach(b => {
  //       b.x = d3.max(b.parents, d => d.x!)! + node_width + ((l['bundles']?.length || 0) - 1 - b.i!) * bundle_width;
  //       b.y = i * node_height;
  //     });
  //     i += l.length;
  //   });

  //   links.forEach(l => {
  //     const firstBundle = l.target.bundles_index![l.bundle.id]?.[0];
  //     l.xt = l.target.x!;
  //     //l.yt = l.target.y! + l.target.bundles_index![l.bundle.id].i! * metro_d - ((l.target.bundles?.length || 0) * metro_d) / 2 + metro_d / 2;
  //     l.yt = l.target.y! + (firstBundle?.i ?? 0) * metro_d - ((l.target.bundles?.length || 0) * metro_d) / 2 + metro_d / 2;
  //     l.xb = l.bundle.x!;
  //     l.yb = l.bundle.y!;
  //     l.xs = l.source.x!;
  //     l.ys = l.source.y!;
  //   });

  //   const layout: Layout = {
  //     width: d3.max(nodes, n => n.x!)! + node_width + 2 * padding,
  //     height: d3.max(nodes, n => n.y!)! + node_height / 2 + 2 * padding,
  //     node_height,
  //     node_width,
  //     bundle_width,
  //     level_y_padding,
  //     metro_d
  //   };

    // return { 
    //   levels, 
    //   nodes, 
    //   nodes_index, 
    //   links, 
    //   bundles : bundles.filter((b): b is Bundle => b !== undefined),
    //   layout 
    // };
  }
}
