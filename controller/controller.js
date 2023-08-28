const helper = require('../helper/helper.js');
const {uuid} = require('uuidv4');
const puppeteer = require("puppeteer");

const login = (req,res)=>{
    res.render('adminLogin.html')
}

const loginPage = (req,res)=>{
    const phone = req.body.phone;
    const password = req.body.password;
    const data = {
        select:'*',
        table : 'user_info',
        condition : `user_phone = "${phone}" && user_password = "${password}"`
    };
    helper.selectData(data,(result)=>{
        if(result.length==1){
                const userid = result[0].user_id;
                const userType = result[0].user_type=='admin'?true:false
                const data = {
                    select:'*',
                    table : 'session_info',
                    condition : `user_id = ${userid}`
                };
                helper.selectData(data,(session)=>{
                    if(session.length==1){
                        const session_id = session[0].session_id;
                        res.json({session:session_id, isAdmin:userType, isValid : true});
                    }else{
                        if(session.length==0){
                            const sessionId = uuid();
                            const data = {
                                table : "session_info",
                                columns : "session_id , user_id",
                                values : `"${sessionId}" , ${result[0].user_id}`
                            }
                            helper.insertData(data,(insertResult)=>{
                                if(insertResult){
                                    res.send({session :sessionId, isAdmin:userType, isValid:true})
                                }else{
                                    res.sendStatus(500);
                                }
                            });
                        }
                    }
                })
        }else{
            res.json({isValid : false});
        }
    })
}

const dashboard = (req,res)=>{
    const session_id = req.query.s;
    const data= {
        user_select : '*',
        user_table_name : 'user_info',
        condition_user : `user_id `,
        session_select : 'user_id',
        session_table_name : 'session_info',
        condition_session : `session_id = "${session_id}"` 
    }
    helper.sessionValidation(data, (result)=>{
        if(result.length == 1){
            if(result[0].user_type == 'admin'){
                res.render('dashboard.html')
            }else{
                res.render('adminLogin.html');
            }
        }else{
            res.render('adminLogin.html');
        }
    })
}

const logout = (req,res)=>{
    const session_id = req.body.session;
    const data= {
        user_select : 'user_id',
        user_table_name : 'user_info',
        condition_user : `user_id `,
        session_select : 'user_id',
        session_table_name : 'session_info',
        condition_session : `session_id = "${session_id}"` 
    }
    helper.sessionValidation(data, (result)=>{
        if(result.length == 1){
            const user_id = result[0].user_id;
            const delData = {
                table : 'session_info',
                condition : `user_id = ${user_id}` 
            }
            helper.deleteRowData(delData,(delResult)=>{
                if(delResult){
                    res.sendStatus(200);
                }else{
                    res.render('adminLogin.html')
                }
            })
        }else{
          res.render('adminLogin.html')
        }
    })
}

const disableEnable = (req,res) =>{
    const session_id = req.body.session;
    const user_id = req.body.user_id;
    const status = req.body.status;
    const data= {
        user_select : '*',
        user_table_name : 'user_info',
        condition_user : `user_id `,
        session_select : 'user_id',
        session_table_name : 'session_info',
        condition_session : `session_id = "${session_id}"` 
    }
    helper.sessionValidation(data, (result)=>{
        if(result.length == 1){
            if(result[0].user_type == 'admin'){
                const data = {
                    table : 'user_info',
                    columns : `block_status = ${status}`,
                    condition : `user_id = ${user_id}`
                }
                helper.updateData(data,(upResult)=>{
                    if(upResult){
                        res.sendStatus(200);
                    }else{
                        res.sendStatus(400);
                    }
                })
            }else{
                res.render('adminLogin.html')
            }
        }else{
            res.render('adminLogin.html')
        }
    })
}

const filterData = (req,res)=>{
    const session_id = req.body.session;
    const data= {
        user_select : '*',
        user_table_name : 'user_info',
        condition_user : `user_id `,
        session_select : 'user_id',
        session_table_name : 'session_info',
        condition_session : `session_id = "${session_id}"` 
    }

    helper.sessionValidation(data, (result)=>{
        if(result.length == 1){
            if(result[0].user_type == 'admin'){
                const paidData = {
                    select:'user_info.*,bill_info.*',
                    table:'user_info,bill_info',
                    condition : 'user_info.user_id = bill_info.user_id AND bill_info.paid_status=1'
                }

                helper.selectData(paidData,paidResult=>{
                    const pendingData = {
                        select:'user_info.*,bill_info.*',
                        table:'user_info,bill_info',
                        condition : 'user_info.user_id = bill_info.user_id AND bill_info.paid_status=0'
                    }

                    helper.selectData(pendingData, pendingResult=>{
                       const allData = {
                        select:'user_info.*,bill_info.*',
                        table:'user_info,bill_info',
                        condition : 'user_info.user_id = bill_info.user_id'
                       }

                       helper.selectData(allData, (allresult)=>{
                            res.send({
                                allBills : allresult,
                                paidBills : paidResult,
                                pendingBills : pendingResult
                            })
                       })
                    })
                })
            }
        }
    })
}

const paymentCount = (req,res)=>{
    const session_id = req.body.session;
    const data= {
        user_select : '*',
        user_table_name : 'user_info',
        condition_user : `user_id `,
        session_select : 'user_id',
        session_table_name : 'session_info',
        condition_session : `session_id = "${session_id}"` 
    }
    helper.sessionValidation(data, (result)=>{
        if(result.length == 1){
            if(result[0].user_type == 'admin'){
                const data = {
                    select : 'user_info.*,status.pending',
                    table : 'user_info, ( SELECT (count(paid_status)-sum(paid_status)) as pending, user_id from bill_info group by user_id) as status',
                    condition : 'user_info.user_id =status.user_id'
                }
                helper.selectData(data,userResult=>{
                    res.send({userResult : userResult,adminId : result[0].user_id});
                })
            }else{
                res.render('adminLogin.html')
            }
        }else{
            res.render('adminLogin.html')
        }
    })
}

const saveUsers = (req,res)=>{
    const user_name = req.body.user_name;
    const user_phone = req.body.user_phone;
    const user_address = req.body.user_address;
    const user_id = req.body.user_id;
    const saveData = {
        table : 'user_info',
        columns : `user_name="${user_name}",user_phone = ${user_phone},user_address="${user_address}"`,
        condition : `user_id = ${user_id}`
    }
    helper.updateData(saveData, (updateResult)=>{
        if(updateResult){
            res.sendStatus(200);
        }else{
            res.sendStatus(500);
        }
    })
}

const deleteUser =(req,res)=>{
    const user_id = req.body.user_id;
    const deleteUserData = {
        table : "bill_info",
        condition : `user_id = ${user_id}`
    }
    helper.deleteRowData(deleteUserData,(delUserResult)=>{
        if(delUserResult){
            const deleteBillData = {
                table : "user_info",
                condition : `user_id = ${user_id}`
            }
            helper.deleteRowData(deleteBillData,(delBillResult)=>{
                if(delBillResult){
                    res.sendStatus(200)
                }else{
                    res.sendStatus(500)
                }
            })
        }else{
            res.sendStatus(500)
        }
    })
}


const generateBill = (req,res)=>{
    const date = req.body.date;
    const session = req.body.session;

    const data= {
        user_select : '*',
        user_table_name : 'user_info',
        condition_user : `user_id `,
        session_select : 'user_id',
        session_table_name : 'session_info',
        condition_session : `session_id = "${session}"` 
    }
    helper.sessionValidation(data, (result)=>{
        if(result.length == 1){
            if(result[0].user_type == 'admin'){
                const billData = {
                    select : 'user_id',
                    table : 'user_info',
                }
                helper.fetchData(billData,(billResult)=>{
                        let year = parseInt(date.slice(0,4));
                        let day = parseInt(date.slice(8,10));
                        let month = parseInt(date.slice(5,7));
                        month = month == 12 ? 1 : month+1;
                        year = month <= 12 ? year : year + 1;
                        let out ;
                        for(let i = 0 ; i < billResult.length ; i++){
                            let billId = ('IN'+ Math.floor(Math.random()*100)+Math.random().toString(36).substr(2, 4)).toUpperCase();
                            let meter = Math.floor(Math.random()*100000000);
                            let consumption=Math.floor(Math.random()*1000);
                            let status = i % 2==0 ? 1 : 0;
                            const data={
                                bill_id:`${billId}`,
                                user_id:billResult[i].user_id,
                                meter_num:meter,
                                bill_generated_date:`${date}`,
                                bill_due_date:`${year}-${month}-${day}`,
                                consumption_units:consumption,
                                amount_due:calculateElectricityBill(consumption),
                                paid_status:status,
                                paid_date:'not paid'
                            }
                        const insertBill = {
                            table : 'bill_info',
                            columns : 'bill_id,user_id,meter_num,bill_generated_date,consumption_units,bill_due_date,amount_due,paid_status,paid_date',
                            values : `'${data.bill_id}',${data.user_id},${data.meter_num},'${data.bill_generated_date}',${data.consumption_units},'${data.bill_due_date}',${data.amount_due},${data.paid_status},'${data.paid_date}'`
                        }
                        helper.insertData(insertBill,(insResult)=>{
            
                        });
                    } 
                    res.sendStatus(200);
                })


            }else{
                res.render('adminLogin.html');
            }
        }else{
            res.render('adminLogin.html');
        }
    })

}


const calculateElectricityBill = (unitsConsumed =>{
    if(unitsConsumed<=50){
         value =unitsConsumed*4.00
         return value.toFixed(2)
    }
    else if(unitsConsumed<=100){
        value=200+((unitsConsumed-50)*5.25)
        return value.toFixed(2)
    }
    else if ( unitsConsumed<=200){
        value= (462.5+((unitsConsumed-100)*6.80))
        return value.toFixed(2)
    }else {
         value = 1142.5+(unitsConsumed-200)*7.65
         return value.toFixed(2)
    }
})

  const consumerDashboard = (req, res) => {
    const sessionId = req.query.s;
    const userdata = {
      user_select: "*",
      user_table_name: "user_info",
      condition_user: `user_id `,
      session_select: "user_id",
      session_table_name: "session_info",
      condition_session: `session_id = "${sessionId}"`,
    };
    helper.sessionValidation(userdata, (result) => {
      if (result.length == 1) {
        res.render("ConsumerDashboard.html");
      } else {
        res.sendStatus(500);
      }
    });
  };

  
const fetchUser = (req, res) => {
    const sessionId = req.body.session_id;
    const fetchUserData = {
      user_select: "*",
      user_table_name: "user_info",
      condition_user: `user_id `,
      session_select: "user_id",
      session_table_name: "session_info",
      condition_session: `session_id = "${sessionId}"`,
    };
  
    helper.sessionValidation(fetchUserData, (fetchUserResult) => {
      if (fetchUserResult.length == 1) {
        res.send(fetchUserResult);
      } else {
        res.sendStatus(500);
      }
    });
  };
  
  const fetchBills = (req, res) => {
    const user_id = req.body.user_id;
    const from_date = req.body.from_date;
    const to_date = req.body.to_date;
  
    const fetchBillData = {
      bill_select: "*",
      bill_table_name: "bill_info",
      user_bill_condtion: "user_id IN",
      user_table_name: "user_info",
      user_id: "user_id",
      fetch_bill_condition: `user_id=${user_id}`,
      fetch_bill_column_name: "bill_generated_date",
      fetch_bill_from: from_date,
      fetch_bill_to: to_date,
    };
  
    helper.fetchBillData(fetchBillData, (fetchBillResult) => {
      if (fetchBillResult.length >= 1) {
        res.send(fetchBillResult);
      } else {
        // console.log("data is not fetched");
        res.sendStatus(500);
      }
    });
  };
  
 
const displayBill = (req, res) => {
    const bill_id = req.body.billId;
    const fetchBillData = {
      select: "*",
      table: "user_info u,bill_info b",
      condition: `u.user_id=b.user_id and b.bill_id ='${bill_id}'`,
    };
    helper.selectData(fetchBillData, (displayBillResult) => {
      if (displayBillResult.length == 1) {
        res.send(displayBillResult);
      } else {
        // console.log("No data found");
        res.sendStatus(500);
      }
    });
  };
  
  const paid = (req, res) => {
    const billid = req.body.billId;
    
    const updatePaid = {
      table: "bill_info",
      columns: `paid_status=1, paid_date='${
        new Date().toISOString().split("T")[0]
      }'`,
      condition: `bill_id='${billid}'`,
    };
    helper.updateData(updatePaid, (updateStatus) => {
      if (updateStatus == 1) {
        res.status(200).json({ status: "success" });
      } else {
        res.status(500).json({ status: "failed" });
      }
    });
  };
  
  const pdfConverter = async (req, res) => {
    // try {
    //   const { htmlContent } = req.body;
    //   const browser = await puppeteer.launch();
    //   const page = await browser.newPage();
    //   const cssPath = "./public/css/bill.css";
    //   const cssContent = require("fs").readFileSync(cssPath, "utf8");
    //   const modifiedHtmlContent = `<style>${cssContent}</style>${htmlContent}`;
    //   await page.setContent(modifiedHtmlContent);
    //   const pdfBuffer = await page.pdf();
    //   await browser.close();
    //   res.setHeader("Content-Type", "application/pdf");
    //   res.setHeader(
    //     "Content-Disposition",
    //     "attachment; filename=ElectricityBill.pdf"
    //   );
    //   res.send(pdfBuffer);
    // } catch (error) {
    //   console.error(error);
    //   res.status(500).send("Error converting to PDF");
    // }
  };
  
  const fetchSingleBill = (req, res) => {
    res.render("bill.html");
  };
  


module.exports = {
    login,
    loginPage,
    dashboard,
    logout,
    disableEnable,
    filterData,
    paymentCount,
    saveUsers,
    deleteUser,
    generateBill,
    consumerDashboard,
    fetchUser,
    fetchBills,
    displayBill,
    fetchSingleBill,
    pdfConverter,
    paid,
}