module.exports = (sequelize, Sequelize) => {
    const Topic = sequelize.define('topics', {
        name: {
            type: Sequelize.STRING
        }
    });
    return Topic;
}