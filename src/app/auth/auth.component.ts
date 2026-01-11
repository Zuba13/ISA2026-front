import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
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
  submitted = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]],
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.route.url.subscribe(params => {
      this.isLoginPage = params[0].path === 'login';
      if (this.isLoginPage) {
        // Remove registration validators for login
        this.form.get('username')?.clearValidators();
        this.form.get('password_confirmation')?.clearValidators();
        this.form.get('address')?.clearValidators();
        this.form.get('name')?.clearValidators();
        this.form.get('surname')?.clearValidators();
        this.form.get('password')?.setValidators([Validators.required]);
      } else {
        // Ensure all are set for registration
        this.form.get('username')?.setValidators([Validators.required]);
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.form.get('password_confirmation')?.setValidators([Validators.required]);
        this.form.get('address')?.setValidators([Validators.required]);
        this.form.get('name')?.setValidators([Validators.required]);
        this.form.get('surname')?.setValidators([Validators.required]);
      }
      this.form.get('username')?.updateValueAndValidity();
      this.form.get('password')?.updateValueAndValidity();
      this.form.get('password_confirmation')?.updateValueAndValidity();
      this.form.get('address')?.updateValueAndValidity();
      this.form.get('name')?.updateValueAndValidity();
      this.form.get('surname')?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmation = control.get('password_confirmation');
    if (password && confirmation && password.value !== confirmation.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

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
          alert(err.error?.message || 'Login failed. Please check your credentials.');
        }
      });
    }
    else {
      this.authService.register(rawValue).subscribe({
        next: (res: any) => {
          alert(res.message || 'Registration successful! Please check your email for activation.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Registration failed.');
        }
      });
    }
  }
}
