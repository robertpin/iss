import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PcmemberService {
  private url = "http://localhost:8080/api/";

  constructor(private httpClient: HttpClient) { }

  getFiles(conf: number, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    return this.httpClient.get<any>(this.url+"files/"+conf, httpOptions);
  }

  downloadAbstract(fname: string, token: string, conf:number) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      }),
      responseType: 'blob'
    };

    return this.httpClient.get(this.url+"download/abstract/"+fname, {headers: new HttpHeaders({
      "x-access-token": token,
      "conf": conf+""
    }),responseType: 'blob'});
    // return this.httpClient.get<any>(this.url+"download/abstract/"+fname,);
  }

  downloadPaper(fname: string, token: string, conf:number) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    return this.httpClient.get<any>(this.url+"download/paper/"+fname, httpOptions);
    // return this.httpClient.get<any>(this.url+"")
  }

  placeBid(pap: number, conf: number, agree: string, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    let req = {
      "paperId": pap,
      "agree": agree
    }

    return this.httpClient.post<any>(this.url+"bid", req, httpOptions);
  }

  getBids(conf: number, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    return this.httpClient.get<any>(this.url+"bid", httpOptions);
  }

  getReviews(conf, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    return this.httpClient.get<any>(this.url+"reviews", httpOptions);
  }

  sendReview(conf, recom, res, pid, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+""
      })
    };

    let req = {
      "pid": pid,
      "recom": recom,
      "result": res
    };

    return this.httpClient.put<any>(this.url+"reviews", req, httpOptions);
  }

  otherReviews(conf, pid, revid, token) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token,
        "conf": conf+"",
        "pid": pid+"",
        "revid":revid+""
      })
    };

    return this.httpClient.get<any>(this.url+"otherrevs", httpOptions);
  }
}
