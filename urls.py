from django.urls import path
from . import views

urlpatterns = [
    # Template rendering views (for browser navigation)
    path('', views.home, name='home'),  # /
    path('register/', views.register, name='register'),

    # API endpoints (for AJAX/fetch)
    path('api/register/', views.register_patient, name='api_register'),
    path('api/login/', views.login_patient, name='api_login'),
    path('api/update-profile/', views.update_patient_profile, name='update_profile'),
    path('api/get-profile/', views.get_patient_profile, name='get_profile'),
    path('api/upload-medical-record/', views.upload_medical_record, name='upload_medical_record'),  # New
    path('api/book-appointment/', views.book_appointment, name='book_appointment'),
    path('api/reception-login/', views.login_receptionist, name='api_reception_login'),
    path('patient_login/', views.patient_login_view, name='patient_login'),
    path('recep_login/', views.recep_login_view, name='recep_login'),
    #Email verification
    #path('verify-email/<str:token>/', views.verify_email, name='verify_email'),
]

from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
