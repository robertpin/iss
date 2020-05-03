module.exports = (sequelize, Sequelize) => {
    const Keyword = sequelize.define('keywords', {
        name: {
            type: Sequelize.STRING,
            unique: true
        }
    });
    return Keyword;
}