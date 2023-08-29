const mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "electricitydb",
  });

  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});


const selectData = (data, callBack)=>{
    const select = data.select;
    const table = data.table;
    const condition = data.condition;

    const query = `SELECT ${select} FROM ${table} WHERE ${condition}`
    con.query(query,(err,result)=>{
        if(err){
            throw err;
        }else{
            callBack(result);
        }
    })
}

const fetchData = (data, callBack) =>{
    const select = data.select;
    const table = data.table;
    
    const query = `SELECT ${select} FROM ${table}`

    con.query(query,(err,result)=>{
        if(err){
            throw err;
        }else{
            callBack(result);
        }
    })
}

const insertData = (data,callBack)=>{
    const table = data.table;
    const columns = data.columns;
    const values = data.values;

    const query = `INSERT INTO ${table}(${columns}) VALUES(${values})`;
    con.query(query, (err, result)=>{
        if(err){
            throw err;
        }else{
            callBack(1);
        }
    })
}

const sessionValidation = (data,callBack)=>{
    const user_select = data.user_select;
    const user_table_name = data.user_table_name;
    const condition_user = data.condition_user;
    const session_select = data.session_select;
    const session_table_name = data.session_table_name;
    const condition_session = data.condition_session;

    const getQuery = `SELECT ${user_select} FROM ${user_table_name} WHERE ${condition_user} IN (SELECT ${session_select} FROM ${session_table_name} WHERE ${condition_session})`

    con.query(getQuery,(getErr, getResult)=>{
        if(getErr){
            throw getErr;
        }else{
            callBack(getResult);
        }
    })
}

const deleteRowData = (data, callBack)=>{
    const table = data.table;
    const condition = data.condition;

    const delQuery = `DELETE FROM ${table} WHERE ${condition};`

    con.query(delQuery, (err,result)=>{
        if(err){
            throw err;
        }else{
            callBack(1)
        }
    })
}

const updateData = (data,callBack)=>{
    const table = data.table;
    const columns = data.columns;
    const condition = data.condition;
    const updateQuery = `UPDATE ${table} SET ${columns} WHERE ${condition}`
    con.query(updateQuery, (err,result)=>{
        if(err){
            throw err;
        }else{
            callBack(1);
        }
    })
}

const fetchBillData = (data, callBack) => {
    const bill_select = data.bill_select;
    const bill_table_name = data.bill_table_name;
    const user_table_name = data.user_table_name;
    const sub_query_condtion = data.user_bill_condtion;
    const inner_query_get = data.user_id;
    const fetch_bill_condition = data.fetch_bill_condition;
    const fetch_bill_column_name = data.fetch_bill_column_name;
    const fetch_bill_from = data.fetch_bill_from;
    const fetch_bill_to = data.fetch_bill_to;
  
    const fetchBillQuery = `SELECT ${bill_select} FROM ${bill_table_name} WHERE ${sub_query_condtion}(SELECT ${inner_query_get} FROM ${user_table_name} WHERE ${fetch_bill_condition}) AND ${fetch_bill_column_name} BETWEEN '${fetch_bill_from}' AND '${fetch_bill_to}' ORDER BY ${fetch_bill_column_name} ASC`;
    con.query(fetchBillQuery, (fetchBillErr, fetchBillResult) => {
      if (fetchBillErr) {
        console.log(fetchBillErr);
      } else {
        callBack(fetchBillResult);
      }
    });
  };

  const order1=(data,callBack)=>{
        column_name=data.column_name;
        table_name=data.table_name;
        order_column=data.order_column;
        order=data.order;
        limit=data.limit
        const query=`SELECT ${column_name} FROM ${table_name} ORDER BY ${order_column} ${order} LIMIT ${limit}`;
        con.query(query,(err,result)=>{
          if(err){
              throw err;
          }
          else{
              callBack(result);
          }
        })
  }

module.exports = {
    selectData,
    insertData,
    sessionValidation,
    fetchData,
    deleteRowData,
    updateData,
    fetchBillData,order1
}