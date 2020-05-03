module.exports = (sequelize, Sequelize) => {
    const Reviews = sequelize.define('reviews', {
        recommandation: {
            type: Sequelize.TEXT,
            defaultValue: null
        },
        result: {
            type: Sequelize.INTEGER
        }
    });
    return Reviews;
}