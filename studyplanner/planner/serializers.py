from rest_framework import serializers
from .models import StudyPlan

class StudyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlan
        fields = ['id', 'title', 'description', 'priority', 'due_date', 'completed', 'completed_at']