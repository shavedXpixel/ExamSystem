from django.urls import path
from . import views

urlpatterns = [
    path('exam/<uuid:exam_id>/', views.get_exam),
    path('submit/<uuid:exam_id>/', views.submit_exam),
    path('check/<uuid:exam_id>/', views.check_status),
]