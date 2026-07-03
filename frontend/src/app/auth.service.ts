import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AuthService {
  private authState = new BehaviorSubject<{ name?: string; email?: string; loggedIn: boolean }>({ loggedIn: false });
  auth$ = this.authState.asObservable();

  constructor(private http: HttpClient) { }

  login() {
    return this.http.get<{ authUrl: string }>('/api/auth/google');
  }

  logout() {
    return this.http.post('/api/auth/logout', {});
  }

  setUser(user: { name: string; email: string }) {
    this.authState.next({ ...user, loggedIn: true });
  }

  clearUser() {
    this.authState.next({ loggedIn: false });
  }
}
