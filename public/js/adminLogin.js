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

    return false;
  }

  // Check if phone is empty
  else if (phone === '') {
    document.getElementById('phone').classList.add('is-invalid');
    document.getElementById('phoneFeedback').innerText = 'Phone number is required';
    document.getElementById('phoneFeedback').style.display = 'block';

    document.getElementById('password').classList.remove('is-invalid');
    document.getElementById('passwordFeedback').style.display = 'none';

    return false;
  }

  // Check if password is empty
  else if (password === '') {
    document.getElementById('password').classList.add('is-invalid');
    document.getElementById('passwordFeedback').innerText = 'Password is required';
    document.getElementById('passwordFeedback').style.display = 'block';

    document.getElementById('phone').classList.remove('is-invalid');
    document.getElementById('phoneFeedback').style.display = 'none';

    return false;
  }

  // Check if phone has 10 digits
  else if (phone.length !== 10) {
    document.getElementById('phone').classList.add('is-invalid');
    document.getElementById('phoneFeedback').innerText = 'Phone number should be 10 digits.';
    document.getElementById('phoneFeedback').style.display = 'block';

    document.getElementById('password').classList.remove('is-invalid');
    document.getElementById('passwordFeedback').style.display = 'none';

    return false;
  }

  // Check if password has more than 10 characters
  else if (password.length > 10) {
    document.getElementById('password').classList.add('is-invalid');
    document.getElementById('passwordFeedback').innerText = 'Password should be 10 characters or less.';
    document.getElementById('passwordFeedback').style.display = 'block';

    document.getElementById('phone').classList.remove('is-invalid');
    document.getElementById('phoneFeedback').style.display = 'none';

    return false;
  }

  // Validation passed, clear any previous validation messages
  document.getElementById('phone').classList.remove('is-invalid');
  document.getElementById('phoneFeedback').style.display = 'none';
  document.getElementById('password').classList.remove('is-invalid');
  document.getElementById('passwordFeedback').style.display = 'none';

  // Send the login request
  $.post('/adminLogin', {
    phone: phone,
    password: password
  }, (data) => {
    // console.log(data)
    const invalid = document.getElementById('invalid')
    if (data.isValid) {
      if (!data.isAdmin) {
        invalid.innerText = "Consumer can't login here, Go Back"
      } else {
        // console.log('I am an admin')
        const sessionId = data.session;
        sessionStorage.setItem('sid', sessionId);
        window.location.href = `/adminDashboard?s=${sessionId}`
      }
    } else {
      invalid.innerText = "Invalid Credentials.."
    }
  }).fail((xhr) => {
    console.log(xhr);
  });

  // Prevent the form from submitting by returning false
  return false;
}

function consumerLogin(){
  window.location.href ='/'
}
