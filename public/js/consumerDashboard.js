function consumerDashboard() {
  const session_id = sessionStorage.getItem("sid");

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

const recordsPerPage = 6;
let currentPage = 1;
let totalRecords = 0;

function updatePagination() {
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const prevPage = document.getElementById("prevPage");
  prevPage.classList.toggle("disabled", currentPage === 1);
  const nextPage = document.getElementById("nextPage");
  nextPage.classList.toggle("disabled", currentPage === totalPages);
}

function billDetails(page) {
  const user_id = sessionStorage.getItem("uid");
  const startMonth = document.getElementById("monthSelectStart").value;
  const startYear = document.getElementById("yearSelectStart").value;
  const endMonth = document.getElementById("monthSelectEnd").value;
  const endYear = document.getElementById("yearSelectEnd").value;

  const startRecord = (page - 1) * recordsPerPage;
  const endRecord = startRecord + recordsPerPage - 1;

  if (
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
        const dataTableOptions = {
          searchable: true,
          sortable: true,
          perPage: 5,
          perPageSelect: [5, 10,],
        };
        const allBills = [];
        


        for(let bills of data){
          allBills.push([ dateFormat( bills.bill_generated_date),bills.meter_num, bills.bill_id, bills.amount_due,bills.consumption_units, dateFormat(bills.paid_date)])
        }
    
       
        const allBillsData = $('#datatables').DataTable(dataTableOptions);
        allBillsData.clear().rows.add(allBills).draw();


        // updatePagination();
      }  
    );
  }
}
const dateFormat = (date)=>{
  if (date!=='not paid'){
    let newDate = new Date(date).toLocaleString(('en-us'),{day:'numeric',month:'short',year:'numeric'})
    return newDate
  }else{
    let newDate="not paid"
    return newDate
  }
}


document.querySelectorAll("#page1, #page2").forEach(function (pageLink) {
  pageLink.addEventListener("click", function () {
    const pageNumber = parseInt(pageLink.innerText);
    if (!isNaN(pageNumber)) {
      currentPage = pageNumber;
      billDetails(currentPage);
    }
  });
});

document.getElementById("nextPage").addEventListener("click", function () {
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    billDetails(currentPage);
  }
});

function fetchSingleBill(billId) {
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
        billDetails(currentPage);
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
      // alert(`Logged out successfully`)
      window.location='http://localhost:4000/'
      sessionStorage.removeItem('sid')
      sessionStorage.removeItem('uid')
    }
  }
  )
}