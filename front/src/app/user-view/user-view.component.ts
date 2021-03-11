import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss']
})
export class UserViewComponent implements OnInit {

  user!: User;

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    let userId = 1;
    this.httpService.getRequesterId().subscribe(
      (user1) => {
        userId = user1.id;
      },
    (e) => {
      console.log(e);
      },
      () => {
        this.httpService.getUser(userId).subscribe(
          (user: User) => {
            this.user = user;
          });
      }
      );
  }


}
