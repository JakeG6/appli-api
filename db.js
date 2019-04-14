const mysql = require('mysql') 

const db = mysql.createPool({
    connectionLimit : 10,
    host            : 'us-cdbr-iron-east-03.cleardb.net',
    user            : 'bbf3049ec788cd',
    password        : 'c3a0d3b8',
    database        : 'heroku_125e5b843934f78'
});

module.exports = db

