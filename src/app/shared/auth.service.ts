import {HttpClient} from "@angular/common/http";

export class AuthService{
  submitPostRequest(isLoginPage:boolean, values: string, http:HttpClient) {
    if(isLoginPage) {
      http.post('http://localhost:8080/api/auth/login', values)
        .subscribe((res:any) => {
          console.log(res);
        })
    }
    else
    {
      http.post('http://localhost:8080/api/auth/register', values)
        .subscribe((res:any) => {
          console.log(res);
        })
    }
  }
}
