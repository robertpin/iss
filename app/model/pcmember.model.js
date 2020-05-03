module.exports = (sequelize, Sequelize) => {
    const PCMember = sequelize.define('pcmembers', {
        co_chair: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    });

    return PCMember;
}