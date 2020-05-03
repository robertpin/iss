const db = require('../config/db.config');
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if(user) {
            res.status(400).send("Error. Username taken");
            return;
        }

        User.findOne({
            where: {
                email: req.body.email
            }
        }).then(user => {
            if(user) {
                res.status(400).send("Error. Email already in use");
                return;
            }
            next();
        })
    })
}

const signUpVerify = {};
signUpVerify.checkDuplicateUsernameOrEmail = checkDuplicateUsernameOrEmail;

module.exports = signUpVerify;