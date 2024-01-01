/* eslint-disable no-undef */

const form = document.getElementById('loginForm');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const alert = {
    title: 'fail',
    text: 'مشکلی پیش آمده است',
    icon: 'error',
    confirmButtonText: 'تایید',
  };

  const email = form.elements.email.value;
  const password = form.elements.password.value;

  try {
    const req = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, password}),
    });

    const res = await req.json();
    alert.title = res.status === 'fail' ? 'خطا' : 'موفق';
    alert.text = res.message;
    alert.icon = res.status === 'fail' ? 'error' : 'success';

    if (res.status === 'success') {
      window.localStorage.setItem('token', res.token);
      window.location.replace('/');
      alert.text = 'ورود با موفقیت انجام شد';
    }

    Swal.fire(alert);
  } catch (error) {
    Swal.fire(alert);
  }
});
