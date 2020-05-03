module.exports = (sequelize, Sequelize) => {
    const Conf = sequelize.define('conferences', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        begin: {
            type: Sequelize.DATE,
            allowNull: false
        },
        end: {
            type: Sequelize.DATE,
            allowNull: false
        },
        absDeadline: {
            type: Sequelize.DATE
        },
        paperDeadline: {
            type: Sequelize.DATE
        },
        bidDeadline: {
            type: Sequelize.DATE
        }
    });

    return Conf;
}