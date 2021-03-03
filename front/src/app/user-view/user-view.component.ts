import {Component, OnInit} from '@angular/core';
import {User} from '../models/user.model';
import {HttpService} from '../services/http.service';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss']
})
export class UserViewComponent implements OnInit {

  userId!: number;
  user!: User;
  // user: User = {
  //   id: 0,
  //   email: 'hello@hello',
  //   password: 'aaa',
  //   firstName: 'Jérémy',
  //   city: 'Marseille',
  //   gender: 'homme',
  //   description: '',
  //   desiredGender: 'femmes',
  //   likedUsers: [],
  //   likedBy: []
  // };

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.userId = 1; // todo: changer en fonction du cookie
    this.httpService.getUser(this.userId).subscribe(
      (user: User) => {
        console.log(user);
        this.user = user;
      });
  }


}
