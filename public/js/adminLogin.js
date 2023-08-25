function validateForm() {
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value.trim();

  // Check if phone and password are empty
  if (phone === '' && password === '') {
    document.getElementById('phone').classList.add('is-invalid');
    document.getElementById('phoneFeedback').innerText = 'Phone number is required';
    document.getElementById('phoneFeedback').style.display = 'block';

    document.getElementById('password').classList.add('is-invalid');
    document.getElementById('passwordFeedback').innerText = 'Password is required';
    document.getElementById('passwordFeedback').style.display = 'block';
    document.getElementById('invalid').style.display = 'none'

    return false;
  }

  // Check if phone is empty
  else if (phone === '') {
    document.getElementById('phone').classList.add('is-invalid');
    document.getElementById('phoneFeedback').innerText = 'Phone number is required';
    document.getElementById('phoneFeedback').style.display = 'block';

    document.getElementById('password').classList.remove('is-invalid');
    document.getElementById('passwordFeedback').style.display = 'none';
    document.getElementById('invalid').style.display = 'none'

    return false;
  }

  // Check if password is empty
  else if (password === '') {
    document.getElementById('password').classList.add('is-invalid');
    document.getElementById('passwordFeedback').innerText = 'Password is required';
    document.getElementById('passwordFeedback').style.display = 'block';

    document.getElementById('phone').classList.remove('is-invalid');
    document.getElementById('phoneFeedback').style.display = 'none';  
    document.getElementById('invalid').style.display = 'none'

    if (phone.length !== 10) {
      document.getElementById('phoneFeedback').style.display = 'block';  
      document.getElementById('phoneFeedback').innerText = 'Phone number should be 10 digits.';
    }
    return false;
  }
  else if (phone.length !== 10) {
    document.getElementById('phone').classList.add('is-invalid');
    document.getElementById('phoneFeedback').innerText = 'Phone number should be 10 digits.';
    document.getElementById('phoneFeedback').style.display = 'block';

    document.getElementById('password').classList.remove('is-invalid');
    document.getElementById('passwordFeedback').style.display = 'none';
    document.getElementById('invalid').style.display = 'none'

    return false;
  }

  // Validation passed, clear any previous validation messages
  document.getElementById('phone').classList.remove('is-invalid');
  document.getElementById('phoneFeedback').style.display = 'none';
  document.getElementById('password').classList.remove('is-invalid');
  document.getElementById('passwordFeedback').style.display = 'none';

  // Send the login request
  $.post('/loginPage', {
    phone: phone,
    password: password
  }, (data) => {
    const invalid = document.getElementById('invalid')
    if (data.isValid) {
      sessionStorage.setItem('sid', data.session);
      if (!data.isAdmin) {
        console.log("first")
        window.location.href=`/consumerDashboard?s=${data.session}`
      } else {
        window.location.href = `/adminDashboard?s=${data.session}`
      }
    } else {
      invalid.style.display='block'
      invalid.innerText = "Invalid Credentials.."
    }
  }).fail((xhr) => {
    console.log(xhr);
  });

  // Prevent the form from submitting by returning false
  return false;
}