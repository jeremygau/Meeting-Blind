import {Component, Input, OnInit, Output, EventEmitter, AfterViewInit} from '@angular/core';
import {Message} from '../models/message.model';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit, AfterViewInit{

  @Input() message!: Message;
  @Input() sender!: string;
  @Input() requesterId !: number;

  @Output() deleteMsg = new EventEmitter<Message>();

  container!: HTMLElement | null;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.container = document.getElementById('chat');
    if (this.container !== null) {
      this.container.scrollTop = this.container.scrollHeight;
    }
  }

  deleteMessage(message: Message): void {
    this.deleteMsg.emit(message);
  }
}
