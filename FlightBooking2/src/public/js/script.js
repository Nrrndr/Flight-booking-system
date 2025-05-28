loginBtn = document.getElementById('login');
regBtn = document.querySelector('#register');
loginForm = document.querySelector('#logForm');
regForm = document.querySelector('#regForm');

let isOpen = false;

if (loginBtn || regBtn || loginForm || regForm) {
  loginBtn.addEventListener('click', () => {
    loginForm.style.display = 'block';
    regForm.style.display = 'none';
    isOpen = true;
  });

  regBtn.addEventListener('click', () => {
    regForm.style.display = 'block';
    loginForm.style.display = 'none';
    isOpen = true;
  });

  window.addEventListener('click', (e) => {
    if (isOpen) {
      if (
        !loginForm.contains(e.target) &&
        !regForm.contains(e.target) &&
        e.target !== loginBtn &&
        e.target !== regBtn
      ) {
        loginForm.style.display = 'none';
        regForm.style.display = 'none';
        isOpen = false;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  function updateInputField() {
    const selectedType = document.querySelector(
      'input[name="reportType"]:checked'
    );

    console.log('Selected Type:', selectedType.value);

    const idField = document.getElementById('idField');
    const idLabel = document.getElementById('idLabel');
    const idInput = document.getElementById('idInput');

    if (selectedType.value === 'Monthly') {
      idField.style.display = 'none';
    } else {
      idField.style.display = 'flex';

      if (selectedType.value === 'Flight') {
        idLabel.innerText = 'Masukkan Flight ID';
        idInput.placeholder = 'Masukkan Flight ID';
        idInput.name = 'flightId';
      } else if (selectedType.value === 'Passenger') {
        idLabel.innerText = 'Masukkan Passenger ID';
        idInput.placeholder = 'Masukkan Passenger ID';
        idInput.name = 'passengerId';
      } else if (selectedType.value === 'Airport') {
        idLabel.innerText = 'Masukkan Airport Code';
        idInput.placeholder = 'Masukkan Airport Code';
        idInput.name = 'airportCode';
      }
    }
  }

  const radios = document.querySelectorAll('input[name="reportType"]');
  radios.forEach((radio) => radio.addEventListener('change', updateInputField));
  updateInputField();
});
