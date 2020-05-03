import { HttpHeaders } from '@angular/common/http';
import { User } from './../models/user.module';
import { UserService } from './../services/user.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  logged: boolean = false;
  confId: number;
  user: User = new User();
  alertMsg: string;
  eror: string;

  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => this.confId = +params["id"]);
    if(localStorage.getItem("token")!="" && localStorage.getItem("token")!= null) {
      this.logged = true;
    }
  }

  register() {
    this.userService.signUp(this.user.name, this.user.affiliation, this.user.email, this.user.webpage, this.user.username, this.user.password, this.confId).subscribe(res => {
      this.alertMsg = res.response;
      this.eror = "alert alert-success";
      setTimeout(() => {
        this.router.navigate(["/signin", this.user.username]);
      }, 1500);
    }, err => {
      this.alertMsg = err.error;
      this.eror = "alert alert-danger";
    })
  }

  enroll() {
    this.userService.enroll(this.confId, localStorage.getItem("token")).subscribe(res => {
      this.alertMsg = res.response;
      this.eror = "alert alert-success";
      setTimeout(() => {
        this.router.navigate(["profile"]);
      }, 2000);
    }, err => {
      this.alertMsg = err.error.response;
      this.eror = "alert alert-danger";
      setTimeout(() => {
        this.router.navigate(["profile"]);
      }, 2000);
    });
  }

}
