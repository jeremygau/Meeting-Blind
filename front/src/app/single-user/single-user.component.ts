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

  constructor(private httpService: HttpService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.requesterId = 0; // TODO récupérer l'id, soit via token, soit via requête serveur si token non accessible.
    this.httpService.getUser(this.route.snapshot.params.id).subscribe(
      (user: User) => {
        this.user = user;
        this.isLikedByRequester = user.likedBy.includes(this.requesterId);
        this.likedRequester = user.likedUsers.includes(this.requesterId);
      });
  }

  like(): void {
    this.httpService.like(this.user.id).subscribe(
      (response) => {
        if (!response) {
          alert('Une erreur est survenue. Veuillez réessayer. Si l\'erreur persiste, contactez un administrateur');
        }
        if (response.status === 'ok') {
          this.isLikedByRequester = true;
        }
        else if (response.status === 'requester unknown') {
          this.router.navigate(['login']); // TODO vérifier que la route est bien correcte quand elle sera implémentée
        } else if (response.status === 'user unknown') {
          alert('L\'utilisateur n\'existe pas ou plus.');
        } else if (response.status === 'conversation not created') {
          alert('Une erreur interne au serveur est survenue : contactez un administrateur pour pouvoir démarrer une' +
            ' conversation');
        }
      },
      () => {
        alert('Une erreur est survenue, veuillez réessayer. Si l\'erreur persiste, contactez un administrateur');
      }
    );
  }

  dislike(): void {
    this.httpService.dislike(this.user.id).subscribe(
      (response) => {
        if (!response) {
          alert('Une erreur est survenue. Veuillez réessayer. Si l\'erreur persiste, contactez un administrateur');
        }
        if (response.status === 'ok') {
          this.isLikedByRequester = false;
        }
        else if (response.status === 'requester unknown') {
          this.router.navigate(['login']); // TODO vérifier que la route est bien correcte quand elle sera implémentée
        } else if (response.status === 'user unknown') {
          alert('L\'utilisateur n\'existe pas ou plus.');
        }
      },
      () => {
        alert('Une erreur est survenue, veuillez réessayer. Si l\'erreur persiste, contactez un administrateur');
      }
    );
  }

}
