from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from datetime import datetime, timedelta
import json, jwt
from django.http import JsonResponse
from django.conf import settings
from .models import StudyPlan
from .serializers import StudyPlanSerializer

SECRET_KEY = settings.SECRET_KEY

# -----------------------------
# Auth Views
# -----------------------------
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            if not username or not email or not password:
                return JsonResponse({'error': 'Username, email, and password are required'}, status=400)
            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)
            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Email already exists'}, status=400)
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()
            return JsonResponse({'success': 'User registered successfully'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'POST method required'}, status=405)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            if not email or not password:
                return JsonResponse({'error': 'Email and password are required'}, status=400)
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({'error': 'Invalid credentials'}, status=400)
            user = authenticate(username=user.username, password=password)
            if user:
                payload = {'user_id': user.id, 'exp': datetime.utcnow() + timedelta(hours=24)}
                token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
                return JsonResponse({'token': token})
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'POST method required'}, status=405)

# -----------------------------
# Plan API
# -----------------------------
class PlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        plans = StudyPlan.objects.filter(user=request.user)
        serializer = StudyPlanSerializer(plans, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = StudyPlanSerializer(data=request.data)
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
            return Response({"message": "Deleted successfully"}, status=status.HTTP_200_OK)
        except StudyPlan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

# -----------------------------
# Task Endpoints
# -----------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_tasks(request):
    tasks = StudyPlan.objects.filter(user=request.user)

    # Filters
    status_filter = request.GET.get('status')
    priority = request.GET.get('priority')
    due_date = request.GET.get('due_date')
    sort_by = request.GET.get('sort_by')

    if status_filter:
        tasks = tasks.filter(completed=(status_filter.lower() == 'completed'))
    if priority:
        tasks = tasks.filter(priority=priority.lower())
    if due_date:
        tasks = tasks.filter(due_date=due_date)
    if sort_by:
        tasks = tasks.order_by(sort_by)

    serializer = StudyPlanSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_task_completion(request, pk):
    try:
        task = StudyPlan.objects.get(pk=pk, user=request.user)
    except StudyPlan.DoesNotExist:
        return Response({"error": "Task not found"}, status=404)

    completed_request = request.data.get('completed')
    if task.completed and completed_request == False:
        task.completed = False
        task.completed_at = None
        task.save()
    elif not task.completed and completed_request == True:
        task.completed = True
        task.completed_at = datetime.now()
        task.save()
    else:
        return Response({"error": "Invalid operation"}, status=400)

    serializer = StudyPlanSerializer(task)
    return Response(serializer.data)