module.exports = (sequelize, Sequelize) => {
    const CoAuthors = sequelize.define('coauthors', {
        name: {
            type: Sequelize.STRING
        }
    });
    return CoAuthors;
}