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
  usersInTown!: User[];
  searchQuery = '';


  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
  }

  public onSubmit(form: NgForm): void {
    const town = form.value.town;
    this.searchQuery = town;
    this.httpService.getUsersForTown(town).subscribe(
      (users: User[]) => { this.usersInTown = users; },
      (error: any) => { console.log(error); }
    );
  }


}
