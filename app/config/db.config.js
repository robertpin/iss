const env = require('./env.js');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  dialect: env.dialect,
  operatorsAliases: false,

  pool: {
    max: env.max,
    min: env.pool.min,
    acquire: env.pool.acquire,
    idle: env.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

const Sessions = sequelize.define('sessions', {
    room: {
        type: Sequelize.STRING
    },
    time: {
        type: Sequelize.DATE
    }
});
const Speakers = sequelize.define('speakers', {});

db.conference = require('../model/conference.model')(sequelize, Sequelize);
db.user = require('../model/user.model')(sequelize, Sequelize);
db.pcmember = require('../model/pcmember.model')(sequelize, Sequelize);
db.bids = require('../model/bid.model')(sequelize, Sequelize);
db.papers = require('../model/paper.model')(sequelize, Sequelize);
db.topics = require('../model/topic.model')(sequelize, Sequelize);
db.keywords = require('../model/keyword.model')(sequelize, Sequelize);
db.coauthors = require('../model/coauthor.model')(sequelize, Sequelize);
db.reviews = require('../model/review.model')(sequelize, Sequelize);
db.sessions = Sessions;
db.speakers = Speakers;



db.conference.belongsToMany(db.user, {through: 'user_conf', foreignKey: 'conferenceId', otherKey: 'userId'});
db.user.belongsToMany(db.conference, {through: 'user_conf', foreignKey: 'userId', otherKey: 'conferenceId'});

db.user.hasMany(db.pcmember);
db.pcmember.belongsTo(db.user);

db.conference.hasMany(db.pcmember);
db.pcmember.belongsTo(db.conference);

db.conference.hasMany(db.bids);
db.bids.belongsTo(db.conference);
db.pcmember.hasMany(db.bids);
db.bids.belongsTo(db.pcmember);
db.papers.hasMany(db.bids);
db.bids.belongsTo(db.papers);

db.papers.belongsToMany(db.topics, {through: 'paper_topic'});
db.topics.belongsToMany(db.papers, {through: 'paper_topic'});

db.papers.belongsToMany(db.keywords, {through: 'paper_keyword'});
db.keywords.belongsToMany(db.papers, {through: 'paper_keyword'});

db.papers.belongsToMany(db.coauthors, {through: 'paper_coauthors'});
db.coauthors.belongsToMany(db.papers, {through: 'paper_coauthors'});

db.conference.hasMany(db.papers);
db.papers.belongsTo(db.conference);
db.user.hasMany(db.papers);
db.papers.belongsTo(db.user);

db.reviews.belongsTo(db.papers);
db.papers.hasMany(db.reviews);
db.reviews.belongsTo(db.pcmember);
db.pcmember.hasMany(db.reviews);

db.sessions.belongsTo(db.conference);
db.conference.hasMany(db.sessions);
db.sessions.belongsTo(db.pcmember);
db.pcmember.hasMany(db.sessions);

db.speakers.belongsTo(db.sessions);
db.sessions.hasMany(db.speakers);
db.speakers.belongsTo(db.user);
db.user.hasMany(db.speakers);

// db.role.belongsToMany(db.user, { through: 'user_roles', foreignKey: 'roleId', otherKey: 'userId'});
// db.user.belongsToMany(db.role, { through: 'user_roles', foreignKey: 'userId', otherKey: 'roleId'});

module.exports = db;