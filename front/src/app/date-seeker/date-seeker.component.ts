import {Component, Input, OnInit} from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-date-seeker',
  templateUrl: './date-seeker.component.html',
  styleUrls: ['./date-seeker.component.scss']
})
export class DateSeekerComponent implements OnInit {
  usersInCity!: User[];
  searchQuery = '';


  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
  }

  public onSubmit(form: NgForm): void {
    const city = form.value.town;
    this.searchQuery = city;
    this.httpService.getUsersForTown(city).subscribe(
      (users: User[]) => { this.usersInCity = users; },
      (error: any) => { console.log(error); }
    );
  }


}
