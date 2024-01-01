/* eslint-disable no-undef */

const form = document.getElementById('signUpForm');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const alert = {
    title: 'fail',
    text: 'مشکلی پیش آمده است',
    icon: 'error',
    confirmButtonText: 'تایید',
  };

  const name = form.elements.name.value;
  const email = form.elements.email.value;
  const password = form.elements.password.value;
  const confirmPassword = form.elements.confirmPassword.value;

  if (password !== confirmPassword) {
    return Swal.fire({
      title: 'fail',
      text: 'تکرار رمز اشتباه است',
      icon: 'error',
      confirmButtonText: 'تایید',
    });
  }

  try {
    const req = await fetch('http://localhost:3000/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({name, email, password, confirmPassword}),
    });

    const res = await req.json();
    alert.title = res.status === 'fail' || res.status === 'error' ? 'خطا' : 'موفق';
    alert.text = res.message;
    alert.icon = res.status === 'fail' ? 'error' : res.status;

    if (res.status === 'success') {
      window.localStorage.setItem('token', res.token);
      alert.text = 'ثبت نام با موفقیت انجام شد';
    }

    Swal.fire(alert);
  } catch (error) {
    Swal.fire(alert);
  }
});
