function consumerDashboard() {
  const session_id = sessionStorage.getItem("sid");
  const dataTableOptions = {
    searchable: true,
    sortable: true,
    perPage: 5,
    perPageSelect: [5, 10],
  };
  allBillsData = $('#datatables').DataTable(dataTableOptions);
  $.post(
    "/fetchUser",
    {
      session_id: session_id,
    },
    (data) => {
      sessionStorage.setItem("uid", data[0].user_id);
      document.getElementById("name").value = data[0].user_name;
      document.getElementById("phone").value = data[0].user_phone;
    }
  );
}

// function billDetails() {
//   const user_id = sessionStorage.getItem("uid");
//   const startMonth = document.getElementById("monthSelectStart").value;
//   const startYear = document.getElementById("yearSelectStart").value;
//   const endMonth = document.getElementById("monthSelectEnd").value;
//   const endYear = document.getElementById("yearSelectEnd").value;

//   if (
//     (startMonth == endMonth &&
//       startYear <= endYear &&
//       startMonth != "" &&
//       startYear != "" &&
//       endMonth != "" &&
//       endYear != "") ||
//     (startMonth > endMonth &&
//       startYear < endYear &&
//       startMonth != "" &&
//       startYear != "" &&
//       endMonth != "" &&
//       endYear != "") ||
//     (startMonth < endMonth &&
//       startYear <= endYear &&
//       startMonth != "" &&
//       startYear != "" &&
//       endMonth != "" &&
//       endYear != "")
//   ) {
//     $.post(
//       "/fetchBills",
//       {
//         user_id: user_id,
//         from_date: `${startYear}-${startMonth}-05`,
//         to_date: `${endYear}-${endMonth}-05`,
//       },
//       (data) => {
//         const dataTableOptions = {
//           searchable: true,
//           sortable: true,
//           perPage: 5,
//           perPageSelect: [5, 10,],
//         };
//         const allBills = [];

//         for (let bill of data) {

//             const formattedDate = monthFormat(bill.bill_generated_date);
//             const paidStatus = bill.paid_status ? "paid" : "not paid";
//             const payButton = bill.paid_status ? '<button disabled>Pay</button>' : `<button class="btn btn-info" onClick="payment('${bill.bill_id}')" enabled>Pay</button>`;

//             allBills.push([formattedDate, bill.consumption_units, bill.amount_due, paidStatus, payButton,`<button class="btn btn-info" onClick="fetchSingleBill('${bill.bill_id}')">view bill</button>`]);
//         }

//         const allBillsData = $('#datatables').DataTable(dataTableOptions);
//         allBillsData.clear().rows.add(allBills).draw();

//       }
//     );
//   }
// }


// Define the DataTable instance outside the function to maintain its scope.


let allBillsData;

function billDetails() {
  
  

  const user_id = sessionStorage.getItem("uid");
  const startMonth = document.getElementById("monthSelectStart").value;
  const startYear = document.getElementById("yearSelectStart").value;
  const endMonth = document.getElementById("monthSelectEnd").value;
  const endYear = document.getElementById("yearSelectEnd").value;

  if (
    // Check your conditions here
    (startMonth == endMonth &&
      startYear <= endYear &&
      startMonth != "" &&
      startYear != "" &&
      endMonth != "" &&
      endYear != "") ||
    (startMonth > endMonth &&
      startYear < endYear &&
      startMonth != "" &&
      startYear != "" &&
      endMonth != "" &&
      endYear != "") ||
    (startMonth < endMonth &&
      startYear <= endYear &&
      startMonth != "" &&
      startYear != "" &&
      endMonth != "" &&
      endYear != "")
  ) {
    $.post(
      "/fetchBills",
      {
        user_id: user_id,
        from_date: `${startYear}-${startMonth}-05`,
        to_date: `${endYear}-${endMonth}-05`,
      },
      (data) => {
       
        const allBills = [];
        let s = 1;
        for (let bill of data) {
          
          const formattedDate = monthFormat(bill.bill_generated_date);
            const paidStatus = bill.paid_status ? "paid" : "not paid";
            const payButton = bill.paid_status ? '<button disabled>Pay</button>' : `<button class="btn btn-info" onClick="payment('${bill.bill_id}')" enabled>Pay</button>`;

            allBills.push([s,formattedDate, bill.consumption_units, bill.amount_due, paidStatus, payButton,`<button class="btn btn-info" onClick="fetchSingleBill('${bill.bill_id}')">view bill</button>`]);
            s++;
          // Populate allBills array with data
        }
        allBillsData.clear().rows.add(allBills).draw();

       
      }
    );
  }
  else{
    alert("Please select a valid date range");
  }
}







const dateFormat = (date)=>{
  if (date!=='not paid'){
    let newDate = new Date(date).toLocaleString(('en-us'),{day:'numeric',month:'short',year:'numeric'})
    return newDate;
  }else{
    let newDate="not paid"
    return newDate;
  }
}
const monthFormat = (date)=>{
  let newDate = new Date(date).toLocaleString(('en-us'),{month:'long',year:'numeric'})
  return newDate;
}

const fetchSingleBill=(billId)=> {
  sessionStorage.setItem("bid", billId);
  console.log("fetching");
  window.location.href = `/fetchSingleBill`;
}

function payment(billId) {
  
  $.post(
    "/paid",
    {
      billId: billId,
    },
    (data) => {
      if (data) {
        billDetails();
      }
    }
  );
}
function logoutConsumer(){
  const sid = sessionStorage.getItem('sid')
  console.log(sid)

  $.post('/logout',{
    session : sid
  },
  (data)=>{
    if(data=='OK'){
      window.location='http://localhost:4000/'
      sessionStorage.removeItem('sid')
      sessionStorage.removeItem('uid')
    }
  }
  )
}