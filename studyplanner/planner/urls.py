from django.urls import path
from .views import (
    register_view, login_view,
    PlanView, PlanDetailView,
    list_tasks, toggle_task_completion
)

urlpatterns = [
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('plans/', PlanView.as_view(), name='plans'),
    path('plans/<int:pk>/', PlanDetailView.as_view(), name='plan-detail'),
    path('tasks/', list_tasks, name='list-tasks'),
    path('tasks/<int:pk>/toggle/', toggle_task_completion, name='toggle-task'),
]