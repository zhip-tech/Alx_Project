

# Create your models here.

from django.db import models
from django.contrib.auth.models import User

class Course(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')

    def __str__(self):
        return self.name

class StudyPlan(models.Model):
    name = models.CharField(max_length=200)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='study_plans')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_plans')
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.name

class Task(models.Model):
    name = models.CharField(max_length=200)
    studyplan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='tasks')
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
from django.db import models
from django.contrib.auth.models import User

# StudyPlan model
from django.db import models
from django.contrib.auth.models import User

class StudyPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    priority = models.CharField(
        max_length=10,
        choices=[('high','High'),('medium','Medium'),('low','Low')],
        default='medium'
    )

    due_date = models.DateField(blank=True, null=True, default=None)
    completed_at = models.DateTimeField(blank=True, null=True, default=None)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title
    
# Task model (linked to StudyPlan)
class Task(models.Model):
    studyplan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name="tasks")
    task_title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.task_title