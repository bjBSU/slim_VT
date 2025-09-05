import * as d3 from 'd3';//min max and descending
import { Injectable } from '@angular/core';
import { ModuleNode } from './process-data.service';
import { NodeConnectionsService } from '../services/node-connections.service';
import { has } from 'lodash';

//internal represntation of a module with layout attributes
export interface Node {
  module: string; //module id/name
  level?: number; //depth in the graph
  previous_nodes: string[]; //parent modules  
  next_nodes: string[]; //child modules    
  bundle?: Bundle;  //single bundle
  bundles?: Bundle[]; //sharing dependancy bundles
  bundles_items?: Record<string, Bundle[]>;//saves a module and its corresponding bundle
  height?: number; //visual height due to bundles
  x?: number; // coordinates x
  y?: number; // coordinates y
}

//represents a group of shared parent relationships
export interface Bundle {
  module: string; // ID(combination of parent ids)
  previous_nodes: string[]; //shared parents
  next_nodes: string[];//child nodes        
  level?: number; 
  span?: number;
  i?: number; //index
  x?: number;
  y?: number;
  links?: Link[]; 
}

//a visual connection between a node and one of its 
//parents via a bundle
export interface Link {
  source: string;//Node
  bundle: Bundle | null;
  target: Node;
  //source x & y
  xs?: number;
  ys?: number;
  //bundle x & y
  xb?: number;
  yb?: number;
  //target x & y
  xt?: number;
  yt?: number;
  //these help determine the curve of the connection lines
  c1?: number;
  c2?: number;
}

//configuration (node size and spacing)
export interface Layout {
  width: number;
  height: number;
  node_height: number;
  node_width: number;
  bundle_width: number;
  level_y_padding: number;
 default_shift: number;
}

//final structure that includes all layout components
export interface TangleLayout {
  levels: Node[][];
  nodes: Node[];
  node_index: {[module:string]: Node};
  links: Link[];
  bundles: Bundle[];
  layout: Layout;
}

@Injectable({
  providedIn: 'root',
})
export class TangleLayoutService {
  private links  : Link[] = [];
  private moduleMap = new Map<string, Node>;
  private nodeLayers : Node[][] = [];
  private BundleMap: Record<string, Bundle> = {};
  constructor(private nodeConnections: NodeConnectionsService){};

  constructTangleLayout(modules: ModuleNode[][]): Promise<TangleLayout> {
    //promise ensures something as a return
    return new Promise((resolve, reject) => {
      try {
        // Convert ModuleNodes into internal mutable Nodes
        this.buildNodes(modules, 20, 150, 60);

        //get all nodes (node objects that have connections)
        this.nodeLayers = modules.map(layer => 
          layer.map(m => this.nodeConnections.getNode(m.module)!)
        );

        //compute the links between nodes
        this.links = this.computeLinks();
    
        this.computeBundles();
        this.computeBundlesBack();
        this.sortLayersByIndex();
        this.positionNodes();
        this.positionBundles();
        this.compressVerticalSpace();
        this.positionLinks();

        const layout: Layout = {
          width: d3.max(this.nodeLayers.flat(), n => n.x)! + 70,
          height: d3.max(this.nodeLayers.flat(), n => n.y)! + 11,
          node_height: 22,
          node_width: 70,
          bundle_width: 14,
          level_y_padding: 16,
         default_shift: 4
        }

        const node_index : Record<string, Node>= {};
        this.nodeLayers.flat().forEach(n => node_index[n.module] = n);

        //make sure bundles has no duplicates
        const bundlesMap = new Map<string, Bundle>();
        this.nodeLayers.flat().forEach(node => {
          (node.bundles || []).forEach(bundle => {
            bundlesMap.set(bundle.module, bundle);
          });
        });
        const bundles = Array.from(bundlesMap.values());

        //final output
        resolve({
          levels: this.nodeLayers,
          nodes: this.nodeLayers.flat(),
          node_index,
          links: this.links,
          bundles,
          layout
        });
      }catch(err){
        reject(err);
      }
    });
  }
    /**
     * Build Nodes takes in a double array of moduleNodes from logger component display
     * and builds a new node out of their possible position on the chart (level)
     * @param modules 
     * @param nodeHeight 
     * @param xSpacing 
     * @param ySpacing 
     */
    private buildNodes(modules: ModuleNode[][], nodeHeight: number, xSpacing: number, ySpacing: number):void{
      //holds the nodes with previous and next nodes
      const allModuleNodes: Record<string, Node> = {};

      modules.flat().forEach(m => {
        const layerIndex = modules.findIndex(layer => Array.isArray(layer) && layer.includes(m));//finds which layer (sub array)the current ModuleNode m belongs to in module
        const nodeIndex = modules[layerIndex].indexOf(m);
        
        const existingNode = this.nodeConnections.getNode(m.module);

        const updatedNode : Node = {
          ...(existingNode ?? {}),//preserve existing fields like next/prev
          module: m.module,
          previous_nodes: m.previous_modules ?? existingNode?.previous_nodes ?? [],
          next_nodes: m.next_modules ?? existingNode?.next_nodes ?? [], 
          level: layerIndex ?? existingNode?.level,
          bundle: existingNode?.bundle ?? undefined,
          bundles: [],
          bundles_items: undefined,
          height: nodeHeight,
          x: layerIndex * xSpacing,
          y: nodeIndex * ySpacing
        };
      this.nodeConnections.setNode(updatedNode);

      allModuleNodes[m.module] = updatedNode;

      // Step 2: check/populate connections (previous_nodes & next_nodes)
        const node = allModuleNodes[m.module];

        // Handle previous_modules -> previous_nodes
        if (m.previous_modules) {
          m.previous_modules.forEach(prevModName => {
            const parent = allModuleNodes[prevModName];
            if (parent && !node.previous_nodes.some(n => n === parent.module)) {
              node.previous_nodes.push(parent.module);
            }
            if (parent && !parent.next_nodes.some(n => n === node.module)) {
              parent.next_nodes.push(node.module);  // bi-directional link
            }
          });
        }

        // Handle next_modules → next_nodes (optional; in case both directions are declared)
        if (m.next_modules) {
          m.next_modules.forEach(nextModName => {
            const child = allModuleNodes[nextModName];
            if (child && !node.next_nodes.some(n => n === child.module)) {
              node.next_nodes.push(child.module);
            }
            if (child && !child.previous_nodes.some(n => n === node.module)) {
              child.previous_nodes.push(node.module);  // bi-directional link
            }
          });
        }
      });

      // Step 3: Save into cache
      Object.values(allModuleNodes).forEach(node => {
        this.nodeConnections.setNode(node);
      });
      this.moduleToCache(this.nodeConnections.getAllNodes());
    }

    
    /**
     * Function computes relationship between parent and child modules.
     */
    private computeBundles(){
      const reverseMap: Record<string, string[]> = {};//maps each node to its parent mod name

      //flattends all levels into a single array of nodes
      this.nodeLayers.flat().forEach(n => this.moduleMap.set(n.module, n));

      //builds reverse map
      this.links.forEach(link => {
        if(!link.source && link.target){
          //treat missing source as root node
          if(!reverseMap[link.target.module]) reverseMap[link.target.module] = [];
        }

        if(link.source && link.target){
          //if this is a regular target-source node 
          const targetId = link.target.module;
          const sourceId = link.source;
          if(!reverseMap[targetId]){
          reverseMap[targetId] = [];
          }
          //add the source node to the list of parents for the target node
          reverseMap[targetId].push(sourceId);
          }
        });

      //step 2: go through each level and group bundles by shared parent sets
      this.nodeLayers.forEach((level, i) => {

        for(const node of level){
          const parents = reverseMap[node.module];//find the parents of the node 

          if(parents){
            const key = [...parents].sort().join('-X-');
      
            if(!this.BundleMap[key]){
              this.BundleMap[key] = {
                module: key,
                previous_nodes: [...parents],
                next_nodes:[],
                level: i,
                span: i - Math.min(...parents.map(p => this.moduleMap.get(p)?.level ?? 0)),//fall back for undefined levels
                i: Object.keys(this.BundleMap).length,
                x: 1,
                y: 1,
                links: [],
              };
            }
            // console.log("created new key in BundleMap", this.BundleMap[key]);
            if(node.module != node.previous_nodes.find((n: string) => n === node.module)){
              node.bundle = this.BundleMap[key]; 
            }
          }         
        }
        //assign bundle back to node
        const bundles = Object.values(this.BundleMap);
        level.forEach(node => {
          const nodeBundle = node.bundle;

          if (nodeBundle) {
            node.bundles ||= [];
            node.bundles_items ||= {};

            if(nodeBundle && !node.bundles.includes(nodeBundle)){
              node.bundles.push(nodeBundle);
              node.bundles_items[node.module] = [nodeBundle];
            }
          } 
        });

        bundles.forEach((b: Bundle, idx: number) =>{
          if(b.i === undefined){
            b.i = idx;//update index for spacing
          }
        } );
      });

      //each link get assigned a bundle, based on target nodes bundle
      this.links.forEach(link => {
        if (typeof link.target === 'object') {
          const targetBundle = link.target.bundle ?? null;
          if(link.bundle !== targetBundle){
            link.bundle = targetBundle;
          }
        }
      });
    }
    
    /**
     * Makes sure that all Node know what they are connected to.
     * @returns 
     */
    private computeLinks(): Link[]{
      //add check that sees if nodeConnections already has that link and if so skip
      const linkExists = (source:string, target: Node): boolean => {
        return this.links.some(link =>
          link.source === source && link.target === target
        );
      };

      this.nodeConnections.getAllNodes().forEach((n:Node) => {
        if(n.previous_nodes !== null){
          n.previous_nodes.forEach((p:string) => {
            //asign bundle from the target(p) since thats how bundles are grouped later
            if(linkExists(p,n)) {
              return;
            }else{
              this.links.push({
                source: p, 
                target: n,
                bundle: n.bundle ?? null,
              });
            }
          });
          //set level of n based on its parents
          const parentLevel = n.previous_nodes
            .map(p => this.nodeConnections.getNode(p)?.level)
            .filter(lvl => lvl != null) as number[];

          //makes sure that the child node is being leveled correctly based on its lowest parent
          //that way their is no chance a child would be higher then its parent node
          if(parentLevel.length > 0){
            const maxParentLevel = Math.max(...parentLevel);
            n.level =  maxParentLevel + 1;
          }else if(n.level == null){
            n.level = 0;
          }
        }
      });

      this.sortLayersByIndex();
      return this.links;
    }

    /**
     * Bundles have been made but this checks to make sure all Nodes know who they are connected to.
     * This fuinction helps make sure that connections are made between modules even if 
     * a child node isnt aware it has a parent. EX. debug module doesn't know it has any parent connection. 
     */
    private computeBundlesBack(){
      this.nodeLayers.flat().forEach(n => this.moduleMap.set(n.module, n));

      const allNodes = this.nodeLayers.flat();
      const bundles = allNodes.flatMap((l:Node) => l.bundles || []);//for each node grab bundles
      
      // Reverse pointer for bundles
      bundles.forEach(b => {//loop through each bundle
        b.previous_nodes.forEach((pModule: string) => {//for each parent node of the bundle
          const p = this.moduleMap.get(pModule);//look up the coresponding node for that parent module????
          if(!p){
            return;
          }
          else if(p.bundles_items === undefined){//if parent has no bundles_index yet create it
            p.bundles_items = {};
            //return;
          }
          if(!(b.module in p.bundles_items)){
            p.bundles_items[b.module] = [b];
          }
          if(!p.bundles_items[b.module].includes(b)){//if it isnt already listed under the parent, initalize it with empty array
            p.bundles_items[b.module].push(b);
          }
        });
      });

      allNodes.forEach(n => {//go through all nodes
        n.bundles_items ||= {};//checks if its undefined
        n.bundles = [... (n.bundles || [])];

        //sorts bundles in desc order of their max span
        n.bundles.sort((a, b) => d3.descending(
          d3.max(a.links!, l => l.bundle ? l.bundle.span : -Infinity), 
          d3.max(b.links!, l => l.bundle ? l.bundle.span : -Infinity))
        );
        n.bundles.forEach((b, i) => {
          if(b.i === undefined){
            b.i = i;
          }
        });
      });

      //handles missing source and target nodes
      this.links.forEach(l => {
        if(!l.bundle){
          console.warn("Link missing bundle:", l);
          return;
        }
        const alreadyExists = l.bundle.links?.some(existing => 
          existing.source === l.source && existing.target.module === l.target.module
        );
        if(!alreadyExists){
          l.bundle.links?.push(l);
        }
      });
    }

    /**
     * Updates each Nodes position based on their level
     */
    private positionNodes(){
      // Layout constants
      const padding = 8;
      const node_height = 22;
      const level_y_padding = 40;

      this.nodeLayers.forEach((level, levelIndex) => {
        let y_offset = node_height;

        level.forEach(node => {
          node.x = levelIndex * 90 + padding;
          node.y = y_offset;
        });
        y_offset += node_height + level_y_padding;
      });
    }

    /**
     * Updates each Node bundle position based on their level.
     * Essential if there are module connections completely seperate from each other.
     */
    private positionBundles(){
      let i = 0;
      this.nodeLayers.flat().forEach(level => {
        if(!level.bundles) return;
        level.bundles!.forEach((b: Bundle) => {
          b.x = 0; // Reset to prevent drift
          b.y = 0;
        });
      });

      this.nodeLayers.flat().forEach(n => this.moduleMap.set(n.module, n));
      
      this.nodeLayers.flat().forEach(level => {
        if(!level.bundles) return;

        level.bundles!.forEach((b: Bundle) => {
          b.x = d3.max(b.previous_nodes, p => this.moduleMap.get(p)?.x)! + (level.bundles!.length - b.i!) * 14;
          b.y = i * 22;//will change y poistioning based on the level
        });
        i += level.level ?? 1;
      });
    }

    /**
     * Calculates the start and end for each link between nodes
     */
    private positionLinks(){
      const default_shift = 4;
      const defaultControlOffset = 5;
      if(this.nodeLayers)

      this.links.forEach(l => {
        const hasTarget = l.target;
        const hasSource = this.moduleMap.get(l.source);

        const bundleList = l.target.bundle?.previous_nodes;
            const bundleIndex = Array.isArray(bundleList) ? bundleList.findIndex(mod => mod === l.source)+ 1 : 1;
        
        //position source point
        if(hasSource){
          l.xs = hasSource.x!;
          l.ys = hasSource.y!;
        }

        //position target-side if target and bundle exist
        if(hasTarget && l.bundle){
            l.xt = l.target.x!;
            l.yt = l.target.y! + bundleIndex * default_shift
                  - (l.target.bundles!.length * default_shift) / 2 + default_shift / 2 - 10;
            l.xb = l.bundle.x! + 35 + default_shift;
            l.yb = l.bundle.y! + default_shift;
        } 

        if(hasSource && hasTarget){
          const sourceLevel = hasSource.level ?? 0;
          const targetLevel = hasTarget.level ?? 0;
          const levelDiff = sourceLevel - targetLevel;
          const dyOffset = levelDiff > 1
            ? Math.min(50, Math.abs(l.xb! - l.xt!), Math.abs(l.yb! - l.yt!)) - defaultControlOffset
            :  -defaultControlOffset;

          l.c1 = dyOffset;
          l.c2 = dyOffset;
        }
      });
    }

    /**
     * Adjust spacing between layers if the connections are large and vast.
     */
    private compressVerticalSpace() {
      // Total vertical offset applied so far
      let accumulatedYOffset = 0;

      this.nodeLayers.forEach((level: Node[]) => {
        level.forEach(l =>{
          const minOffset = -32;
          accumulatedYOffset += minOffset;

          if(l.y! >= accumulatedYOffset){
            l.y! -= accumulatedYOffset;
          }
        });
      });
    }

  
  /**
   * create a connection cache.
   * allNodes isnt being called directly this is being refernced in 
   * buildNodes and each node is being added one at a time.
   * @param allNodes 
   */
  private moduleToCache(allNodes: Node[]){
    allNodes.forEach(node => {

      //add the node itself to the map
      if(!this.nodeConnections.has(node.module)){
        this.nodeConnections.setNode({...node});
      }

      const currentNode = this.nodeConnections.getNode(node.module)!;
      if(!currentNode) return;

      //handle previous nodes (parents)
      node.previous_nodes?.forEach(parent => { //get each parent node
        if(!this.nodeConnections.has(parent)){//check if parent node exists in nodeConnections
          const parentNode = allNodes.find(n => n.module === parent);
          if(parentNode){
            //adds the parent to nodeConnections if it wasnt previously there
            this.nodeConnections.setNode({...parentNode});
          }else{
            return;
          }
        }

        const parentNode = this.nodeConnections.getNode(parent)!;
        if(!parentNode) return;

        //bidirectional linking
        if(!parentNode.next_nodes.includes(currentNode.module)){
          parentNode.next_nodes.push(currentNode.module);
          this.nodeConnections.setNode(currentNode);
        }
        if (!currentNode.previous_nodes.includes(parentNode.module)){
          currentNode.previous_nodes.push(parentNode.module);
          currentNode.level!++;
          this.nodeConnections.setNode(parentNode);
        }
      });
      
      //handle next nodes (children)
      node.next_nodes?.forEach(child => {

        if(!this.nodeConnections.has(child)){
          const childNode = allNodes.find(n => n.module === child);
          if(childNode){
            //adds the child to nodeConnections if it wasnt previously there
            this.nodeConnections.setNode({...childNode});
          }else{
            return;
          }
        }

        const childNode = this.nodeConnections.getNode(child)!;
        if(!childNode) return;

        //bidirectional linking
        if(!childNode.previous_nodes.includes(currentNode.module)){
          childNode.previous_nodes.push(currentNode.module);
          this.nodeConnections.setNode(currentNode);
        }
        if (!currentNode.next_nodes.includes(childNode.module)){
          currentNode.next_nodes.push(childNode.module);
          this.nodeConnections.setNode(childNode);
        }
      });
      node.level = node.previous_nodes.length;
    });
  }

  /**
   * Sorts the Layers by their index and not by the time that they were made.
   * Because often the Layers are made not in order of how they should display.
   */
  private sortLayersByIndex(){
    const levelMap: Record<number, Node[]> = {};

    this.nodeLayers.flat().forEach(node => {
      if(node.level == null) return;
      //if levelMap doesnt have that node level, create it
      if(!levelMap[node.level]){
        levelMap[node.level] = [];
      }
      levelMap[node.level].push(node);//and add it
    });
    this.nodeLayers = Object.keys(levelMap)
      .map(lvl => parseInt(lvl, 10))//lvl is string to int, 10 means base 10
      .sort((a,b) => a-b)//sorts the values in ascending order
      .map(lvl => levelMap[lvl]);//adds back to levelMap(thus sorting the levels)
  }
}