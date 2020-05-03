import { Conference } from './../models/conference.module';
import { ConferenceService } from './../services/conference.service';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-conf-details',
  templateUrl: './conf-details.component.html',
  styleUrls: ['./conf-details.component.css']
})
export class ConfDetailsComponent implements OnInit {
  @Input() conf: Conference;

  constructor(private confservice: ConferenceService, 
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.route.params.pipe(switchMap((params: Params) => this.confservice.getConference(+params["id"]))).subscribe(con => this.conf=con);
  }

  getDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  gotoRegistration() {
    this.router.navigate(["/register", this.conf.id]);
  }

}
