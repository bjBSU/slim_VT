import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../services/web-socket.service';
@Component({
  selector: 'app-logger-display',
  templateUrl: './logger-display.component.html',
  styleUrls: ['./logger-display.component.css']
})
export class LoggerDisplayComponent implements OnInit {
  messages: JSON[] = [];

  constructor(private webSocketService: WebSocketService){}

  ngOnInit(): void {
    this.webSocketService.getServerLoggerMessages().subscribe((message) => {
      console.log('Recieved from server: ', message);
      this.messages.push(message);
    });
    }
    // const render = new ChartRender();
    // const svgElement = this.render.renderChart(messages, color);
}
  
