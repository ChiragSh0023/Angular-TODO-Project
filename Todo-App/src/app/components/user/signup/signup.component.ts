import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription, catchError, of, throwError } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnDestroy {
  form: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  // Used to store subscription of an observable
  private responseSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = this.form.value;
      this.responseSubscription = this.http
        .post<any>('http://localhost:3000/signup', formData)
        .subscribe({
          next: (response) => {
            if (response) {
              this.errorMessage = '';
              this.successMessage =
                response.message + ', Redirecting to Login Page.....';
              setTimeout(() => {
                this.successMessage = '';
                this.form.reset();
                this.router.navigate(['/login']);
              }, 2000);
            }
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 400) {
              // Username already exists in the 'users' table
              this.errorMessage =
                'This Username already exists, Please choose another one!';
            } else if (error.status === 500) {
              // Server Error
              this.errorMessage = 'Failed to sign up user';
            } else {
              // Server not running
              this.errorMessage = 'Internal Server Error';
            }
          },
        });
    }
  }

  ngOnDestroy(): void {
    if (this.responseSubscription) {
      this.responseSubscription.unsubscribe();
    }
  }
}
