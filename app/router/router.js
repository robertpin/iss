const verifySignUp = require('./verifySignUp');
const authJwt = require('./verifyJwtToken');

module.exports = (app) => {
    const admin = require('../controller/adminController');
    const ucont = require('../controller/userController');
    const pcCont = require('../controller/pcController');
    const chCont = require('../controller/chairController');
    
    app.get('/api/conferences', ucont.getConferences);

    //admin
    app.post('/api/admin/addConf', [authJwt.isAdmin], admin.addConf);
    app.get('/api/admin/users', [authJwt.isAdmin], admin.getUsers);
    app.post('/api/admin/pcmember', [authJwt.isAdmin], admin.addPcMember);

    //users
    app.post('/api/signup', [verifySignUp.checkDuplicateUsernameOrEmail], ucont.signup);
    app.post('/api/enroll', [authJwt.verifyToken], ucont.enroll);
    app.post('/api/signin', ucont.signin);
    app.get('/api/user', [authJwt.verifyToken], ucont.userContent);
    app.put('/api/user', [authJwt.verifyToken, authJwt.checkDuplicateUsernameOrEmail], ucont.updateUser);
    app.put('/api/user/pass', [authJwt.verifyToken], ucont.updatePassword);
    app.delete('/api/user', [authJwt.verifyToken], ucont.deleteUser);

    app.post('/api/abstract', [authJwt.verifyToken, authJwt.abstractDeadline], ucont.uploadAbstract);
    app.post('/api/paper', [authJwt.verifyToken, authJwt.paperDeadline], ucont.uploadPaper);

    app.get('/api/confs', [authJwt.verifyToken], ucont.getConference);
    app.get('/api/pc/:conf', [authJwt.verifyToken], ucont.isPC);
    app.get('/api/chair/:conf', [authJwt.verifyToken], ucont.isChair);

    //pc
    app.get('/api/files/:conf', [authJwt.verifyToken, authJwt.isPC], pcCont.getFiles);
    app.get('/api/download/abstract/:name', [authJwt.verifyToken, authJwt.isPC], pcCont.downloadAbstract);
    app.get('/api/download/paper/:name', [authJwt.verifyToken, authJwt.isPC], pcCont.downloadPaper);
    // app.get('/api/keywords', [authJwt.verifyToken, authJwt.isPC], pcCont.getKeywords);
    // app.get('/api/topics', [authJwt.verifyToken, authJwt.isPC], pcCont.getTopics);
    // app.get('/api/coauthors', [authJwt.verifyToken, authJwt.isPC], pcCont.getCoauthors);
    app.post('/api/bid', [authJwt.verifyToken, authJwt.isPC, authJwt.bidDeadline], pcCont.placeBid);
    app.get('/api/bid', [authJwt.verifyToken, authJwt.isPC], pcCont.getBid);

    app.put('/api/reviews', [authJwt.verifyToken, authJwt.isPC], pcCont.giveReview);
    app.get('/api/reviews', [authJwt.verifyToken, authJwt.isPC], pcCont.getReview);
    app.get('/api/otherrevs', [authJwt.verifyToken, authJwt.isPC], pcCont.getOtherReviews);

    //chair
    app.post('/api/deadlines', [authJwt.verifyToken, authJwt.isCoChair], chCont.updateDeadlines);

    app.get('/api/bids', [authJwt.verifyToken, authJwt.isCoChair], chCont.getBids);

    app.post('/api/reviews', [authJwt.verifyToken, authJwt.isCoChair], chCont.assignReview);

    app.get('/api/result', [authJwt.verifyToken, authJwt.isCoChair], chCont.canGenerate);
    app.get('/api/results', [authJwt.verifyToken, authJwt.isCoChair], chCont.generateResults);
    app.post('/api/results', [authJwt.verifyToken, authJwt.isCoChair], chCont.sendResults);
    app.put('/api/results', [authJwt.verifyToken, authJwt.isCoChair], chCont.settleResult);

    app.get('/api/pcmembers', [authJwt.verifyToken, authJwt.isCoChair], chCont.getPcmembers);
    app.get('/api/accepted', [authJwt.verifyToken, authJwt.isCoChair], chCont.getAcceptedPapers);

    app.post('/api/sessions', [authJwt.verifyToken, authJwt.isCoChair], chCont.assignSession);
    app.get('/api/sessions', [authJwt.verifyToken, authJwt.isCoChair], chCont.getSessions);
    app.post('/api/speakers', [authJwt.verifyToken, authJwt.isCoChair], chCont.assignSpeakers);
    // app.get('/api/speakers', [authJwt.verifyToken, authJwt.isCoChair], chCont.getSpeakers);
}