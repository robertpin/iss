const db = require('../config/db.config');
const nodemailer = require('nodemailer');
const Op = db.Sequelize.Op;

exports.updateDeadlines = (req, res) => {
    db.conference.findOne({
        where: {id: req.headers["conf"]}
    }).then(conf => {
        let msg = "";
        if(new Date(req.body.absDeadline) > conf.absDeadline) {
            conf.update({absDeadline: req.body.absDeadline});
            msg += "Updated abstract deadline. ";
        }
        if(new Date(req.body.paperDeadline) > conf.paperDeadline) {
            conf.update({paperDeadline: req.body.paperDeadline});
            msg += "Updated paper deadline";
        }
        if(new Date(req.body.bidDeadline) > conf.bidDeadline) {
            conf.update({bidDeadline: req.body.bidDeadline});
            msg += "Updated bid deadline";
        }
        res.status(200).send({"response":msg});
    }).catch(err => {
        res.status(500).send(err);
    });
}

exports.getBids = (req, res) => {
    db.bids.findAll({
        include: [{
            model: db.conference,
            attributes: ['name'],
            where: {id: req.headers["conf"]}
        }, {
            model: db.pcmember,
            include: [{
                model: db.user,
                attributes: ['name', 'email', 'username']
            }, {
                model: db.reviews
            }]
        }, {
            model: db.papers
        }]
    }).then(bids => {
        res.status(200).json({
            "description": "bids",
            "bids": bids
        });
    }).catch(err => {
        res.status(500).send("Error: " + err);
    })
}

exports.assignReview = (req, res) => {
    db.reviews.findOne({
        include: [{
            model: db.papers,
            where: {id: req.body.paperId}
        }, {
            model: db.pcmember,
            where: {id: req.body.pcid}
        }]
    }).then(re => {
        if(!re) {
            db.reviews.create({}).then(rev => {
                db.pcmember.findOne({
                    where: {id: req.body.pcid}
                }).then(pc => {
                    pc.addReview(rev);
                });
                db.papers.findOne({
                    where: {id: req.body.paperId}
                }).then(paper => {
                    paper.addReview(rev);
                });
                res.status(200).send({"reponse":"Reviewer assigned"});
            }).catch(err => {
                res.status(500).send(err);
            });
        }
        else {
            res.status(200).send({"response":"Already assigned"});
        }
    }).catch(err => {
        res.status(500).send(err);
    })
}

exports.canGenerate = (req, res) => {
    db.papers.findAll({
        include: [{
            model: db.conference,
            where: {id: req.headers["conf"]}
        }, {
            model: db.reviews
        }]
    }).then(papers => {
        for(paper of papers) {
            if(paper.reviews.length<2) {
                return res.status(400).send("Not enough reviews");
            }
        }
        res.status(200).send({"response": "ok"});
    })
}

exports.generateResults = (req, res) => {
    db.papers.findAll({
        include: [{
            model: db.conference,
            attributes: ['name'],
            where: {id: req.headers["conf"]}
        }, {
            model: db.user,
            attributes: ['email']
        }]
    }).then(papers => {
        console.log("got papers");
        for(let paper of papers) {
            console.log("paper");
            db.reviews.findAll({
                include: [{
                    model: db.papers,
                    where: {id: paper.id}
                }]
            }).then(reviews => {
                let score = 0;
                for(let rev of reviews) {
                    score += rev.result;
                }
                if(score < 0) {
                    paper.update({
                        accepted: false
                    });
                }
                else if(score > 0) {
                    paper.update({
                        accepted: true
                    });
                }
                else {
                    paper.update({
                        accepted: null
                    });
                }
            })
        }
        res.status(200).send({"response":"Generated results"});
    }).catch(err => {
        res.status(500).send(err);
    })
}

exports.settleResult = (req, res) => {
    db.papers.findOne({
        where: {id: req.body.paperId}
    }).then(pap => {
        pap.update({accepted: req.body.result});
        res.status(200).send({"response":"Settled result"});
    }).catch(err => {
        res.status(500).send(err);
    });
}

async function sendEmail(dest, recom, acc) {
    if(acc == null)
        return;
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "confmansys@gmail.com",
            pass: "conferencems"
        }
    });

    let txt;
    if(!acc) {
        txt = "We are sorry to inform you that your paper has not been chosen for our conference. These are some recommandations from our reviewers. ";
    }
    else {
        txt = "We are happy to inform you that your paper has been chosen for our conference. These are some recommandations from our reviewers to improve your paper. ";
    }
    txt += recom;

    let info = await transporter.sendMail({
        from: '"Conference Management System" <confmansys@gmail.com>',
        to: dest,
        subject: "Conference review result",
        text: txt
    });

    console.log("Message sent: " + info.messageId);
}

exports.sendResults = (req, res) => {
    // console.log("asdfdsgfdgbbfsa");
    db.papers.findOne({
        where: {accepted: null},
        include: [{
            model: db.conference,
            where: {id: req.headers["conf"]}
        }]
    }).then(pap => {
        if(!pap) {
            db.papers.findAll({
                include: [{
                    model: db.conference,
                    attributes: ['name'],
                    where: {id: req.headers["conf"]}
                }, {
                    model: db.reviews,
                    attributes: ['recommandation']
                }, {
                    model: db.user,
                    attributes: ['email']
                }]
            }).then(papers => {
                for(let paper of papers) {
                    let recom = "";
                    for(let rec of paper.reviews)
                        recom += rec.recommandation + ". ";
                    sendEmail(paper.user.email, recom, paper.accepted);
                }
                res.status(200).send({"response":"Emails sent"});
            }).catch(err => {
                res.status(500).send(err);
            })
        }
        else {
            res.status(200).send({"response": "Error. Some paper's result not settled"});
        }
    }).catch(err => {
        res.status(500).send(err);
    });
}

exports.getPcmembers = (req, res) => {
    db.pcmember.findAll({
        include: [{
            model: db.conference,
            where: {id: req.headers["conf"]}
        }, {
            model: db.user
        }]
    }).then(pcs => {
        res.status(200).json({"response": pcs});
    }).catch(err => {
        res.status(500).send(err);
    })
}

exports.getAcceptedPapers = (req, res) => {
    db.papers.findAll({
        where: {accepted: true},
        include: [{
            model: db.conference,
            where: {id: req.headers["conf"]}
        }, {
            model: db.user
        }]
    }).then(papers => {
        res.status(200).json({"response": papers});
    }).catch(err => {
        res.status(500).send(err);
    })
}

exports.assignSession = (req, res) => {
    db.sessions.create({
        room: req.body.room,
        time: req.body.time
    }).then(sess => {
        db.conference.findOne({
            where: {id: req.headers["conf"]}
        }).then(conf => {
            conf.addSession(sess);
        });
        db.pcmember.findOne({
            where: {id: req.body.sessionChair}
        }).then(pc => {
            pc.addSession(sess);
        });
        res.status(200).send({"response":"Session saved"});
    }).catch(err => {
        res.status(500).send(err);
    })
}

exports.getSessions = (req, res) => {
    db.sessions.findAll({
        include: [{
            model: db.conference,
            where: {id: req.headers["conf"]}
        }, {
            model: db.pcmember,
            include: [{
                model: db.user
            }]
        }]
    }).then(sess => {
        res.status(200).send({"response": sess});
    })
}

exports.assignSpeakers = (req, res) => {
    db.pcmember.findOne({
        include: [{
            model: db.conference,
            where: {id: req.headers["conf"]}
        }, {
            model: db.user,
            where: {id: req.body.uid}
        }]
    }).then(pc => {
        if(pc) {
            console.log("found pc\n");
            db.sessions.findOne({
                where: {id: req.body.session},
                include: [{
                    model: db.pcmember
                }]
            }).then(sess => {
                if(sess.pcmember.id == pc.id){
                    res.status(400).send("Session chair cannot be speaker at same session");
                    return;
                }
                db.speakers.findOne({
                    include: [{
                        model: db.user,
                        where: {id: req.body.uid}
                    }, {
                        model: db.sessions,
                        where: {id: req.body.session}
                    }]
                }).then(spk => {
                    if(!spk) {
                        db.speakers.create({}).then(sp => {
                            sess.addSpeaker(sp);
                            db.user.findOne({
                                where: {id: req.body.uid}
                            }).then(user => {
                                user.addSpeaker(sp);
                            })
                        });
                        res.status(200).send({"response":"Speaker added"});
                    }
                    else {
                        res.status(200).send({"response":"Speaker already added"});
                    }
                })
            });
        }
        else {
            db.sessions.findOne({
                where: {id: req.body.session}
            }).then(sess => {
                db.speakers.findOne({
                    include: [{
                        model: db.user,
                        where: {id: req.body.uid}
                    }, {
                        model: db.sessions,
                        where: {id: req.body.session}
                    }]
                }).then(spk => {
                    if(!spk) {
                        db.speakers.create({}).then(sp => {
                            sess.addSpeaker(sp);
                            db.user.findOne({
                                where: {id: req.body.uid}
                            }).then(user => {
                                user.addSpeaker(sp);
                            })
                        });
                        res.status(200).send({"response":"Speaker added"});
                    }
                    else {
                        res.status(200).send({"response":"Speaker already added"});
                    }
                })
            })
        }
    })
}