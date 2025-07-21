import { Time } from '@angular/common';
import { Injectable } from '@angular/core';
import { forEach } from 'lodash';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

//primary format needed for building the chart
export interface ModuleNode {
  module: string; //module name
  previous_modules?: string[]; //parent connections
  next_modules?: string[];
  first_iuid?: string;
  first_iu_created_at?: string;
  last_iuid?: string;
  last_iu_created_at?: string;
  event?: string;
  level?: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})

/**
 * Processes batches of the logs into a graph structure
 * specifically: ModuleNode[][] for renderin, and can share
 * the results with BehaviorSubject
 */
export class ProcessDataService {
  //BehaviorSubject is initalized with an empty array, it holds the state of the formatted data
  private layersSubject = new BehaviorSubject<ModuleNode[][]>([]);
  layers$ = this.layersSubject.asObservable(); // Public observable for components

  constructor() { }

  /**
   * Organizes ModuleNodes into layered format based on parent relationships
   */
  processDataService(nodes: ModuleNode[]): ModuleNode[][] {
    //maps module name to their corresponding moduleNode object
    const idToNode = new Map<string, ModuleNode>();

    //keeps track of how many parent connections each node has
    const inDegree = new Map<string, number>();

    //for each module, list its children
    const childrenMap = new Map<string, string[]>();

    // Initialize idToNode and initializes every module with inDegree = 0
    for (const node of nodes) {
      idToNode.set(node.module, node);
      inDegree.set(node.module, 0); // start with 0
    }

    //Popuates inDegree and child map
    for (const node of nodes) {
      if (!node.previous_modules) continue;
      //if(node.previous_modules != null){//*plane edit
        for (const parent of node.previous_modules) {//checks each parent for the module
          if (!childrenMap.has(parent)) {//checks if that node is a parent if not it makes it one
            childrenMap.set(parent, []);
          }
          inDegree.set(node.module, (inDegree.get(node.module) || 0) + 1);//moves the layer over 1
          childrenMap.get(parent)!.push(node.module);//adds the child to the parent node list
        }
      //}
    }

    // Kahn's algorithm for layering (Topological Sort-like)
    const layers: ModuleNode[][] = [];
    let currentLayer: string[] = [];

    // Start with nodes that have no parents (inDegree = 0), these are root nodes
    for (const [module, degree] of inDegree.entries()) {
      if (degree === 0) currentLayer.push(module);
    }
   //process the current node
    while (currentLayer.length > 0) {
      const layerNodes: ModuleNode[] = [];
      const nextLayer: string[] = [];

      for (const module of currentLayer) {
        const node = idToNode.get(module);
        if (node) layerNodes.push(node);

        const children = childrenMap.get(module) || [];
        for (const childId of children) {
          inDegree.set(childId, (inDegree.get(childId) || 0) - 1);
          if (inDegree.get(childId) === 0) {
            nextLayer.push(childId);
          }
        }
      }

      layers.push(layerNodes);
      currentLayer = nextLayer;
    }

    //Add any unlayered nodes
    const allLayeredNodes = new Set(layers.flat().map(n => n.module));
    const missingNodes = nodes.filter(n => !allLayeredNodes.has(n.module));

    if (missingNodes.length > 0) {
      console.warn('Adding unlayered nodes to a new layer due to cycle or missing dependencies:', missingNodes.map(n => n.module));
      layers.push(missingNodes);
    }

    this.layersSubject.next(layers);
    return layers;

  }
}
