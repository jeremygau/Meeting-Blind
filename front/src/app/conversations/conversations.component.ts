import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { Conversation } from '../models/conversation.model';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.scss']
})
export class ConversationsComponent implements OnInit {
  conversations!: Conversation[];
  requesterId!: number;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.requesterId = 0; // TODO trouver le requesterId par requête serveur ou accès token
    this.httpService.getConversations().subscribe(
      (conversations: Conversation[]) => {
        this.conversations = conversations;
      },
      () => {
        alert('une erreur a eu lieu, veuillez réessayer plus tard. Si le problème persiste, contactez un administrateur');
      }
    );
  }

  hasNewMessages(conversation: Conversation): boolean {
    if (conversation.messages.length === 0) { return false; }
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return conversation.hasUnreadMessages && lastMessage.sender !== this.requesterId;
  }
}
