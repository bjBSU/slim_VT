import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, retry, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;
  constructor() { 
    this.socket = io('http://localhost:3000', {
      reconnection : true,
      reconnectionAttempts: 100,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('connection to websocket server: ', this.socket.id);
    });

    this.socket.on('disconnect', (reason) =>{
      // window.location.reload();
      console.log('disconnected: ', reason);
    })
  }

  //listen for 'server_logger' messages from backend
  getServerLoggerMessages(): Observable<any>{
    return new Observable(observer => {
      this.socket.on('server_logger', (message) => {
        observer.next(message);
        this.socket.emit("message recieved by angular client", message)
      });

      //clean up when socket listener leaves
      return () => {
        this.socket.off('server_logger');
      };
    }).pipe(
      retry(5),
      delay(1000)
    );
  }
}
