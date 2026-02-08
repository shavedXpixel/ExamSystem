from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# This is the simple function that runs when you visit the main link
def home(request):
    return JsonResponse({
        "status": "online",
        "message": "Backend is running smoothly!",
        "system": "ExamSystem API"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Connects to your API app
    path('', home),  # <-- This handles the root URL (localhost:8000)
]