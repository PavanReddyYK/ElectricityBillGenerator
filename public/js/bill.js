function displayBill() {
  const billId = sessionStorage.getItem("bid");

  $.post(
    "/displayBill",
    {
      billId: billId,
    },
    (data) => {
      
      console.log(data);
      let dateBill = new Date(data[0].bill_generated_date);
      const yearBill = dateBill.toLocaleString(('en-in'),{day:'numeric',month:'short',year:'numeric'});
      const dueDateBill = new Date(data[0].bill_due_date);
      const dueYearBill = dueDateBill.toLocaleString(('en-in'),{day:'numeric',month:'short',year:'numeric'});
      document.getElementById("accountNumber").innerText = data[0].meter_num;
      document.getElementById("customerName").innerText = data[0].user_name;
      document.getElementById("billNumber").innerText = data[0].bill_id;
      document.getElementById("billDate").innerText = yearBill;
      document.getElementById("dueDate").innerText = dueYearBill;
      document.getElementById("customerAddress").innerText =data[0].user_address;
      document.getElementById("consumptionUnit").innerHTML =data[0].consumption_units;
      
      const billingPeriodDate = new Date(dateBill);
      billingPeriodDate.setMonth(billingPeriodDate.getMonth() - 1);
      const formattedBillingPeriodDate = billingPeriodDate.toLocaleString('en-in', { day: 'numeric', month: 'short', year: 'numeric' });
      document.getElementById("billingPeriod").innerText = formattedBillingPeriodDate+" - "+yearBill;
      
      let consumption = data[0].consumption_units;
      if (consumption <= 50) {
        document.getElementById("consumption-1").innerText = consumption;
        document.getElementById("amount-1").innerText = consumption * 4;
      } else if (consumption <= 100) {
        document.getElementById("consumption-1").innerText = 50;
        document.getElementById("amount-1").innerText = 50 * 4;
        document.getElementById("consumption-2").innerText = consumption - 50;
        document.getElementById("amount-2").innerText =
          (consumption - 50) * 5.25;
      } else if (consumption <= 200) {
        document.getElementById("consumption-1").innerText = 50;
        document.getElementById("amount-1").innerText = 50 * 4;
        document.getElementById("consumption-2").innerText = 50;
        document.getElementById("amount-2").innerText = 50 * 5.25;
        document.getElementById("consumption-3").innerText = consumption - 100;
        document.getElementById("amount-3").innerText =
          (consumption - 100) * 6.8;
      } else {
        document.getElementById("consumption-1").innerText = 50;
        document.getElementById("amount-1").innerText = 50 * 4;
        document.getElementById("consumption-2").innerText = 50;
        document.getElementById("amount-2").innerText = 50 * 5.25;
        document.getElementById("consumption-3").innerText = 100;
        document.getElementById("amount-3").innerText = 100 * 6.8;
        document.getElementById("consumption-4").innerText = consumption - 200;
        document.getElementById("amount-4").innerText =
          Math.ceil((consumption - 200) * 7.65);
      }
      document.getElementById("tax").innerHTML = data[0].tax;  
      let tAmount = 0;

      for (let i = 1; i <= 4; i++) {
        if (document.getElementById(`amount-${i}`).innerText != "-") {
          tAmount += Number.parseInt(
            document.getElementById(`amount-${i}`).innerText
          );
        }
      }
      document.getElementById("totalAmount").innerHTML = tAmount;  
  }
  );
}
function downloadBill(){
  document.getElementById("downloadButton").style.display="none";
  window.print()
  document.getElementById("downloadButton").style.display="flex";
}
