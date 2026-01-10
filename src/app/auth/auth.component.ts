import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../shared/auth.service";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  providers: [AuthService]
})
export class AuthComponent implements OnInit {
  form!: FormGroup;
  isLoginPage = true;
  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }
  ngOnInit() {
    this.form = this.formBuilder.group({
      username: '',
      password: '',
      email: '',
      address: '',
      name: '',
      surname: ''
    })
    this.route.url.subscribe(params => {
      this.isLoginPage = params[0].path === 'login';
    })

  }
  submit() {
    const rawValue = this.form.getRawValue();
    if (this.isLoginPage) {
      this.authService.login({
        email: rawValue.email,
        password: rawValue.password
      }).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error(err);
          alert('Login failed. Please check your credentials.');
        }
      });
    }
    else {
      this.authService.register(rawValue).subscribe({
        next: () => {
          alert('Registration successful! Please login.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          alert('Registration failed. Username or Email might be taken.');
        }
      });
    }
  }
}
