import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";

@Injectable()
export class AuthService{
  constructor(private http: HttpClient) {
  }

  login(values: string) {
    this.http.post('http://localhost:8080/api/auth/login', values)
      .subscribe((res: any) => {
        console.log(res);
      })
  }
  register(values: string) {
      this.http.post('http://localhost:8080/api/auth/register', values)
        .subscribe((res:any) => {
          console.log(res);
        })
  }
}
