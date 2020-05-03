const jwt = require('jsonwebtoken');
const config = require('../config/config');
const db = require('../config/db.config');
const User = db.user;
const Pcmember = db.pcmember;
const Op = db.Sequelize.Op;

isAdmin = (req, res, next) => {
    if(req.body.password != "adminSuperStrongPassword"){
        return res.status(403).send("Not admin");
    }
    next();
}

verifyToken = (req, res, next) => {
    let token = req.headers['x-access-token'];

    if(!token) {
        return res.status(403).send({
            auth: false, message: 'No token provided'
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) {
            return res.status(500).send({
                auth: false, message: 'Error: ' + err
            });
        }
        req.userId = decoded.id;
        next();
    });
}

isPC = (req, res, next) => {
    Pcmember.findOne({
        include: [{
            model: db.user,
            where: {
                id: req.userId
            }
        }, {
            model: db.conference,
            where: {
                id: +req.headers["conf"]
            }
        }]
    }).then(pc => {
        if(pc) {
            req.pcId = pc.id;
            next();
            return;
        }
        res.status(403).send("Must be PC member");
    });
}

isCoChair = (req, res, next) => {
    Pcmember.findOne({
        where: { co_chair: true},
        include: [{
            model: db.user,
            where: {
                id: req.userId
            }
        }, {
            model: db.conference,
            where: {
                id: req.headers["conf"]
            }
        }]
    }).then(pc => {
        if(pc) {
            req.pcId = pc.id;
            next();
            return;
        }
        res.status(403).send("Must be co-chair");
    });
}

paperDeadline = (req, res, next) => {
    db.conference.findOne({
        where: {
            id: req.body.conference
        }
    }).then(conf => {
        if(conf.paperDeadline > new Date()){
            next();
            return;
        }
        res.status(403).send("Deadline passed");
    });
}

abstractDeadline = (req, res, next) => {
    db.conference.findOne({
        where: {
            id: req.body.conference
        }
    }).then(conf => {
        if(conf.absDeadline > new Date()){
            next();
            return;
        }
        res.status(403).send("Deadline passed");
    });
}

bidDeadline = (req, res, next) => {
    db.conference.findOne({
        where: {
            id: req.headers["conf"]
        }
    }).then(conf => {
        if(conf.bidDeadline > new Date()){
            next();
            return;
        }
        res.status(403).send("Deadline passed");
    });
}

checkDuplicateUsernameOrEmail = (req, res, next) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if(user && user.id != req.userId) {
            res.status(400).send("Error. Username taken");
            return;
        }

        User.findOne({
            where: {
                email: req.body.email
            }
        }).then(user => {
            if(user && user.id != req.userId) {
                res.status(400).send("Error. Email already in use");
                return;
            }
            next();
        })
    })
}

const authJwt = {};
authJwt.isAdmin = isAdmin;
authJwt.verifyToken = verifyToken;
authJwt.isPC = isPC;
authJwt.isCoChair = isCoChair;
authJwt.paperDeadline = paperDeadline;
authJwt.abstractDeadline = abstractDeadline;
authJwt.bidDeadline = bidDeadline;
authJwt.checkDuplicateUsernameOrEmail = checkDuplicateUsernameOrEmail;
module.exports = authJwt;