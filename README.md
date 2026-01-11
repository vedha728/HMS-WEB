
# 🏥 HealthPoint Clinic – Hospital Management System

HealthPoint Clinic is a **mini Hospital Management System (HMS)** web application designed to streamline patient appointments and receptionist operations in a small clinic environment.
The project focuses on implementing **complete CRUD operations**, role-based access, and real database integration using Django and MySQL.

---

## 🚀 Features

### 👤 Patient Module

* Patient registration and login (email & password)
* View and update personal profile
* Upload past medical records (file size & type validation)
* Book appointments by selecting service, date, and time slot
* View appointment status (Pending / Confirmed / Rejected)
* View assigned token number after confirmation
* Cancel own appointments
* Pharmacy order form with mock payment interface

### 🧑‍💼 Receptionist Module

* Secure receptionist login using passkey and credentials
* Calendar-based appointment view (date-wise)
* View all appointments for a selected date
* Confirm appointments and assign token numbers
* Reject appointments
* LocalStorage-based notifications for:

  * New bookings
  * Patient cancellations

### 📄 Medical Records

* Upload medical documents (PDF, JPG, PNG, DOC, DOCX)
* File size limit enforced (max 1MB)
* Records stored securely on the server

---

## 🛠️ Tech Stack

### Backend

* Django (Python)
* Django Views returning JSON (No DRF ViewSets)
* MySQL Database

### Frontend

* HTML
* CSS (Bootstrap)
* Vanilla JavaScript (Fetch API)

### Authentication

* Custom authentication for patients
* Passkey-based authentication for receptionist

---

## 🗄️ Database Models

* **Patient**
* **Appointment**
* **MedicalRecord**

All appointment data, status updates, and token assignments are stored and managed at the **database level**, not just on the frontend.

---

## 🔗 API Endpoints

```
/api/register/
/api/login/
/api/get-profile/
/api/update-profile/
/api/upload-medical-record/
/api/book-appointment/
/api/get-appointments/
/api/cancel-appointment/

/api/reception-login/
/api/get-all-appointments/
/api/update-appointment-status/
/api/receptionist-reject/
```

---

## 📂 Project Structure (Simplified)

```
hms_project/
│
├── hosp/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── serializers.py
│   ├── utils.py
│   ├── templates/
│   └── static/
│
├── manage.py
└── requirements.txt
```

---

## ▶️ How to Run the Project

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/healthpoint-clinic.git
   ```

2. Create and activate virtual environment

   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install dependencies

   ```bash
   pip install -r requirements.txt
   ```

4. Configure MySQL database in `settings.py`

5. Run migrations

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Start the server

   ```bash
   python manage.py runserver
   ```

7. Open browser

   ```
   http://127.0.0.1:8000/
   ```

---

## 🎯 Project Scope

This project was developed as an **academic mini project** with the goal of:

* Understanding full-stack web development
* Implementing CRUD operations
* Integrating frontend with backend APIs
* Managing real database transactions
* Handling role-based workflows

Advanced features like payment gateways and email verification are intentionally kept as **future enhancements**.

---

## 🔮 Future Enhancements

* Email verification for patient accounts
* Doctor-specific dashboards
* Online payment gateway integration
* Admin panel for analytics and reports
* SMS/Email notifications

---

## 👨‍💻 Author

**Vedhaganesh K**
B.Tech – Computer Science and Business Systems
SASTRA University

---

## 📄 License

This project is created for **educational purposes**.

---

