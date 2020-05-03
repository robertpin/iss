import { ChairService } from './../services/chair.service';
import { PcmemberService } from './../services/pcmember.service';
import { Conference } from './../models/conference.module';
import { ConferenceService } from './../services/conference.service';
import { UserService } from './../services/user.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  pc: boolean;
  crt: string = "author";
  user: User;
  topics: string;
  keywords: string;
  coauthors: string;
  abstract: any;
  paper: any;
  msg: string;
  confs: Conference[];
  val: number;
  name: string;
  files: any[];
  chair: boolean;
  selectedConf: Conference;

  constructor(private userService: UserService, private router: Router,
              private pcService: PcmemberService, private chairService: ChairService) { }

  ngOnInit() {
    this.userService.profile(localStorage.getItem("token")).subscribe(res => {
      this.user = res.user;
    });
    this.userService.getConferences(localStorage.getItem("token")).subscribe(cns => {
      this.confs = cns.response;
      this.val = this.confs[0].id;
      this.confChanged();
    });
  }

  confChanged() {
    for(let cn of this.confs)
      if(cn.id == this.val)
        this.selectedConf = cn;
    this.userService.isPC(this.val, localStorage.getItem("token")).subscribe(res => {
      this.pc = res.response;
      this.crt = "author";
      if(this.pc) {
        this.userService.isChair(this.val, localStorage.getItem("token")).subscribe(res => {
          this.chair = res.response;
          if(this.chair)
            this.crt="chair";
            this.roleChanged();
        })
      }
    })
  }

  //--------------------------------------- user settings ---------------------------------------------
  updateUser() {
    this.userService.updateUser(this.user, localStorage.getItem("token")).subscribe(res => {
      this.msg = res.response;
      setTimeout(() => {
        this.msg = null;
      }, 2000);
    }, err => {
      this.msg = err.error;
      setTimeout(() => {
        this.msg = null;
      }, 4000);
    })
  }

  updatePassword() {
    this.userService.updatePassword(this.user, localStorage.getItem("token")).subscribe(res => {
      this.msg = res.response;
      setTimeout(() => {
        this.msg = null;
      }, 2000);
    }, err => {
      this.msg = err.error;
      setTimeout(() => {
        this.msg = null;
      }, 4000);
    })
  }

  deleteAccount() {
    this.userService.deleteAccount(localStorage.getItem("token")).subscribe(res => {
      this.msg = res.response;
      setTimeout(() => {
        this.msg = null;
      }, 2000);
      localStorage.setItem("token", "");
      setTimeout(() => {
        this.router.navigate([""]);
      }, 2500);
    }, err => {
      this.msg = err.error;
      setTimeout(() => {
        this.msg = null;
      }, 4000);
    })
  }

  //--------------------------------------- user upload ---------------------------------------------
  aFileChange(event) {
    this.abstract = event.target.files[0];
  }

  pFileChange(event) {
    this.paper = event.target.files[0];
  }

  uploadAbstract() {
    this.userService.uploadAbstract(this.val,this.abstract, this.name, this.topics, this.keywords, this.coauthors, localStorage.getItem("token")).subscribe(res => {
      this.msg = res.response;
      setTimeout(() => {
        this.msg = null;
      }, 2000);
    });
  }

  uploadPaper() {
    this.userService.uploadPaper(this.val,this.paper, this.name, this.topics, this.keywords, this.coauthors, localStorage.getItem("token")).subscribe(res => {
      this.msg = res.response;
      setTimeout(() => {
        this.msg = null;
      }, 2000);
    });
  }

  logout() {
    localStorage.setItem("token", "");
    this.router.navigate([""]);
  }

  //-------------------------------------------- pc -----------------------------------------------------
  pcCrt:string = "bids";
  reviews: any[];
  otherRevs: any[] = [];
  roleChanged() {
    if(this.crt == "pc") {
      this.getFiles();
      setTimeout(()=>{
        for(let i=0; i<this.files.length; i++)
        this.agrees.push("");
      }, 500);
      this.getBids();
      this.getReviews();
    }
    if(this.crt == "chair") {
      this.getFiles();
      this.getAllBids();
      this.getPcMembers();
      this.getSessions();
      this.getAcceptedPapers();
      // this.getSpeakers();
    }
  }

  getFiles() {
    this.pcService.getFiles(this.val, localStorage.getItem("token")).subscribe(res => {
      this.files = res.papers.filter(pap => pap.user.id != this.user.id);
    });
  }

  getReviews() {
    this.pcService.getReviews(this.val, localStorage.getItem("token")).subscribe(res => {
      this.reviews = res.response;
    })
  }

  sendReview(recom, result, paperId) {
    this.pcService.sendReview(this.val, recom, result, paperId, localStorage.getItem("token")).subscribe(res => {
      this.msg = res.response;
      setTimeout(() => {
        this.msg = null;
      }, 2000);
    })
  }

  otherReviews(pid, revid) {
    this.pcService.otherReviews(this.val, pid, revid, localStorage.getItem("token")).subscribe(res => {
      this.otherRevs = res.response;
      // console.log(res.response);
    })
  }

  flatten(arr) {
    return arr.map(obj => obj.name).join('; ');
  }

  downloadAbstract(abs) {
    this.pcService.downloadAbstract(abs, localStorage.getItem("token"), this.val).subscribe(_ => {
      console.log("Downloaded");
    }, err => {
      console.log(err);
    })
  }

  downloadPaper(pap) {
    this.pcService.downloadPaper(pap, localStorage.getItem("token"), this.val).subscribe(_ => {
      console.log("Downloaded");
    }, err => {
      window.open(err.url, "_blank");
    })
  }

  agrees: string[] = [];
  bids: any[];
  placeBid(pap) {
    if(this.agrees[pap]!=undefined) {
      this.pcService.placeBid(pap, this.val, this.agrees[pap], localStorage.getItem("token")).subscribe(res => {
        this.msg = res.response;
        setTimeout(() => {
          this.msg = null;
        }, 2000);
      })
    }
  }

  getBids() {
    this.pcService.getBids(this.val, localStorage.getItem("token")).subscribe(res => {
      this.bids = res.bids;
      for(let bid of this.bids) {
        this.agrees[bid.paperId] = bid.agree;
      }
    });
  }

  //------------------------------------------------- chair -------------------------------------------------------
  chairCrt:string = "bids";
  updateDeadlines() {
    this.chairService.updateDeadlines(this.val, this.selectedConf.absDeadline,
      this.selectedConf.paperDeadline, this.selectedConf.bidDeadline, localStorage.getItem("token")).subscribe(res => {
        this.msg = res.response;
        setTimeout(()=> {
          this.msg = null;
        }, 2000);
      })
  }

  allBids;
  getAllBids() {
    this.chairService.getBids(this.val, localStorage.getItem("token")).subscribe(res => {
      this.allBids=res.bids;
    })
  }

  assignReview(paperId, pcid) {
    this.chairService.assignReview(this.val, paperId, pcid, localStorage.getItem("token")).subscribe(res => {
      this.msg = res.response;
      setTimeout(()=>{
        this.msg = null;
      }, 2000);
    })
  }

  generateResults() {
    this.chairService.canGenerate(this.val, localStorage.getItem("token")).subscribe(res => {
      this.chairService.generateResults(this.val, localStorage.getItem("token")).subscribe(res => {
        this.msg = res.response;
        setTimeout(() => {
          this.msg=null;
        }, 2000);
      });
    }, err => {
      console.log(err);
      this.msg = err.error;
      setTimeout(() => {
        this.msg=null;
      }, 4000);
    })
  }

  updateResult(pid, accepted) {
    this.chairService.settleResult(this.val, pid, accepted, localStorage.getItem("token")).subscribe(res => {
      this.msg = res.response;
      setTimeout(()=>{
        this.msg = null;
      }, 2000);
    })
  }

  sendResults() {
    this.chairService.sendResults(this.val, localStorage.getItem("token")).subscribe(res => {
      this.msg = res.response;
      setTimeout(()=>{
        this.msg = null;
      }, 2000);
    })
  }

  room: string;
  datt: Date;
  pcmembers: any[];
  sessionChair: number;
  sessions: any[];
  // speakers: any[];
  speaker: any;
  acPapers: any[];
  // nSpeakers: any[];
  getPcMembers() {
    this.chairService.getPcmembers(this.val, localStorage.getItem("token")).subscribe(res => {
      this.pcmembers = res.response;
    });
  }

  saveSession() {
    if(this.sessionChair == undefined) {
      this.msg = "Please select session chair";
      setTimeout(()=>{
        this.msg = null;
      }, 2000);
      return;
    }
    this.chairService.assignSession(this.val, this.room, this.datt+":00.000Z", this.sessionChair, localStorage.getItem("token")).subscribe(res => {
      this.msg = res.response;
      setTimeout(()=>{
        this.msg = null;
      }, 2000);
      this.getSessions();
    })
  }

  getSessions() {
    this.chairService.getSessions(this.val, localStorage.getItem("token")).subscribe(res => {
      this.sessions = res.response;
    }, err => {
      console.log(err);
    })
  }

  getAcceptedPapers() {
    this.chairService.getAcceptedPapers(this.val, localStorage.getItem("token")).subscribe(res => {
      this.acPapers = res.response;
    })
  }

  addSpeaker(sess) {
    // console.log(sess);
    // console.log(this.speaker);
    this.chairService.addSpeaker(this.val, sess, this.speaker, localStorage.getItem("token")).subscribe(res => {
      this.msg = res.response;
      setTimeout(()=>{
        this.msg = null;
      }, 2000);
    }, err => {
      this.msg = err.error;
      setTimeout(()=>{
        this.msg = null;
      }, 3000);
    })
  }
}
