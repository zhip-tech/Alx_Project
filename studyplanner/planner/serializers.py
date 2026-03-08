# planner/serializers.py
from rest_framework import serializers
from .models import StudyPlan

class StudyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlan
        fields = ['id', 'user', 'course_title', 'title', 'date', 'completed', 'created_at']
        read_only_fields = ['id', 'user', 'completed', 'created_at']