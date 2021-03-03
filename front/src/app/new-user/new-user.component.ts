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
      city: ['', Validators.required],
      gender: ['', Validators.required],
      description: [''],
      desiredGender: ['', Validators.required]
    });
  }

  onSubmitForm(): void {
    const formValue = this.userForm.value;
    let gender = 'homme';
    switch (formValue.gender) {
      case 1:
        gender = 'homme';
        break;
      case 2:
        gender = 'femme';
        break;
    }
    let desiredGender = 'homme';
    switch (formValue.desiredGender) {
      case 1:
        desiredGender = 'homme';
        break;
      case 2:
        desiredGender = 'femme';
        break;
      case 3:
        desiredGender = 'homme/femme';
        break;
    }
    const newUser = new User(
      0,
      formValue.email,
      formValue.password,
      formValue.firstName,
      formValue.city,
      gender,
      formValue.description,
      desiredGender,
      [],
      []
    );
    console.log(newUser);
    this.httpService.createUser(newUser).subscribe((response) => {
      console.log(response);
      if (response && response.email === 'ok') {
        alert('L\'utilisateur a été crée');
        // todo: store l'id dans le cookie
        this.router.navigate(['profile']);
      }
      else {
        alert('L\'utilisateur existe deja !');
      }
    }, (e) => {
      console.log('erreur', e);
    });
  }
}
