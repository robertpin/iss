import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChairService {
  private url = "http://localhost:8080/api/";

  constructor(private httpClient: HttpClient) { }

  updateDeadlines(conf, abs, pap, bid, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };
    let req = {
      "absDeadline": abs,
      "paperDeadline": pap,
      "bidDeadline": bid
    };

    return this.httpClient.post<any>(this.url+"deadlines", req, httpOptions);
  }

  getBids(conf, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    return this.httpClient.get<any>(this.url+"bids", httpOptions);
  }

  assignReview(conf, paper, pcid, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };
    let req = {
      "paperId": paper,
      "pcid": pcid
    }

    return this.httpClient.post<any>(this.url+"reviews", req, httpOptions);
  }

  generateResults(conf, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    return this.httpClient.get<any>(this.url+"results", httpOptions);
  }

  canGenerate(conf, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    return this.httpClient.get<any>(this.url+"result", httpOptions);
  }

  settleResult(conf, pid, acc, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    let req = {
      "paperId": pid,
      "result": acc
    }

    return this.httpClient.put<any>(this.url+"results", req, httpOptions);
  }

  sendResults(conf, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };
    // console.log("asfdsf");

    return this.httpClient.post<any>(this.url+"results",{} , httpOptions);
  }

  getPcmembers(conf, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    return this.httpClient.get<any>(this.url+"pcmembers", httpOptions);
  }

  assignSession(conf, room, time, pid, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    let req = {
      "room": room,
      "time": time,
      "sessionChair": pid
    }

    return this.httpClient.post<any>(this.url+"sessions", req, httpOptions);
  }

  getSessions(conf, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    return this.httpClient.get<any>(this.url+"sessions", httpOptions);
  }

  getAcceptedPapers(conf, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    return this.httpClient.get<any>(this.url+"accepted", httpOptions);
  }

  addSpeaker(conf, sess, uid, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    let req = {
      "session": sess,
      "uid": uid
    };

    return this.httpClient.post<any>(this.url+"speakers", req, httpOptions);
  }
}
