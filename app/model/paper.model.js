module.exports = (sequelize, Sequelize) => {
    const Papers = sequelize.define('papers', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        abstract_file: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        },
        paper_file: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        },
        accepted: {
            type: Sequelize.BOOLEAN
        }
    });
    return Papers;
}