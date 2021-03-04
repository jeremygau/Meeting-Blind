import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {User} from '../models/user.model';
import {HttpService} from '../services/http.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {

  user!: User;
  email!: string;
  password!: string;
  firstname!: string;
  city!: string;
  gender!: string;
  description!: string;
  desiredGender!: string;

  constructor(private httpService: HttpService, private router: Router) { }

  ngOnInit(): void {
    let userId = 1;
    this.httpService.getRequesterId().subscribe(
      (user1) => {
        console.log('user1', user1);
        userId = user1.id;
      },
      (e) => {
        console.log(e);
      },
      () => {
        this.httpService.getUser(userId).subscribe(
          (user: User) => {
            // console.log(user);
            this.user = user;
            this.email = user.email;
            this.password = user.password;
            this.firstname = user.firstName;
            this.city = user.city;
            this.gender = user.gender;
            this.description = user.description;
            this.desiredGender = user.desiredGender;
          });
      }
    );
  }

  onSubmit(): void {
    this.user.email = this.email;
    this.user.password = this.password;
    this.user.firstName = this.firstname;
    this.user.city = this.city;
    this.user.gender = this.gender;
    this.user.description = this.description;
    this.user.desiredGender = this.desiredGender;
    this.httpService.updateUser(this.user).subscribe(
      () => {
        this.router.navigate(['profile']);
      }
    );
  }

}
