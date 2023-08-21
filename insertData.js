const express = require('express')
const path = require('path')
const fs = require('fs')
const mysql = require('mysql')
const bodyParser = require('body-parser')

const app = express();

app.engine('html', require('ejs').renderFile);
// app.use('view engine', 'html')
app.use(bodyParser.urlencoded({extended:true}));


const userDataFilePath = path.join(__dirname, 'userData.json')
const billDataFilePath = path.join(__dirname, 'bill_data.json')

const data = fs.readFileSync(userDataFilePath);
const userData = JSON.parse(data)

const bdata = fs.readFileSync(billDataFilePath);
const billData = JSON.parse(bdata)

var con = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'admin',
    database :'electricity'
})



con.connect((err) => {
    if (err) throw err;
    console.log("Database connected....");

    let user_id = 1; // Initialize the user_id

    for (let user of userData) {
        const query = 'INSERT INTO user_info SET ? ';

        const Data = {
            user_id: user.user_id,
            user_password:'123',
            user_name: user.user_name,
            user_address: user.user_address,
            user_phone: user.user_phone,
            user_type: user.user_type,
            block_status: user.block_status,
          };

        con.query(query, Data, (err, result) => {
            if (err) throw err;
        });

        user_id++; // Increment the user_id for the next iteration
    }
    console.log(`Inserted..`);

});


