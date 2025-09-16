console.log("recep_log.js loaded");
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
const RECEPTION_CREDENTIALS = { username: 'admin', password: 'admin123' };
let calendarYear = (new Date()).getFullYear();
let calendarMonth = (new Date()).getMonth();
let receptionistSelectedDate = null;
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
async function handleReceptionLogin(event) {
  event.preventDefault();
  console.log('Receptionist login function triggered');
  const passkey = document.getElementById('receptionPasskey').value;
  const username = document.getElementById('receptionUser').value;
  const password = document.getElementById('receptionPass').value;
  const loginBtn = document.getElementById('receptionLoginBtn');
  loginBtn.disabled = true;
  loginBtn.innerHTML = 'Logging in...';
  try {
      const response = await fetch('/api/reception-login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passkey, username, password })
    });
    console.log('Response status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('Login success data:', data);
      alert('Receptionist logged in successfully');
      alert('Trying to show dashboard');
      console.log('Before showing dashboard');
      showSection('receptionDashboard');
      console.log('After showing dashboard');
      loadAppointments();
      console.log("renderReceptionistAppointments about to be called")
      renderReceptionistAppointments();
      renderCalendar(receptionistSelectedDate);
      loadReceptionistNotifications();
    } else {
      const error = await response.json();
      console.log('Login failed error:', error);
      alert("Login failed: " + (error.error || "Unknown error"));
    }
  } catch (err) {
    console.log('Error during login:', err);
    alert("Error: " + err.message);
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = 'Login';
  }
}

async function loadAppointments() {
  const container = document.getElementById('appointmentsList');
  if (!container) return;
  if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
    container.innerHTML = '<p>No appointments found.</p>';
    return;
  }

  container.innerHTML = appointments.map((app, index) => `
    <div class="card mb-3">
      <div class="card-body">
        <h5>${app.patientName || 'Unknown'}</h5>
        <p><strong>Service:</strong> ${app.service || 'Not specified'}</p>
        <p><strong>Date:</strong> ${app.date || 'N/A'} at ${app.time || ''}</p>
        <p><strong>Status:</strong> <span class="badge ${app.status === 'Pending' ? 'bg-warning' : 'bg-success'}">${app.status || 'Pending'}</span></p>
        <p><strong>Assigned Doctor:</strong> ${app.doctor || 'Not Assigned'}</p>
        <div class="d-flex gap-2">
          <select class="form-select w-50" onchange="assignDoctor(${index}, this.value)">
            <option value="">Assign Doctor</option>
            <option value="Dr. Rahul">Dr. Rahul</option>
            <option value="Dr. Ram">Dr. Ram</option>
            <option value="Dr. Haema">Dr. Haema</option>
          </select>
          <button onclick="confirmAppointmentWithToken(${index})" class="btn btn-sm btn-success">Confirm</button>
          <button onclick="deleteAppointment('${app.date}')" class="btn btn-sm btn-danger">Reject</button>
        </div>
        ${app.tokenNumber ? `<div class="mt-2"><strong>Token Number:</strong> <span class="badge bg-info">${app.tokenNumber}</span></div>` : ''}
      </div>
    </div>
  `).join('');
}
function renderReceptionistAppointments() {
  appointments = JSON.parse(localStorage.getItem('appointments')) || [];
  console.log("renderReceptionistAppointments ran");
  console.log('appointments at render:', appointments);
  let filtered = appointments;
  if (receptionistSelectedDate) {
    filtered = appointments.filter(app => app.date === receptionistSelectedDate);
  }
  document.getElementById('appointmentsList').innerHTML = filtered.length === 0
    ? '<p>No appointments for selected date.</p>'
    : filtered.map((app, index) => {
      // Always show token numbers 1 to 10
      let tokenOptions = '';
      for (let i = 1; i <= 10; i++) {
        tokenOptions += `<option value="${i}" ${app.tokenNumber == i ? 'selected' : ''}>${i}</option>`;
      }
      return `
      <div class="card mb-2"><div class="card-body">
        <h5>${app.patientName || app.patient || 'Unknown'}</h5>
        <p><strong>Service:</strong> ${app.service}</p>
        <p><strong>Date:</strong> ${app.date} at ${app.time}</p>
        <p><strong>Status:</strong> <span class="badge ${app.status === 'Pending' ? 'bg-warning' : 'bg-success'}">${app.status}</span></p>
        <p><strong>Assigned Doctor:</strong> ${app.doctor || 'Not Assigned'}</p>
        <div class="d-flex gap-2 align-items-center">
          <select class="form-select w-auto" id="tokenSelect_${index}">
            <option value="">Token Number</option>
            ${tokenOptions}
          </select>
          <button onclick="confirmAppointmentWithToken(${index})" class="btn btn-sm btn-success">Confirm</button>
          <button onclick="deleteAppointment('${app.date}')" class="btn btn-sm btn-danger">Reject</button>
        </div>
        ${app.tokenNumber ? `<div class='mt-2'><strong>Token Number:</strong> <span class='badge bg-info'>${app.tokenNumber}</span></div>` : ''}
      </div></div>
      `;
    }).join('');
}
function renderCalendar(selectedDateStr) {
  const year = calendarYear;
  const month = calendarMonth;
  const daysInMonth = getMonthDays(year, month);
  // Month/Year navigation
  let monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  let html = `<div class='d-flex justify-content-between align-items-center mb-2'>
    <button class='btn btn-sm btn-outline-secondary' onclick='changeCalendarMonth(-1)'>&lt;</button>
    <span class='fw-bold fs-5'>${monthNames[month]} ${year}</span>
    <button class='btn btn-sm btn-outline-secondary' onclick='changeCalendarMonth(1)'>&gt;</button>
    <select id='calendarYearSelect' class='form-select form-select-sm w-auto ms-2' onchange='changeCalendarYear(this.value)'>`;
  for (let y = year-5; y <= year+5; y++) {
    html += `<option value='${y}' ${y===year?'selected':''}>${y}</option>`;
  }
  html += `</select></div>`;
  html += '<table class="table table-bordered text-center"><tr>';
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weekDays.forEach(d => html += `<th>${d}</th>`);
  html += '</tr><tr>';
  let firstDay = new Date(year, month, 1).getDay();
  for (let i = 0; i < firstDay; i++) html += '<td></td>';
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    let cls = '';
    if (selectedDateStr === dateStr) cls = 'table-primary';
    html += `<td class="calendar-day ${cls}" data-date="${dateStr}">${d}</td>`;
    if ((firstDay + d) % 7 === 0) html += '</tr><tr>';
  }
  html += '</tr></table>';
  document.getElementById('calendarContainer').innerHTML = html;
  document.querySelectorAll('.calendar-day').forEach(td => {
    td.onclick = function() {
      receptionistSelectedDate = td.getAttribute('data-date');
      renderCalendar(receptionistSelectedDate);
      renderReceptionistAppointments();
    };
  });
}
function showSection(sectionId) {
  // Hide all dashboards
  document.querySelectorAll('.dashboard').forEach(div => div.style.display = 'none');
  // Show the requested section
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = 'block';
  } else {
    console.error("Section not found:", sectionId);
  }
  // Extra logic for dashboards
  if (sectionId === 'patientDashboard') {
    showPatientNotification();
    loadPatientAppointments();
  }
  if (sectionId === 'receptionDashboard') {
    renderReceptionistAppointments();
    renderCalendar(receptionistSelectedDate);
  }
}


// Main DOMContentLoaded: set up event handlers, initial view
document.addEventListener('DOMContentLoaded', function() {
  // 1. Show login form only at page load
  showSection('receptionAuth');

  // 2. Manage passkey input and show credentials form
  const passkeyInput = document.getElementById('receptionPasskey');
  const credentialsDiv = document.getElementById('receptionCredentials');
  const passkeyError = document.getElementById('passkeyError');
  if (passkeyInput) {
    passkeyInput.addEventListener('input', function() {
      if (passkeyInput.value === '7874') {
        credentialsDiv.style.display = 'block';
        passkeyError.style.display = 'none';
        passkeyInput.setAttribute('readonly', 'readonly');
      } else {
        credentialsDiv.style.display = 'none';
        if (passkeyInput.value.length === 4) {
          passkeyError.style.display = 'block';
        } else {
          passkeyError.style.display = 'none';
        }
      }
    });
  }

  // 3. Attach appointment form submission handler, if present
  const form = document.getElementById('addAppointmentForm');
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      const email = document.getElementById('modalPatientEmail').value.trim();
      const service = document.getElementById('modalServiceType').value;
      const date = document.getElementById('modalAppointmentDate').value;
      const time = document.getElementById('modalAppointmentTime').value;

      if (!email || !service || !date || !time) {
        document.getElementById('addAppointmentStatus').innerHTML = '<span class="text-danger">All fields are required.</span>';
        return;
      }

      // Attempt to get patient name from available patients
      let patientName = email;
      if (window.patients && Array.isArray(window.patients)) {
        const found = window.patients.find(p => p.email === email);
        if (found && found.profile && found.profile.firstName) {
          patientName = `${found.profile.firstName} ${found.profile.lastName || ''}`.trim();
        }
      }

      // Sync local storage and global appointments array
      appointments = JSON.parse(localStorage.getItem('appointments')) || [];
      appointments.push({
        patient: email,
        patientName,
        service,
        date,
        time,
        status: 'Pending',
        doctor: ''
      });
      localStorage.setItem('appointments', JSON.stringify(appointments));

      // Add notification for receptionist
      const newNotification = {
        message: `New appointment booked by ${patientName} for ${service} on ${date} at ${time}.`,
        timestamp: new Date().toISOString()
      };
      let receptionistNotifications = JSON.parse(localStorage.getItem('receptionistNotifications')) || [];
      receptionistNotifications.unshift(newNotification);
      localStorage.setItem('receptionistNotifications', JSON.stringify(receptionistNotifications));

      // Show success message and update UI after a short delay
      document.getElementById('addAppointmentStatus').innerHTML = '<span class="text-success">Appointment added.</span>';
      setTimeout(() => {
        closeAddAppointmentModal();
        renderAppointmentsWrapper();
      }, 800);
    };
  }
});

function loadReceptionistNotifications() {
  // Fetch notifications from localStorage or use an empty array if none exist
  let receptionistNotifications = JSON.parse(localStorage.getItem('receptionistNotifications')) || [];

  // Render notifications in the UI
  document.getElementById('notificationsList').innerHTML = receptionistNotifications.map(note => `
    <div class="alert alert-info">
      <p>${note.message}</p>
      <small>${new Date(note.timestamp).toLocaleString()}</small>
    </div>
  `).join('');
}
// --- Patient notification fix ---
function showPatientNotification() {
  const patient = JSON.parse(localStorage.getItem('currentPatient'));
  let show = false;
  let message = '';
  // Check if patient object exists and has a notification
  if (patient && patient.notification) {
    show = true;
    message = patient.notification;
    // After showing, clear the notification so it doesn't persist
    delete patient.notification;
    localStorage.setItem('currentPatient', JSON.stringify(patient));
  }
  const notifDiv = document.getElementById('notification');
  if (notifDiv) {
    if (show) {
      notifDiv.innerHTML = message;
      notifDiv.style.display = '';
    } else {
      notifDiv.innerHTML = '';
      notifDiv.style.display = 'none';
    }
  }
}


// --- Receptionist Calendar & Add Appointment ---
function getMonthDays(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function changeCalendarMonth(delta) {
  calendarMonth += delta;
  if (calendarMonth < 0) {
    calendarMonth = 11;
    calendarYear--;
  } else if (calendarMonth > 11) {
    calendarMonth = 0;
    calendarYear++;
  }
  renderCalendar(receptionistSelectedDate);
  renderReceptionistAppointments();
}
function changeCalendarYear(year) {
  calendarYear = parseInt(year);
  renderCalendar(receptionistSelectedDate);
  renderReceptionistAppointments();
}
// Show Add Appointment Modal
function showAddAppointmentModal() {
  console.log('Add Appointment modal - visible dashboard:', document.querySelector('.dashboard[style*="block"]')?.id);
  document.getElementById('addAppointmentModal').style.display = 'block';
  document.getElementById('addAppointmentModal').style.zIndex = '1055'; // Optional, ensure above dashboards
  document.body.classList.add('modal-open');
  document.getElementById('addAppointmentForm').reset();
  document.getElementById('addAppointmentStatus').innerHTML = '';
}
// Close Add Appointment Modal
function closeAddAppointmentModal() {
  document.getElementById('addAppointmentModal').style.display = 'none';
  document.body.classList.remove('modal-open');
  document.getElementById('addAppointmentForm').reset();
  document.getElementById('addAppointmentStatus').innerHTML = '';
}
function clearReceptionistNotifications() {
  localStorage.removeItem('receptionistNotifications');
  document.getElementById('notificationsList').innerHTML = '<p>No notifications.</p>';
}


function confirmAppointmentWithToken(index) {
  const tokenSelect = document.getElementById(`tokenSelect_${index}`);
  const tokenNumber = tokenSelect.value;
  if (!tokenNumber) {
    alert('Please select a token number before confirming.');
    return;
  }
  const appointment = appointments[index];
  appointment.tokenNumber = tokenNumber;
  appointment.status = 'Confirmed';
  localStorage.setItem('appointments', JSON.stringify(appointments));

  // Notify the patient about the confirmed appointment with token number
  let patients = JSON.parse(localStorage.getItem('patients')) || [];
  patients = patients.map(p => {
    if (p.email === appointment.patient) {
      p.notification = `Your appointment on ${appointment.date} at ${appointment.time} has been confirmed with token number ${tokenNumber}.`;
    }
    return p;
  });
  localStorage.setItem('patients', JSON.stringify(patients));
  renderReceptionistAppointments();
}

// Initial calendar and appointments
//if (document.getElementById('calendarContainer')) {
  //renderCalendar(null);
  //renderReceptionistAppointments();
//}
// This code runs when an appointment is booked successfully:
function onAppointmentBooked(patientName, serviceType, appointmentDate, appointmentTime) {
  const newNotification = {
    message: `New appointment booked by ${patientName} for ${serviceType} on ${appointmentDate} at ${appointmentTime}.`,
    timestamp: new Date().toISOString()
  };

  // Fetch existing notifications
  let receptionistNotifications = JSON.parse(localStorage.getItem('receptionistNotifications')) || [];

  // Add the new notification at the start (or end)
  receptionistNotifications.unshift(newNotification);

  // Save back to localStorage
  localStorage.setItem('receptionistNotifications', JSON.stringify(receptionistNotifications));

  // Refresh UI
  loadReceptionistNotifications();
}
