const db = require('../config/db.config');
const config = require('../config/config');
const User = db.user;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Op = db.Sequelize.Op;
const path = require('path');

exports.getConferences = (req, res) => {
    db.conference.findAll({}).then(confs => {
        res.status(200).json({"conferences": confs});
    })
}

exports.signup = (req, res) => {
    console.log("Sign up function");

    User.create({
        name: req.body.name,
        affiliation: req.body.affiliation,
        email: req.body.email,
        webpage: req.body.webpage,
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 8)
    }).then(user => {
        db.conference.findAll({
            where: {
                id: req.body.conference
            }
        }).then(conf => {
            user.setConferences(conf).then(() => {
                res.status(200).send({"response":"User registered successfully"});
            });
        }).catch(err => {
            res.status(500).send("Error: " + err);
        });
    }).catch(err => {
        res.status(500).send("Error: " + err);
    });
}

exports.enroll = (req, res) => {
    db.conference.findOne({
        where: {id: req.body.conference},
        include: [{
            model: db.user,
            where: {id: req.userId}
        }]
    }).then(cnf => {
        if(!cnf) {
            db.conference.findOne({
                where: {id: req.body.conference}
            }).then(conf => {
                db.user.findOne({
                    where: {id: req.userId}
                }).then(user => {
                    conf.addUser(user);
                    res.status(200).send({"response":"Enrolled"});
                });
            }).catch(err => {
                res.status(500).send(err);
            })
        }
        else {
            res.status(400).send({"response": "Already enrolled"});
        }
    }).catch(err => {
        res.status(500).send(err);
    })
    
}

exports.signin = (req, res) => {
    console.log("Sign in function");

    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if(!user) {
            return res.status(404).send("User not found");
        }

        let isValid = bcrypt.compareSync(req.body.password, user.password);
        if(!isValid) {
            return res.status(401).send("Invalid password");
        }

        let token = jwt.sign({id: user.id}, config.secret, {
            expiresIn: 86400
        });

        res.status(200).send({auth: true, accessToken: token});
    }).catch(err => {
        res.status(500).send(err);
    });
}

exports.userContent = (req, res) => {
    User.findOne({
        where: {id: req.userId},
        attributes: ['id', 'name', 'affiliation', 'email', 'webpage', 'username'],
        include: [{
            model: db.conference,
            attributes: ['name', 'begin', 'end', 'absDeadline', 'paperDeadline', 'bidDeadline'],
            through: {
                attributes: ['userId', 'conferenceId']
            }
        }]
    }).then(user => {
        res.status(200).json({
            "description": "user content",
            "user": user
        });
    }).catch(err => {
        res.status(500).json({
            "description": "Could not access page",
            "error": err
        });
    })
}

exports.updateUser = (req, res) => {
    User.update({
        name: req.body.name,
        affiliation: req.body.affiliation,
        email: req.body.email,
        webpage: req.body.webpage,
        username: req.body.username,
    }, {
        where: { id: req.userId }
    }).then(user => {
        res.status(200).json({"response":"Updated successfully"});
    }).catch(err => {
        res.status(500).send(err);
    })
}

exports.updatePassword = (req, res) => {
    User.update({
        password: bcrypt.hashSync(req.body.password, 8)
    }, {where: {id: req.userId}
    }).then(user => {
        res.status(200).send({"response":"Password updated"});
    }).catch(err => {
        res.status(500).send(err);
    })
}

exports.deleteUser = (req, res) => {
    User.destroy({
        where: {id: req.userId}
    }).then(() => {
        res.status(200).send({"response":"Deleted user"});
    }).catch(err => {
        res.status(500).send(err);
    });
}

const addKeywords = (keywords, paper) => {
    let keys = [];
    let idx = keywords.indexOf(';'),
        lastIdx = 0;
    while(idx != -1) {
        let key = keywords.slice(lastIdx, idx);
        keys.push(key.trim());
        lastIdx = idx+1;
        idx = keywords.indexOf(';', idx+1);
    }
    for(let ks of keys) {
        db.keywords.findOne({
            where: {name: ks}
        }).then(wd => {
            if(!wd) {
                db.keywords.create({
                    name: ks
                }).then(word => {
                    paper.addKeyword(word);
                });
            }
            else {
                paper.addKeyword(wd);
            }
        });
    }
}

const addTopics = (topics, paper) => {
    let tops = [];
    let idx = topics.indexOf(';'),
        lastIdx = 0;
    while(idx != -1) {
        let top = topics.slice(lastIdx, idx);
        tops.push(top.trim());
        lastIdx = idx+1;
        idx = topics.indexOf(';', idx+1);
    }
    for(let ks of tops) {
        db.topics.findOne({
            where: {name: ks}
        }).then(wd => {
            if(!wd) {
                db.topics.create({
                    name: ks
                }).then(word => {
                    paper.addTopic(word);
                });
            }
            else {
                paper.addTopic(wd);
            }
        });
    }
}

const addCoAuthors = (authors, paper) => {
    let tops = [];
    let idx = authors.indexOf(';'),
        lastIdx = 0;
    while(idx != -1) {
        let top = authors.slice(lastIdx, idx);
        tops.push(top.trim());
        lastIdx = idx+1;
        idx = authors.indexOf(';', idx+1);
    }
    for(let ks of tops) {
        db.coauthors.findOne({
            where: {name: ks}
        }).then(wd => {
            if(!wd) {
                db.coauthors.create({
                    name: ks
                }).then(word => {
                    paper.addCoauthor(word);
                });
            }
            else {
                paper.addCoauthor(wd);
            }
        });
    }
}

exports.uploadAbstract = (req, res) => {
    if(!req.files) {
        return res.status(400).send("No file uploaded");
    }
    let abt = req.files.abstract;

    if(abt.mimetype != "application/pdf" && abt.mimetype != "application/msword" && abt.mimetype != "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        return res.status(400).send({"error":"Invalid file format"});
    }
    const fname = req.userId+"@"+req.body.conference+abt.name.slice(abt.name.indexOf('.'));
    abt.mv(path.resolve("app/uploaded_files/abstracts/"+fname), function(err) {
        if(err != undefined)
            return res.status(500).send(err);
        // console.log(err + " happened");
    });
    db.papers.findOne({
        where: {
            [Op.or]: [{ abstract_file: fname}, {paper_file: fname}]
        }
    }).then(pap => {
        if(!pap) {
            db.papers.create({
                name: req.body.name,
                abstract_file: fname
            }).then((paper) => {
                User.findOne({
                    where: {id: req.userId}
                }).then(user => {
                    user.addPaper(paper).then(() => {
                        console.log("Abstract user added");
                    });
                });
                db.conference.findOne({
                    where: {id: req.body.conference}
                }).then(conf => {
                    conf.addPaper(paper).then(() => {
                        console.log("Abstract conference added");
                    });
                });
                addKeywords(req.body.keywords, paper);
                addTopics(req.body.topics, paper);
                addCoAuthors(req.body.coauthors, paper);
            });
        }
        else {
            pap.update({ abstract_file: fname, name: req.body.name});
            addKeywords(req.body.keywords, pap);
            addTopics(req.body.topics, pap);
            addCoAuthors(req.body.coauthors, pap);
        }
        res.status(200).send({"response":"Abstract uploaded successfully"});
    });
}

exports.uploadPaper = (req, res) => {
    if(!req.files) {
        return res.status(400).send("No file uploaded");
    }

    let pap = req.files.paper;

    if(pap.mimetype != "application/pdf" && pap.mimetype != "application/msword" && pap.mimetype != "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        return res.status(400).send({"error":"Invalid file format"});
    }

    const fname = req.userId+"@"+req.body.conference+pap.name.slice(pap.name.indexOf('.'));

    pap.mv(path.resolve("app/uploaded_files/papers/"+fname), function(err) {
        if(err != undefined)
            return res.status(500).send(err);
        // console.log(err + " happened");
    });

    db.papers.findOne({
        where: {
            [Op.or]: [{ abstract_file: fname}, {paper_file: fname}]
        }
    }).then(pap => {
        if(!pap) {
            db.papers.create({
                name: req.body.name,
                paper_file: fname
            }).then((paper) => {
                User.findOne({
                    where: {id: req.userId}
                }).then(user => {
                    user.addPaper(paper).then(() => {
                        console.log("Paper user added");
                    });
                });
                db.conference.findOne({
                    where: {name: req.body.conference}
                }).then(conf => {
                    conf.addPaper(paper).then(() => {
                        console.log("Paper conference added");
                    });
                });
                addKeywords(req.body.keywords, paper);
                addTopics(req.body.topics, paper);
                addCoAuthors(req.body.coauthors, paper);
            });
        }
        else {
            pap.update({ paper_file: fname, name: req.body.name});
            addKeywords(req.body.keywords, pap);
            addTopics(req.body.topics, pap);
            addCoAuthors(req.body.coauthors, pap);
        }
        res.status(200).send({"response":"Paper uploaded successfully"});
    });
}

exports.getConference = (req, res) => {
    db.conference.findAll({
        include: [{
            model: db.user,
            where: {id: req.userId}
        }]
    }).then(conf => {
        res.status(200).json({"response":conf});
    }).catch(err => {
        res.status(500).send(err);
    })
}

exports.isPC = (req, res) => {
    db.pcmember.findOne({
        include: [{
            model: db.conference,
            where: {id: req.params.conf}
        }, {
            model: db.user,
            where: {id: req.userId}
        }]
    }).then(pc => {
        if(pc) {
            return res.status(200).send({"response":true});
        }
        return res.status(200).send({"response": false});
    }).catch(err => {
        res.status(500).send(err);
    })
}

exports.isChair = (req, res) => {
    db.pcmember.findOne({
        include: [{
            model: db.conference,
            where: {id: req.params.conf}
        }, {
            model: db.user,
            where: {id: req.userId}
        }]
    }).then(pc => {
        if(pc) {
            return res.status(200).send({"response":pc.co_chair});
        }
    }).catch(err => {
        res.status(500).send(err);
    })
}