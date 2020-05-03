module.exports = (sequelize, Sequelize) => {
    const Bids = sequelize.define('bids', {
        agree: {
            type: Sequelize.STRING
        }
    });
    return Bids;
}