const db = require('../config/db.config');

exports.addConf = (req, res) => {
    db.conference.create({
        name: req.body.name,
        begin: req.body.begin,
        end: req.body.end,
        absDeadline: req.body.absDeadline,
        paperDeadline: req.body.paperDeadline,
        bidDeadline: req.body.bidDeadline
    }).then(conf => {
        console.log(conf + "  created");
        res.status(200).send("conf created");
    }).catch(err => {
        res.status(500).send("Error: " + err);
    })
}

exports.getUsers = (req, res) => {
    db.user.findAll({
        include: [{
            model: db.conference
        }]
    }).then(users => {
        res.status(200).json({
            "users": users
        });
    }).catch(err => {
        res.status(500).send("Error: " + err);
    })
}

exports.addPcMember = (req, res) => {
    db.pcmember.create({
        co_chair: req.body.chair
    }).then(pc => {
        db.user.findOne({
            where: {
                id: req.body.user
            }
        }).then(user => {
            user.addPcmember(pc);
        });
        db.conference.findOne({
            where: {
                id: req.body.conf
            }
        }).then(conf => {
            conf.addPcmember(pc);
        })
        res.status(200).send("Pc member added");
    })
}