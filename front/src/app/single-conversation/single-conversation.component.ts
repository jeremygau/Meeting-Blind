import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-single-conversation',
  templateUrl: './single-conversation.component.html',
  styleUrls: ['./single-conversation.component.scss']
})
export class SingleConversationComponent implements OnInit {

  conversation!: Conversation;
  requesterId !: number;
  message = '';
  systemMessage = 'Cette conversation est désactivée car l\'un de vous a unlike l\'autre. Vous ne pouvez plus envoyer de message.';

  constructor(private httpService: HttpService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const userId = this.route.snapshot.params.id;
    this.httpService.getConversation(userId).subscribe(
      (conv: Conversation) => {
        this.conversation = conv;
      },
      () => {
        this.sendErrorAlert();
      },
      () => {
        if (this.requesterId === undefined) { this.requesterId = this.conversation.user1.id; }
        this.httpService.checkForNewMessages();
      }
    );
  }

  getSenderName(message: Message): string {
    return message.sender === this.requesterId ? this.conversation.user1.firstName : this.conversation.user2.firstName;
  }

  deleteMessage(message: Message): void {
    this.httpService.deleteMessage(this.conversation.user2.id, message.id).subscribe(
      (updatedConv: Conversation) => {
        if (updatedConv.user1.id >= 0) {
          this.conversation = updatedConv;
        } else {
          switch (updatedConv.user1.id) {
            case -403:
              alert('Vous n\'êtes pas autorisé à supprimer un message que vous n\'avez pas envoyé.');
              break;
            case -404:
              alert('La conversation ou le message semblent ne plus exister. Rafraichissez la page. Si le problème persiste, ' +
                'contactez un administrateur');
              break;
            default:
              this.sendErrorAlert();
          }
        }
      }
    );
  }

  onSubmit(form: NgForm): void {
    const message = new Message(0, this.requesterId, this.conversation.user2.id, new Date(), form.value.message);
    this.httpService.addMessage(message).subscribe(
      (updatedConv: Conversation) => {
        if (updatedConv.user1.id >= 0) {
          this.message = '';
          this.conversation = updatedConv;
        } else {
          switch (updatedConv.user1.id) {
            case -404:
              alert('La conversation n\'as pu etre récupérée. Rafraichissez la page. Si le problème persiste, ' +
                'contactez un administrateur');
              break;
            default:
              this.sendErrorAlert();
          }
        }
      },
      () => {
        this.sendErrorAlert();
      }
    );
  }

  deleteConversation(): void {
    if (confirm('Cette conversation sera supprimée pour vous et votre interlocuteur. Êtes-vous sûr ?')) {
      this.httpService.deleteConversation(this.conversation.user2.id).subscribe(
        (response: any) => {
            if (response.status === 200) {
              this.router.navigate(['conv/']);
          }
        },
        () => {
          this.sendErrorAlert();
        }
      );
    }
  }

  private sendErrorAlert(): void {
    alert('le serveur a rencontré un problème. Rafraichissez la page et réessayez. Si le problème' +
      ' persiste, contactez un administrateur.');
  }

}
