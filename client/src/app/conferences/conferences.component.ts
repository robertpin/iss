import { Conference } from './../models/conference.module';
import { ConferenceService } from './../services/conference.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-conferences',
  templateUrl: './conferences.component.html',
  styleUrls: ['./conferences.component.css']
})
export class ConferencesComponent implements OnInit {
  confs: Conference[] = [];

  constructor(private confService: ConferenceService,
    private router: Router) { }

  ngOnInit() {
    this.confService.getConferences().subscribe(cons => {
      console.log(cons.conferences);
      this.confs = cons.conferences;
    })
  }

  gotoConf(id: number) {
    this.router.navigate(["/conference", id]);
  }

}
