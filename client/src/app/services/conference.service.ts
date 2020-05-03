import { Conference } from './../models/conference.module';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConferenceService {
  private confUrl = "http://localhost:8080/api/conferences";

  constructor(private httpClient: HttpClient) { }

  getConferences(): Observable<any> {
    return this.httpClient.get<any>(this.confUrl);
  }

  getConference(id: number) {
    return this.getConferences().pipe(map(confs => confs.conferences.find(conf => conf.id == id)));
  }
}
