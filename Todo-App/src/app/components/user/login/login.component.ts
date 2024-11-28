import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subscription, catchError, of } from 'rxjs';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  form: FormGroup;
  errorMessage: string = '';

  // Used to store subscription of an observable
  private responseSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.form = fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit() {
    // Check if user is already logged in, then navigate to todo component
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.router.navigate(['/todo']);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = this.form.value;
      this.responseSubscription = this.http
        .post<any>('http://localhost:3000/login', formData)
        .subscribe({
          next: (response) => {
            // Handle only when response is not null
            if (response) {
              // Setting values is local storage
              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('name', response.nameOfUser);
              localStorage.setItem('username', response.usernameOfUser);

              // Setting a cookie
              this.cookieService.set('sessionID', response.sessionId);

              this.form.reset();
              this.router.navigate(['/todo']);
            }
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 401) {
              if (error.error.error === 'Username not found, Please Signup!') {
                this.errorMessage = error.error.error;
              } else {
                // username found but password is incorrect
                this.errorMessage = 'Invalid password';
              }
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
