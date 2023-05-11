import {HttpClient} from "@angular/common/http";

export class AuthService{
  login(values: string, http:HttpClient) {
    http.post('http://localhost:8080/api/auth/login', values)
      .subscribe((res: any) => {
        console.log(res);
      })
  }
  register(values: string, http:HttpClient) {
      http.post('http://localhost:8080/api/auth/register', values)
        .subscribe((res:any) => {
          console.log(res);
        })
  }
}
