const env = {
    database: 'CMS',
    username: 'root',
    password: 'admin',
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 50,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

module.exports = env;
