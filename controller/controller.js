const helper = require('../helper/helper.js');
const {uuid} = require('uuidv4');
// const puppeteer = require("puppeteer");

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
            res.status(401).json({isValid : false});
        }
    })
}

const loginPageV4 = (req,res)=>{
    const phone = req.body.phone;
    const password = req.body.password
    const data= {
        select:'*',
        table : 'user_info',
        condition : `user_phone = "${phone}" && user_password = "${password}"`
    }
    helper.selectData(data,(userResult)=>{
        if(userResult.length==1){
            const allData= {
                select:'*',
                table : 'bill_info',
            }
            helper.fetchData(allData,(allResult)=>{
                if(allResult){
                const userid = userResult[0].user_id;
                const userType = userResult[0].user_type=='admin'?true:false
                const data = {
                    select:'*',
                    table : 'session_info',
                    condition : `user_id = ${userid}`
                };
                helper.selectData(data,(session)=>{
                    delete userResult[0].user_password
                    if(session.length==1){
                        const session_id = session[0].session_id;
                        res.json({session:session_id, isAdmin:userType, isValid : true, user:userResult[0], allBills:allResult});
                    }else{
                        if(session.length==0){
                            const sessionId = uuid();
                            const data = {
                                table : "session_info",
                                columns : "session_id , user_id",
                                values : `"${sessionId}" , ${userResult[0].user_id}`
                            }
                            helper.insertData(data,(insertResult)=>{
                                if(insertResult){
                                    res.send({session :sessionId, isAdmin:userType, isValid:true,user:userResult[0],allBills:allResult})
                                }else{
                                    res.sendStatus(500);
                                }
                            });
                        }
                    }
                })
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
                let date = new Date().toISOString().slice(0,10)
                let month =date.slice(5,7)
                let year =date.slice(0,4)
                const data={
                    column_name:'bill_generated_date',
                    table_name:'bill_info',
                    order_column:'bill_generated_date',
                    order:'desc',
                    limit:1
                }
                helper.order1(data,(result)=>{
                    if (result.length==1){
                        let db_data=result[0].bill_generated_date
                        if (db_data.slice(0,4)==year && db_data.slice(5,7)==month){
                            res.send({status:true})
                        }else{
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
                                            amount_due:(110+ parseInt(calculateElectricityBill(consumption)))+(100+ parseInt(calculateElectricityBill(consumption)))*0.09,
                                            paid_status:status,
                                            paid_date:'not paid',
                                            tax:(110+ parseInt(calculateElectricityBill(consumption)))*0.09
                                        }
                                    const insertBill = {
                                        table : 'bill_info',
                                        columns : 'bill_id,user_id,meter_num,bill_generated_date,consumption_units,bill_due_date,amount_due,paid_status,paid_date,tax',
                                        values : `'${data.bill_id}',${data.user_id},${data.meter_num},'${data.bill_generated_date}',${data.consumption_units},'${data.bill_due_date}',${data.amount_due},${data.paid_status},'${data.paid_date}',${data.tax}`
                                    }
                                    helper.insertData(insertBill,(insResult)=>{
                        
                                    });
                                } 
                                res.send({status:false});
                            })
                        }
                    }else{
                        res.render(adminLogin.html)
                    }
                })
            }
            else{
                res.render(adminLogin.html)
            }
        }
        else{
            res.render(adminLogin.html)
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
   
 // const htmlContent = req.body.htmlContent;
    // const options = {
    //   format: "Letter",
    //   orientation: "portrait"
    // };
 
    // pdf.create(htmlContent, options).toBuffer((err, buffer) => {
    //   if (err) {
    //     console.error("Error generating PDF:", err);
    //     console.log(buffer)
    //     return res.status(500).send("Error generating PDF");
    //   }
 
    //   res.set({
    //     "Content-Type": "application/pdf",
    //     "Content-Disposition": "attachment; filename=download.pdf"
    //   });
    //   res.attachment('download.pdf');
    //   res.send(buffer);
    // });
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
    loginPageV4,
    paid,
}