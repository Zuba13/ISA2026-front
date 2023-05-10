import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit{
  form!: FormGroup;
  isLoginPage = true;
  constructor(
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
    if(this.isLoginPage) {
      this.http.post('http://localhost:8080/api/auth/login', this.form.getRawValue())
        .subscribe((res:any) => {
          console.log(res);
        })
    }
    else
    {
      this.http.post('http://localhost:8080/api/auth/register', this.form.getRawValue())
        .subscribe((res:any) => {
          console.log(res);
        })
    }
  }
}
