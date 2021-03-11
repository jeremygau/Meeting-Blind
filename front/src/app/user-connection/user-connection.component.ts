import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-connection',
  templateUrl: './user-connection.component.html',
  styleUrls: ['./user-connection.component.scss']
})

export class UserConnectionComponent implements OnInit {

  connectionForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.connectionForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmitForm(): void {
    const formValue = this.connectionForm.value;

    this.authService.connectUser(formValue.email, formValue.password).subscribe(
      (response: any) => {
        if (response.email === 'ok') {
          this.authService.setIsConnected(true);
          this.router.navigate(['profile']);
        } else {
          alert('l\'identifiant et/ou le mot de passe ne sont pas reconnus.');
        }
      },
      (error: any) => {
        console.log(error);
        alert('l\'identifiant et/ou le mot de passe ne sont pas reconnus.');
      }
    );
  }

}

