import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  nameOfUser: string | null = localStorage.getItem('name');

  constructor(
    private router: Router,
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  onClickLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('name');

    // Delete the sessionID cookie
    this.cookieService.delete('sessionID');

    this.router.navigate(['/login']);
  }
}
