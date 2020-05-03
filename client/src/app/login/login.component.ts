import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from './../services/user.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: string;
  password: string;
  msg: string;
  eror: string;

  constructor(private userService: UserService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    if(this.route.snapshot.params["user"]) {
      this.user = this.route.snapshot.params["user"];
    }
  }

  login() {
    this.userService.signin(this.user, this.password).subscribe(res => {
      this.msg = "Successfully logged in";
      this.eror = "alert alert-success"
      localStorage.setItem("token", res.accessToken);
      setTimeout(() => {
        this.router.navigate(["profile"]);
      }, 1600);
    }, err => {
      this.msg = err.error;
      this.eror = "alert alert-danger"
      console.error(err);
    })
  }

}
