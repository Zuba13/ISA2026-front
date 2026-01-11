import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { tap } from "rxjs/operators";

@Injectable()
export class AuthService {
  private apiUrl = 'http://localhost/api';

  constructor(private http: HttpClient) {
  }

  login(values: any) {
    return this.http.post(`${this.apiUrl}/login`, values)
      .pipe(
        tap((res: any) => {
          if (res && res.access_token) {
            localStorage.setItem('access_token', res.access_token);
            // Store user data if available in response
            if (res.user) {
              localStorage.setItem('user', JSON.stringify(res.user));
            }
          }
        })
      );
  }

  register(values: any) {
    // Backend requires password confirmation
    const payload = {
      ...values,
      password_confirmation: values.password
    };
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  getUser(id: any) {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }
}
