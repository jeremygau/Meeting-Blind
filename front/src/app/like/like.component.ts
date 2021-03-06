import {Component, Input, OnInit} from '@angular/core';
import {User} from '../models/user.model';
import {HttpService} from '../services/http.service';

@Component({
  selector: 'app-like',
  templateUrl: './like.component.html',
  styleUrls: ['./like.component.scss']
})
export class LikeComponent implements OnInit {

  @Input() id!: number;
  user!: User;

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.httpService.getUser(this.id).subscribe(
      (user: User) => {
        this.user = user;
      });
  }
}
