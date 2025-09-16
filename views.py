from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import PatientSerializer
from .models import MedicalRecord, Patient
from django.contrib.auth.hashers import check_password
from django.shortcuts import render
from django.core.mail import send_mail
from django.conf import settings
from .utils import generate_verification_token
from .utils import verify_verification_token
from .models import Appointment
from django.views.decorators.csrf import csrf_exempt

def home(request):
    return render(request, 'hosp/index.html')

def register(request):
    return render(request, 'hosp/register.html')


@api_view(['POST'])
def register_patient(request):
    serializer = PatientSerializer(data=request.data)
    if serializer.is_valid():
        # Create patient and mark as verified immediately
        patient = serializer.save(is_verified=True)
        return Response({'message': 'Registration successful! You can now log in.'}, status=201)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
def login_patient(request):
    email = request.data.get('email')
    password = request.data.get('password')
    try:
        patient = Patient.objects.get(email=email)
        if check_password(password, patient.password):
            serializer = PatientSerializer(patient)
            return Response(serializer.data)
        else:
            return Response({'error': 'Invalid credentials'}, status=401)
    except Patient.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    

@api_view(['POST'])
def update_patient_profile(request):
    email = request.data.get('email')
    try:
        patient = Patient.objects.get(email=email)
        # Update fields from request
        for field in ['first_name', 'last_name', 'age', 'blood_group', 'mobile']:
            value = request.data.get(field)
            if value is not None:
                setattr(patient, field, value)
        patient.save()
        return Response({'message': 'Profile updated successfully.'})
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found.'}, status=404)


@api_view(['POST'])
def book_appointment(request):
    email = request.data.get('email')
    appointment_date = request.data.get('appointment_date')
    doctor_name = request.data.get('doctor_name')
    reason = request.data.get('reason')
    appointment_time=request.data.get('appointment_time')
    try:
        patient = Patient.objects.get(email=email)
        appointment = Appointment.objects.create(
            patient=patient,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            doctor_name=doctor_name,
            reason=reason,
            status='Pending'
        )
        return Response({'message': 'Appointment booked successfully.'})
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found.'}, status=404)

@api_view(['POST'])
def get_patient_profile(request):
    email = request.data.get('email')
    try:
        patient = Patient.objects.get(email=email)
        data = {
            'first_name': patient.first_name,
            'last_name': patient.last_name,
            'age': patient.age,
            'blood_group': patient.blood_group,
            'mobile': patient.mobile,
        }
        return Response(data, status=200)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=404)

MAX_UPLOAD_SIZE = 1 * 1024 * 1024  # 1MB in bytes
@api_view(['POST'])
def upload_medical_record(request):
    file = request.FILES.get('file')
    email = request.POST.get('email')

    if not email:
        return Response({'error': 'Email not provided'}, status=400)

    try:
        patient = Patient.objects.get(email=email)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=404)

    if not file:
        return Response({'error': 'No file received'}, status=400)
    if file.size > MAX_UPLOAD_SIZE:
        return Response({'error': 'File size exceeds 1MB limit.'}, status=400)
    MedicalRecord.objects.create(patient=patient, file=file)
    return Response({'message': 'File uploaded successfully.'})

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def login_receptionist(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        passkey = data.get('passkey')
        # Replace with your real receptionist credential validation!
        if passkey == "7874" and username == "admin" and password == "admin123":
            # return whatever info you want to store for the receptionist session
            return JsonResponse({'success': True, 'username': username})
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
    return JsonResponse({'error': 'Invalid method'}, status=405)
@csrf_exempt
def patient_login_view(request):
    return render(request, 'hosp/patient_login.html')
@csrf_exempt
def recep_login_view(request):
    return render(request, 'hosp/recep_login.html')