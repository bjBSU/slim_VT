import { Injectable } from '@angular/core';
import { Node } from '../services/tangle-layout.service';

@Injectable({
  providedIn: 'root'
})
export class NodeConnectionsService {

  //queue like structure that holds node items
  private idToNode : Record<string, Node> = {};

  constructor() { }

  /**
   * The purpose of this method is to check incoming data, 
   * see if it is a new module or a current one that needs to be updated
   * with new information.
   * @param newNode 
   * @returns 
   */
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

  /**
   * Gets a node based on its 'key' which is really just the name of the module.
   * @param key 
   * @returns 
   */
  getNode(key: string): Node | undefined{
      return this.idToNode[key];
  }

  /**
   * Checks if there is anything being stored.
   * @returns 
   */
  isCacheEmpty() : boolean{
      return Object.keys(this.idToNode).length === 0;
  }

  /**
   * Clears the Record
   */
  clearCache(): void{
      this.idToNode = {};
  }

  /**
   * Checks if the key (module name) exists in the Record.
   * @param key 
   * @returns 
   */
  has(key:string): boolean{
    return key in this.idToNode;
  }
  
  /**
   * Returns all of the existing Nodes.
   * @returns 
   */
  getAllNodes(): Node[]{
    return Object.values(this.idToNode);
  }
}
