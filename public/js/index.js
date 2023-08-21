function handleLogin() {
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();

  if (phone.length == 10 && password.length > 0) {
    $.post("/consumerLogin",
      {
        phone: phone,
        password: password,
      },
      (data) => {
        if(data.block){
          document.getElementById("loginMessage").innerText ="Account is blocked, Please contact Admin to login!!";
        }
        else if(data.valid==false)
        {
          document.getElementById("loginMessage").innerText ="Invalid credentials. Please try again!!";
        }
        else{
          const sessionId = data;
          sessionStorage.setItem("sid", sessionId);
          window.location.href = `/consumerDashboard?s=${sessionId}`;
        }
        
      }
    ).error = (xhr) => {
      console.log(xhr);
    };
  } else {
    document.getElementById("loginMessage").innerText ="Invalid credentials. Please try again.";
  }
}

function adminPage(){
  window.location.href = '/admin'
}
