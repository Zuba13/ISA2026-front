import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../shared/auth.service";

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css'],
  providers: [AuthService]
})
export class PublicProfileComponent implements OnInit {
  user: any;

  constructor(private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.authService.getUser(params['id']).subscribe({
        next: (user) => {
          this.user = user;
        },
        error: (err) => {
          console.error(err);
        }
      });
    });
  }
}
