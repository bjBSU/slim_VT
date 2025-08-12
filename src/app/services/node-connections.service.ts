import { Injectable } from '@angular/core';
import { Node } from '../services/tangle-layout.service';

@Injectable({
  providedIn: 'root'
})
export class NodeConnectionsService {

  //queue like structure that holds node items
  private idToNode : Record<string, Node> = {};

  constructor() { }

  setNode(newNode: Node | null): Node | null{
    if(!newNode) return null;//if null
    
    const existingNode = this.idToNode[newNode.module];

    //only preceed if there is a meaningful connection
    if(existingNode){

      if(Array.isArray(newNode.previous_nodes)){
        //merge the new node into the existing one
        existingNode.previous_nodes=[
          ...existingNode.previous_nodes,
          ...newNode.previous_nodes.filter(
            n => !existingNode.previous_nodes.some(e => e === n))
        ];
      }
      
      if(Array.isArray(newNode.next_nodes)){
        existingNode.next_nodes = [
          ...existingNode.next_nodes,
          ...newNode.next_nodes.filter(
            n => !existingNode.next_nodes.some(e => e === n))
        ];
      }
      return existingNode;//return the canonical instance
    }else{
      //if node does exist, just add it
      this.idToNode[newNode.module] = newNode;
      return newNode;
    }
  }

  getNode(key: string): Node | undefined{
      return this.idToNode[key];
  }

  isCacheEmpty() : boolean{
      return Object.keys(this.idToNode).length === 0;
  }

  clearCache(): void{
      this.idToNode = {};
  }

  has(key:string): boolean{
    return key in this.idToNode;
  }
  
  getAllNodes(): Node[]{
    return Object.values(this.idToNode);
  }
}
