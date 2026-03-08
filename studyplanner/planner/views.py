from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.http import JsonResponse
from datetime import datetime, timedelta
import json, jwt
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import StudyPlan
from .serializers import StudyPlanSerializer

SECRET_KEY = settings.SECRET_KEY

# -------- Frontend pages --------
def index_view(request):
    return render(request, 'index.html')

def register_view_page(request):
    return render(request, 'register.html')

def dashboard_view(request):
    return render(request, 'dashboard.html')


# -------- Auth API --------
@csrf_exempt
def register_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        if not username or not email or not password:
            return JsonResponse({'error': 'All fields required'}, status=400)
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username exists'}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email exists'}, status=400)
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        return JsonResponse({'success': 'User registered'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return JsonResponse({'error': 'Email & password required'}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
        user = authenticate(username=user.username, password=password)
        if not user:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
        payload = {'user_id': user.id, 'exp': datetime.utcnow() + timedelta(days=1)}
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        return JsonResponse({'token': token})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# -------- Study Plans API --------
class PlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        plans = StudyPlan.objects.filter(user=request.user)
        serializer = StudyPlanSerializer(plans, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id
        serializer = StudyPlanSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PlanDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            plan = StudyPlan.objects.get(pk=pk, user=request.user)
            plan.delete()
            return Response({"message": "Deleted"}, status=status.HTTP_200_OK)
        except StudyPlan.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)