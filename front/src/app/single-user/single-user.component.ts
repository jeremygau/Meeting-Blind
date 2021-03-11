import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user.model';

@Component({
  selector: 'app-single-user',
  templateUrl: './single-user.component.html',
  styleUrls: ['./single-user.component.scss']
})
export class SingleUserComponent implements OnInit {
  user!: User;
  isLikedByRequester = false;
  likedRequester = false;
  requesterId!: number;
  genericErrorMessage = 'Une erreur est survenue, veuillez réessayer. Si l\'erreur persiste, contactez un administrateur';

  constructor(private httpService: HttpService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.httpService.getRequesterId().subscribe(
      (response: { id: number }) => {
        this.requesterId = response.id;
      },
      () => {
        alert(this.genericErrorMessage);
      },
      () => {
        this.httpService.getUser(this.route.snapshot.params.id).subscribe(
          (user: User) => {
            this.user = user;
            this.isLikedByRequester = user.likedBy.includes(this.requesterId);
            this.likedRequester = user.likedUsers.includes(this.requesterId);
          });
      }
    );
  }

  like(): void {
    this.httpService.like(this.user.id).subscribe(
      (response: {result: string}) => {
        this.handleLikeAnswer(response);
      },
      () => {
        alert(this.genericErrorMessage);
      }
    );
  }

  dislike(): void {
    this.httpService.dislike(this.user.id).subscribe(
      (response: {result: string}) => {
        this.handleLikeAnswer(response);
      },
      () => {
        alert(this.genericErrorMessage);
      }
    );
  }

  private handleLikeAnswer(response: {result: string}): void {
    if (!response) {
      alert(this.genericErrorMessage);
      return;
    }
    switch (response.result) {
      case 'ok':
        this.isLikedByRequester = ! this.isLikedByRequester;
        break;
      case 'requester unknown' :
        this.router.navigate(['login']);
        break;
      case 'liked user unknown' :
        alert('L\'utilisateur n\'existe pas ou plus.');
        break;
      case 'conversation not created' :
        alert('Votre conversation n\'a pas pu etre créée. Contactez un administrateur');
        break;
      case 'conversation not blocked' :
        alert('Votre conversation n\'a pas été bloquée. Contactez un administrateur');
        break;
      default:
        alert(this.genericErrorMessage);
    }
  }

}
