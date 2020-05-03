const db = require('../config/db.config');
const path = require('path');


exports.getFiles = (req, res) => {
    db.papers.findAll({
        include: [{
            model: db.conference,
            attributes: ['name'],
            where: {id: req.params.conf}
        }, {
            model: db.user
        }, {
            model: db.topics,
            attributes: ['name']
        }, {
            model: db.keywords,
            attributes: ['name']
        }, {
            model: db.coauthors,
            attributes: ['name']
        }]
    }).then(papers => {
        res.status(200).json({
            "description": "files",
            "papers": papers
        });
    }).catch(err => {
        res.status(500).send("Error: "+ err);
    });
}

// exports.getKeywords = (req, res) => {
//     db.keywords.findAll({
//         include: [{
//             model: db.papers,
//             where: {id: req.body.paperId}
//         }]
//     }).then(keys => {
//         res.status(200).json({"keywords": keys});
//     }).catch(err => {
//         res.status(500).send(err);
//     })
// }

// exports.getTopics = (req, res) => {
//     db.topics.findAll({
//         include: [{
//             model: db.papers,
//             where: {id: req.body.paperId}
//         }]
//     }).then(tops => {
//         res.status(200).json({"topics": tops});
//     }).catch(err => {
//         res.status(500).send(err);
//     });
// }

// exports.getCoauthors = (req, res) => {
//     db.coauthors.findAll({
//         include: [{
//             model: db.papers,
//             where: {id: req.body.paperId}
//         }]
//     }).then(cos => {
//         res.status(200).json({"coauthors": cos});
//     }).catch(err => {
//         res.status(500).send(err);
//     })
// }

exports.downloadAbstract = (req, res) => {
    let name = req.params.name;
    let resPath = path.resolve("app/uploaded_files/abstracts/"+name);

    res.sendFile(resPath);
}

exports.downloadPaper = (req, res) => {
    let name = req.params.name;
    let resPath = path.resolve("app/uploaded_files/papers/"+name);

    res.sendFile(resPath);
}

exports.placeBid = (req, res) => {
    db.bids.findOne({
        include: [{
            model: db.conference,
            attributes: ['name'],
            where: {id: req.headers["conf"]}
        }, {
            model: db.papers,
            attributes: ['name'],
            where: {id: req.body.paperId}
        }, {
            model: db.pcmember,
            attributes: ['co_chair'],
        }]
    }).then(bids => {
        if(!bids) {
            db.bids.create({
                agree: req.body.agree
            }).then(bid => {
                db.papers.findOne({
                    where: {id: req.body.paperId}
                }).then(paper => {
                    paper.addBid(bid);
                });
                db.conference.findOne({
                    where: {id: req.headers["conf"]}
                }).then(conf => {
                    conf.addBid(bid);
                });
                db.pcmember.findOne({
                    include: [{
                        model: db.user,
                        where: {id : req.userId}
                    }]
                }).then(pc => {
                    pc.addBid(bid);
                })
                res.status(200).send({"response":"Bid created"});
            }).catch(err => {
                res.status(500).send(err);
            });
        }
        else {
            bids.update({
                agree: req.body.agree
            }).then(() => {
                res.status(200).send({"response":"Bid updated"});
            })
        }
    })
}

exports.getBid = (req, res) => {
    db.bids.findAll({
        include: [{
            model: db.pcmember,
            attributes: ['co_chair'],
            where: {id: req.pcId}
        }, {
            model: db.conference,
            attributes: ['name'],
            where: {id: +req.headers["conf"]}
        }, {
            model: db.papers,
            attributes: ['abstract_file']
        }]
    }).then(bids => {
        res.status(200).json({
            "description": "bids",
            "bids": bids
        });
    }).catch(err => {
        res.status(500).send(err);
    });
}

const copyObject = (obj) => {
    let nobj = {};
    nobj.dataValues = obj.dataValues;
    return nobj;
}

exports.getOtherReviews = (req, res) => {
    db.reviews.findAll({
        include: [{
            model: db.papers,
            where: {id: +req.headers["pid"]}
        }, {
            model: db.pcmember,
            include: [{
                model: db.user
            }]
        }]
    }).then(revs => {
        let final = [];
        for(let rs of revs) {
            if(rs.id != +req.headers["revid"]) {
                let rss = copyObject(rs);
                final.push(rss);
            }
        }
        res.status(200).json({"response": final});
    })
}

exports.getReview = (req, res) => {
    db.reviews.findAll({
        include: [{
            model: db.pcmember,
            where: {id: req.pcId}
        }, {
            model: db.papers
        }]
    }).then(reviews => {
        res.status(200).json({
            "response": reviews
        })
    });
}

exports.giveReview = (req, res) => {
    db.reviews.findOne({
        include: [{
            model: db.pcmember,
            where: {id: req.pcId}
        }, {
            model: db.papers,
            where: {id: req.body.pid}
        }]
    }).then(rev => {
        rev.update({
            recommandation: req.body.recom,
            result: req.body.result
        });
        res.status(200).send({"response":"Review saved"});
    }).catch(err => {
        res.status(500).send(err);
    })
}