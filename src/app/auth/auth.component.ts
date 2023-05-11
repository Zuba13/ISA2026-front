import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";
import {AuthService} from "../shared/auth.service";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  providers: [AuthService]
})
export class AuthComponent implements OnInit{
  form!: FormGroup;
  isLoginPage = true;
  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
  }
  ngOnInit() {
    this.form = this.formBuilder.group({
      username: '',
      password: '',
      email: '',
      gender: '',
      name: '',
      surname: ''
    })
    this.route.url.subscribe(params => {
      this.isLoginPage = params[0].path === 'login';
    })

  }
  submit(){
    this.authService.submitPostRequest(this.isLoginPage, this.form.getRawValue(), this.http)
  }
}
