function consumerDashboard() {
  const session_id = sessionStorage.getItem("sid");

  $.post(
    "/fetchUser",
    {
      session_id: session_id,
    },
    (data) => {
      sessionStorage.setItem("uid", data[0].user_id);
      document.getElementById("name").innerText = data[0].user_name;
      document.getElementById("phone").innerText = data[0].user_phone;
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
        totalRecords = data.length;
        const currentPageData = data.slice(startRecord, endRecord + 1);
        let billData = "";
        let s = startRecord + 1;
        let paidStatus;
        for (let i = 0; i < currentPageData.length; i++) {
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const date = new Date(currentPageData[i].bill_generated_date);
          const year = date.getFullYear();
          const month = monthNames[date.getMonth()];
          if (currentPageData[i].paid_status == 1) {
            paidStatus = "paid";
          } else {
            paidStatus = "not paid";
          }

          billData += `<tr>
    <td>${s}</td>
    <td>${month} ${year}</td>
    <td>${currentPageData[i].consumption_units}</td>
    <td>${Math.round(currentPageData[i].amount_due)}</td>
    <td>${paidStatus}</td>
    <td><input type="button" onclick="payment('${
      currentPageData[i].bill_id
    }')" value="Pay" ${currentPageData[i].paid_status == 1 ? 'disabled' : ''}/></td>
    <td><input type="button" onclick="fetchSingleBill('${
      currentPageData[i].bill_id
    }')" value="ViewBill"/></td>
     </tr>`;
          s++;
        }
        document.getElementById("billTable").innerHTML = billData;
        updatePagination();
      }
    );
  } else {
    alert("Please select a valid month and year to view the details.");
  }
}

document.getElementById("prevPage").addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    billDetails(currentPage);
  }
});

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

function logoutConsumer()
{
  // const sid = sessionStorage.getItem('sid')
  // $post('')
}
