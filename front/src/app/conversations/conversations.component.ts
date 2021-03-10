import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { Conversation } from '../models/conversation.model';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.scss']
})
export class ConversationsComponent implements OnInit {
  conversations: Conversation[] = [];
  requesterId!: number;
  defaultMessage = 'Il n\'y a aucune conversation à afficher :(. Likez des gens, et s\'ils vous likent en retour, revenez ici !';

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.httpService.getConversations().subscribe(
      (conversations: Conversation[]) => {
        this.conversations = conversations;
      },
      () => {
        alert('une erreur a eu lieu, veuillez réessayer plus tard. Si le problème persiste, contactez un administrateur');
      },
      () => {
        this.httpService.getRequesterId().subscribe(
          (response: {id: number}) => {
            this.requesterId = response.id;
          }
        );
      }
    );
  }

  hasNewMessages(conversation: Conversation): boolean {
    if (conversation.messages.length === 0) { return false; }
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return conversation.hasUnreadMessages && lastMessage.sender !== this.requesterId;
  }
}
