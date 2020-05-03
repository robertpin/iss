import { User } from './../models/user.module';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = "http://localhost:8080/api";

  constructor(private httpClient: HttpClient) { }

  signUp(name: string, affiliation: string, email: string, webpage: string, username:string, password: string, conf: number) {
    let user = {
      "name": name,
      "affiliation": affiliation,
      "email": email,
      "webpage": webpage,
      "username": username,
      "password": password,
      "conference": conf
    };

    return this.httpClient.post<any>(this.url+"/signup", user);
  }

  signin(user: string, password: string) {
    let req = {
      "username": user,
      "password": password
    };

    return this.httpClient.post<any>(this.url+"/signin", req);
  }

  profile(token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "x-access-token": token
      })
    };

    return this.httpClient.get<any>(this.url+"/user", httpOptions);
  }

  enroll(conf: number, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "x-access-token": token
      })
    };

    let req = {
      "conference": conf
    };
    return this.httpClient.post<any>(this.url+"/enroll", req, httpOptions);
  }

  updateUser(user: User, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "x-access-token": token
      })
    };
    return this.httpClient.put<any>(this.url+"/user", user, httpOptions);
  }

  updatePassword(user: User, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "x-access-token": token
      })
    };
    return this.httpClient.put<any>(this.url+"/user/pass", user, httpOptions);
  }

  deleteAccount(token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "x-access-token": token
      })
    };
    return this.httpClient.delete<any>(this.url+"/user", httpOptions);
  }

  uploadAbstract(conf: number,file:any, name:string, topics:string, keywords: string, coauthors: string, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token
      })
    };

    let fData = new FormData();
    fData.append("conference", conf+"");
    fData.append("name", name);
    fData.append("topics", topics);
    fData.append("keywords", keywords);
    fData.append("coauthors", coauthors);
    fData.append("abstract", file, file.name);

    return this.httpClient.post<any>(this.url+"/abstract", fData, httpOptions);
  }

  uploadPaper(conf: number,file:any, name:string, topics:string, keywords: string, coauthors: string, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token
      })
    };

    let fData = new FormData();
    fData.append("conference", conf+"");
    fData.append("name", name);
    fData.append("topics", topics);
    fData.append("keywords", keywords);
    fData.append("coauthors", coauthors);
    fData.append("paper", file, file.name);

    return this.httpClient.post<any>(this.url+"/paper", fData, httpOptions);
  }

  getConferences(token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token
      })
    };

    return this.httpClient.get<any>(this.url+"/confs",httpOptions);
  }

  isPC(conf: number, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token
      })
    };

    return this.httpClient.get<any>(this.url+"/pc/"+conf, httpOptions);
  }

  isChair(conf: number, token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "x-access-token": token
      })
    };

    return this.httpClient.get<any>(this.url+"/chair/"+conf, httpOptions);
  }
}
