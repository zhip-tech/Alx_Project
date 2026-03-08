from django.urls import path
from .views import (
    index_view,
    register_view_page,
    dashboard_view,
    register_view,
    login_view,
    PlanView,
    PlanDetailView
)

urlpatterns = [
    path('', index_view, name='index'),
    path('register/', register_view_page, name='register-page'),
    path('dashboard/', dashboard_view, name='dashboard-page'),

    # Auth APIs
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),

    # Study plan APIs
    path('plans/', PlanView.as_view(), name='plans'),
    path('plans/<int:pk>/', PlanDetailView.as_view(), name='plan-detail'),
]