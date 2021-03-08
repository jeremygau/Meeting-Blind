import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  @Input() firstName!: string;
  @Input() id!: number;
  @Input() desiredGender!: string;

  constructor() { }

  ngOnInit(): void {
  }

}
