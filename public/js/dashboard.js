
//---------------------------------------------------------------------------------------------------
  let userDetails;

  document.addEventListener('DOMContentLoaded', event =>{
    const session = sessionStorage.getItem('sid')

    $.post('/filterData',{
      session : session
    },(data)=>{
      printBills(data.allBills,data.paidBills,data.pendingBills);
    })

    $.post('/paymentCount',{
      session : session
    },(data)=>{
      userData(data.userResult,data.adminId)
      userDetails = data.userResult;
    })
  })

  //-------------------------------------------------------------------------------------------------------------------------------

  function consumerDash(){
    const session = sessionStorage.getItem('sid');

    window.location.href = `/consumerDashboard?s=${session}`;
  }
  
  function printBills(all, paid, pending){

    const dataTableOptions = {
      searchable: true,
      sortable: true,
      perPage: 10,
      perPageSelect: [5, 10, 20, 50],
    };

    const allBills = [];
    const paidBills = [];
    const pendingBills = [];
    const dateFormat = (date)=>{
      if (date!=='not paid'){
        let newDate = new Date(date).toLocaleString(('en-us'),{day:'numeric',month:'short',year:'numeric'})
        return newDate
      }else{
        let newDate="not paid"
        return newDate
      }
    }

    for(let bills of all){
      allBills.push([bills.user_name,bills.user_id,bills.meter_num,bills.bill_id,bills.amount_due,bills.consumption_units,dateFormat(bills.bill_generated_date),dateFormat(bills.bill_due_date),dateFormat(bills.paid_date)])
    }

    for(let bills of paid){
      paidBills.push([bills.user_name, bills.user_id, bills.meter_num, bills.bill_id, bills.amount_due,bills.consumption_units,dateFormat( bills.bill_generated_date), dateFormat(bills.paid_date)])
    }

    for(let bills of pending){
      pendingBills.push([bills.user_name, bills.user_id, bills.meter_num, bills.bill_id, bills.amount_due,bills.consumption_units,dateFormat(bills.bill_generated_date),dateFormat(bills.bill_due_date)])
    }

    const allBillsData = $('#datatablesSimpleBill').DataTable(dataTableOptions);
    allBillsData.clear().rows.add(allBills).draw();
  
    const paidBillsData = $('#datatablesSimpleBill1').DataTable(dataTableOptions);
    paidBillsData.clear().rows.add(paidBills).draw();
  
    const pendingBillsData = $('#datatablesSimpleBill2').DataTable(dataTableOptions);
    pendingBillsData.clear().rows.add(pendingBills).draw();

    // Add CSS class to center the content in DataTable cells
$('.dataTables_wrapper table').addClass('text-center'); // This class aligns the content within cells to the center
  }
  //---------------------------------------------------------------------

  function generateBill(){
    const session = sessionStorage.getItem('sid')
    const date = new Date().toISOString().slice(0,10)
    $.post('/generate',{
       date : date,
       session:session
    },(data)=>{
      console.log(data)
      const response = confirm("Do you want to Generate Bill?")
      if(response){
          if(data.status)
          {
            alert("Bills are already generated for this Month.");
          }else{
          alert(`Bill Generated Successful`)
          const session = sessionStorage.getItem('sid')
          window.location.href = `/adminDashboard?s=${session}`
          }
      }
    })
}

  //------------------------------------------------------------------------------------------------------------------
  function showUserInfoModal(user_id) {

    for(let user of userDetails){
      if(user.user_id == user_id){
        const details = `<tr>
        <th><label for="user_name">Name</label></th>
        <td><input type="text" name="" id="user_name" value="${user.user_name}" disabled></td>
    </tr>
    <tr>
        <th><label for="user_id">User ID</label></th>
        <td><input type="text" name="" id="user_id" value="${user.user_id}" disabled></td>
    </tr>
    <tr>
        <th><label for="user_phone">Phone</label></th>
        <td><input type="tel" name="" id="user_phone" value="${user.user_phone}" disabled></td>
    </tr>
    <tr>
        <th><label for="user_address">Address</label></th>
        <td><textarea name="user_address" id="user_address" cols="25" rows="3" disabled>${user.user_address}</textarea></td>
    </tr>`;

    document.getElementById('userDetailsModal').innerHTML = details;
      }
    }
    // Show the modal
    $('#userModal').modal('show');
}

function closeButton(){
  document.getElementById('after').style.display = 'none'
  document.getElementById('before').style.display = 'inline-block'
}

function editUser(){
  document.getElementById('user_name').removeAttribute('disabled')
  document.getElementById('user_phone').removeAttribute('disabled')
  document.getElementById('user_address').removeAttribute('disabled')
  document.getElementById('after').style.display = 'inline-block'
  document.getElementById('before').style.display = 'none'
}

function saveUser(){
  const user_name = document.getElementById('user_name').value
  const user_phone =document.getElementById('user_phone').value
  const user_address =document.getElementById('user_address').value
  const user_id =document.getElementById('user_id').value

  $.post('/saveUsers',{
      user_name : user_name,
      user_id : user_id,
      user_phone : user_phone,
      user_address : user_address
  },
  (data)=>{
    if(data){
      location.reload();
      const sessionId=sessionStorage.getItem('sid'); 
      window.location.href = `/adminDashboard?s=${sessionId}`
    }
      
  })
}

function cancelUser(){
  const user_id =document.getElementById('user_id').value
  showUserInfoModal(user_id)
  document.getElementById('after').style.display = 'none'
  document.getElementById('before').style.display = 'inline-block'
  
}

function deleteUser(){
  const user_id = document.getElementById('user_id').value;
  const response = confirm("Do you really want to delete?")
  if(response){
      $.post('/deleteUser',{
          user_id : user_id
      },
      (data)=>{
          const sessionId = sessionStorage.getItem('sid');
          window.location=`/adminDashboard?s=${sessionId}`
      })
  }else{
    const user_id =document.getElementById('user_id').value
    showUserInfoModal(user_id)
    document.getElementById('after').style.display = 'none'
    document.getElementById('before').style.display = 'inline-block'
  }
 
}
  //------------------------------------------------------------------------------------------------------------------------------------------------

  function userData(data,admin_id){

    const admin = document.getElementById('adminUser');
    // const fadmin = document.getElementById('foot-admin');
        
    let paidTable, notPaidTable, moreThan3Table,allUserTable;

    const dataTableOptions = {
      searchable: true,
      sortable: true,
      perPage: 10,
      perPageSelect: [5, 10, 20, 50],
    };
    const allUser = [];
    const paidData = [];
    const notPaidData = [];
    const moreThan3Data = [];

  
    for (const user of data) {

      allUser.push([user.user_name, user.user_id, user.user_phone, user.user_type, user.pending, '<button type="button" class="btn btn-info" onclick="showUserInfoModal('+user.user_id+')">Info</button>']);

      if (user.user_id == admin_id) {
        admin.innerHTML = '<li><a class="" href="#!">Name : '+user.user_name+'</a></li><li><a class="" href="#!">Phone : '+user.user_phone+'</a></li>';
        // fadmin.innerHTML = '<div class="small">Logged In as  </div>' + user.user_name + '';
      }

      if(user.pending == 0){
        paidData.push([user.user_name, user.user_id, user.user_phone, user.user_type, user.pending ]);
        
      }else if(user.pending < 3){
        notPaidData.push([user.user_name, user.user_id, user.user_phone, user.user_type,user.pending ]);
      }else{
        let buttonHtml = '';
        if (user.block_status) {
          buttonHtml = '<button class="btn btn-success success" data-user-id="' + user.user_id + '">Enable</button>';
        } else {
          buttonHtml = '<button class="btn btn-danger danger" data-user-id="' + user.user_id + '">Disable</button>';
        }
        moreThan3Data.push([user.user_name, user.user_id, user.user_phone, user.user_type, user.pending, buttonHtml]);
  
      }
    }
    allUserTable = $('#datatablesSimpleall').DataTable(dataTableOptions);
    allUserTable.clear().rows.add(allUser).draw();

    paidTable = $('#datatablesSimple').DataTable(dataTableOptions);
    paidTable.clear().rows.add(paidData).draw();
  
     notPaidTable = $('#datatablesSimple1').DataTable(dataTableOptions);
    notPaidTable.clear().rows.add(notPaidData).draw();
  
     moreThan3Table = $('#datatablesSimple2').DataTable(dataTableOptions);
    moreThan3Table.clear().rows.add(moreThan3Data).draw();

  }

  //---------------------------------------------NOT USING THIS-------------------------------------------------------------------------

  function printData(data, userData, admin_id) {
    const admin = document.getElementById('adminUser');
    const fadmin = document.getElementById('foot-admin');
  
    let paidTable, notPaidTable, moreThan3Table;
  
    for (let user of userData) {
      if (user.user_id == admin_id) {
        admin.innerHTML = '<li><a class="" href="#!">Name : '+user.user_name+'</a></li><li><a class="" href="#!">Phone : '+user.user_phone+'</a></li>';
        fadmin.innerHTML = '<div class="small">Logged In as  </div>' + user.user_name + '';
        break;
      }
    }
  
    const dataTableOptions = {
      searchable: true,
      sortable: true,
      perPage: 10,
      perPageSelect: [5, 10, 20, 50],
    };
  
    const paidData = [];
    const notPaidData = [];
    const moreThan3Data = [];
  
    for (const user of data.uniquePaidUsers) {
      let users;
      for (let i of userData) {
        if (i.user_id == user.user_id) {
          users = i;
          break;
        }
      }
      paidData.push([users.user_name, users.user_id, user.paidAmount, users.user_phone, user.bill_generated_date, user.latestPaidDate, '<button class="info-button" onClick="userInfo('+users.user_id+')">Info</button>']);
    }
  
    for (const user of data.notPaidLessThan3Months) {
      let users;
      for (let i of userData) {
        if (i.user_id == user.user_id) {
          users = i;
          break;
        }
      }
      notPaidData.push([users.user_name, users.user_id, user.totalBalance, users.user_phone, user.bill_generated_date, user.dueDate, '<button class="info-button" onClick="userInfo('+users.user_id+')">Info</button>']);
    }
  
    for (const user of data.notPaidMoreThan3Months) {
      let users;
      for (let i of userData) {
        if (i.user_id == user.user_id) {
          users = i;
          break;
        }
      }

      let buttonHtml = '';
      if (users.block_status) {
        buttonHtml = '<button class="btn btn-success" data-user-id="' + user.user_id + '">Enable</button>';
      } else {
        buttonHtml = '<button class="btn btn-danger" data-user-id="' + user.user_id + '">Disable</button>';
      }

      moreThan3Data.push([users.user_name,users.user_id, user.totalBalance, users.user_phone, user.bill_generated_date, user.dueDate, buttonHtml]);
    }
  
    paidTable = $('#datatablesSimple').DataTable(dataTableOptions);
    paidTable.clear().rows.add(paidData).draw();
  
     notPaidTable = $('#datatablesSimple1').DataTable(dataTableOptions);
    notPaidTable.clear().rows.add(notPaidData).draw();
  
     moreThan3Table = $('#datatablesSimple2').DataTable(dataTableOptions);
    moreThan3Table.clear().rows.add(moreThan3Data).draw();

  }

  //==================================================NOT USING THIS============================

  function separateData(inputData) {
    const groupedData = {};
  
    for (let bill of inputData) {
      if (!groupedData[bill.user_id]) {
        groupedData[bill.user_id] = [];
      }
      groupedData[bill.user_id].push(bill);
    }
  
    const uniqueData = [];
    const notPaidLessThan3Months = [];
    const notPaidMoreThan3Months = [];
    for (const userId in groupedData) {
  
      const bills = groupedData[userId];
      const allPaid = bills.every((bill) => bill.paid_status === 1);
      const unpaidMonths = bills.filter((bill) => bill.paid_status === 0).length; 
  
      if (allPaid) {
        const latestPaidDate = bills.reduce((latestDate, bill) => {
          return bill.paid_status === 1 && bill.paid_date > latestDate
            ? bill.paid_date
            : latestDate;
        }, bills[0].paid_date);
  
        const paidAmount = bills.reduce((amount,bill)=>{
          return latestPaidDate == bill.paid_date
             ? amount+bill.amount_due 
             : amount;
        },0)
  
        uniqueData.push({ ...bills[0], latestPaidDate,paidAmount : paidAmount });
      } else if (unpaidMonths < 3) {
        const totalBalance = bills.reduce((total, bill) => {
          return bill.paid_status === 0 ? total + bill.amount_due : total;
        }, 0);
  
        let lastDueDate;
        for (const bill of bills) {
          if (bill.paid_status === 0) {
            lastDueDate = bills.reduce((latestDate, bill) => {
              return bill.paid_status === 0 && bill.bill_due_date < latestDate
                ? bill.bill_due_date
                : latestDate;
            }, bills[0].bill_due_date);
          }
        }
  
        notPaidLessThan3Months.push({
          ...bills[0],
          dueDate: lastDueDate,
          totalBalance,
        });
      } else {
        const totalBalance = bills.reduce((total, bill) => {
          return bill.paid_status === 0 ? total + bill.amount_due : total;
        }, 0);
  
        let lastDueDate;
        for (const bill of bills) {
          if (bill.paid_status === 0) {
            lastDueDate = bills.reduce((latestDate, bill) => {
              return bill.paid_status === 0 && bill.bill_due_date < latestDate
                ? bill.bill_due_date
                : latestDate;
            }, bills[0].bill_due_date);
          }
        }
  
        notPaidMoreThan3Months.push({
          ...bills[0],
          dueDate: lastDueDate,
          totalBalance,
        });
      }
    }
    const result = {
      uniquePaidUsers: uniqueData,
      notPaidLessThan3Months: notPaidLessThan3Months,
      notPaidMoreThan3Months: notPaidMoreThan3Months,
    };
  
    return result;
  }

  //--------------------------------------------------------------------------------------------

  function setActiveListItem(clickedId) {
    const listItems = document.querySelectorAll('.tab-bar li ');
  
    listItems.forEach(item => {
      if (item.id === clickedId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  function showTab(tabName) {
    console.log(tabName+'Bills')
    setActiveListItem(tabName + 'Bills');   
    // Hide all tab contents
    var allContents = document.querySelectorAll('.admin-content');
    allContents.forEach(function (content) {
      content.classList.add('d-none');
    });

    // Show the selected tab content
    var selectedContent = document.getElementById(tabName + 'Content');
    selectedContent.classList.remove('d-none');
    
    // Update active tab styling
    var allTabs = document.querySelectorAll('.tab-item');
    allTabs.forEach(function (tab) {
      tab.classList.remove('active');
    });

    // Add active class to the clicked tab
    var clickedTab = document.querySelector('[onclick="showTab(\'' + tabName + '\')"]');
    clickedTab.classList.add('active');
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------

  function logout(){
    const session = sessionStorage.getItem('sid');
    $.post('/logout',{
      session : session
    },
    (data)=>{
      if(data){
        sessionStorage.clear()
        window.location.href = '/'
      }
    })
  }

  //-------------------------------------------------------------------------------------------------------------------------------------------------------------

  $(document).on('click', '.danger', function() {
    const valid = confirm("Do you want Disable this User?")
    if(valid){
      const button = $(this);
      const userId = button.data('user-id');
      console.log(userId)
      const session = sessionStorage.getItem('sid')
      $.post('/disableEnable',{
        user_id :userId,
        session : session,
        status : 1
      },(data)=>{
        if(data){
          console.log(data)
          console.log("Disabled UserId : " + userId)
        }
      })
      
      button.removeClass('btn-danger danger').addClass('btn-success success').text('Enable');
    }
  });
  
  $(document).on('click', '.success', function() {
    const valid = confirm("Do you want Enable this User?")
    if(valid){
      const button = $(this);
      const userId = button.data('user-id');
      const session = sessionStorage.getItem('sid')
      $.post('/disableEnable',{
        user_id :userId,
        session : session,
        status : 0
      },(data)=>{
        if(data){
          console.log(data)
          console.log("Enabled UserId : " + userId)
        }
      })
      button.removeClass('btn-success success').addClass('btn-danger danger').text('Disable');

    }
  });
  
  
