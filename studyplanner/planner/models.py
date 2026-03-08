from django.db import models
from django.contrib.auth.models import User

class StudyPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_plans')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    priority = models.CharField(
        max_length=10,
        choices=[('high','High'),('medium','Medium'),('low','Low')],
        default='medium'
    )

    due_date = models.DateField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} ({self.user.username})"

class Task(models.Model):
    studyplan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name="tasks")
    task_title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.task_title