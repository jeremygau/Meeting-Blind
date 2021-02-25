import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../models/user.model';
import {HttpService} from '../services/http.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss']
})

export class NewUserComponent implements OnInit {

  userForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private httpService: HttpService, private router: Router) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      city: ['', Validators.required],
      search: ['', Validators.required]
    });
  }

  onSubmitForm(): void {
    const formValue = this.userForm.value;
    const newUser = new User(
      0,
      formValue.email,
      formValue.password,
      formValue.firstName,
      formValue.lastName,
      formValue.city,
      formValue.gender,
      formValue.description,
      formValue.search,
      formValue.phone,
      [],
      []
    );
    this.httpService.createUser(newUser).subscribe((response) => {
      if (response && response.email === 'ok') {
        alert('User crée');
      }
      else {
        alert('User Existe !');
        return;
      }
    }, (e) => {
      console.log('erreur', e);
    }, () => {
      this.router.navigate(['']);
    });
  }

}
