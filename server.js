const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const controller = require('./controller/controller.js')

const app = express();

app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended: true}))

app.engine('html',require('ejs').renderFile);
app.use(express.json())


app.get('/admin',(req,res)=>{
    controller.admin(req,res);
})

app.post('/adminLogin',(req,res)=>{
    controller.adminLogin(req,res);
})

app.get('/adminDashboard',(req,res)=>{
    controller.dashboard(req,res);
})

app.post('/billDetails',(req,res)=>{
    controller.billDetails(req,res);
})

app.post('/logout',(req,res)=>{
    controller.logout(req,res);
})

app.post('/filterData',(req,res)=>{
    controller.filterData(req,res);
})

app.post('/disableEnable',(req,res)=>{
    controller.disableEnable(req,res);
})

app.post('/paymentCount',(req,res)=>{
    controller.paymentCount(req,res);
})

app.post('/saveUsers',(req,res)=>{
    controller.saveUsers(req,res);
})

app.post('/deleteUser',(req,res)=>{
    controller.deleteUser(req,res);
})

app.post('/generate',(req,res)=>{
    controller.generateBill(req,res);
})

//consumer endpoints

app.get("/", (req, res) => {
    res.render("index.html");
});

app.post("/consumerLogin", (req, res) => {
    controller.consumerLogin(req, res);
});
app.get("/consumerDashboard", (req, res) => {
    controller.consumerDashboard(req, res);
  });

app.post("/fetchUser", (req, res) => {
    controller.fetchUser(req, res); 
});
  
app.post("/fetchBills", (req, res) => {
    controller.fetchBills(req, res);
});


app.get("/fetchSingleBill", (req, res) => {
    controller.fetchSingleBill(req, res);
});
  
app.post("/displayBill", (req, res) => {
controller.displayBill(req, res);
});

app.post("/convertToPdf", async (req, res) => {
controller.pdfConverter(req,res);
});

app.post("/paid", (req, res) => {
controller.paid(req, res);
});
  

app.listen(4000, ()=>{
    console.log('server listening on port http://localhost:4000/')
})