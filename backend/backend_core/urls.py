from django.contrib import admin
from django.urls import path
from api import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/exam/<uuid:exam_id>/', views.get_exam),
    path('api/submit/<uuid:exam_id>/', views.submit_exam),
    path('api/check/<uuid:exam_id>/', views.check_status),
]