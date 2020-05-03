const express = require('express');
const bodyParser = require('body-parser');
const db = require('./app/config/db.config');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');

let app = express();
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static('app/uploadedFiles'));
app.use(express.static(path.join(__dirname, 'app/uploadedFiles')));
app.use(cors());

require('./app/router/router')(app);

db.sequelize.sync({force: false}).then(() => {
    console.log('Drop and REsync tables');
})


const server = app.listen(8080, () => {
    console.log("App listening on port " + 8080);
});
