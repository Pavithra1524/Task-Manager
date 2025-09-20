
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Task(models.Model):
    title = models.CharField(max_length=255)
    date = models.DateField(auto_now_add=True)
    priority = models.CharField(max_length=20, default='normal')
    stage = models.CharField(max_length=20, default='todo')
    description = models.TextField(blank=True, null=True)
    assets = models.JSONField(default=list, blank=True)
    links = models.JSONField(default=list, blank=True)
    team = models.ManyToManyField(User, related_name='tasks')
    is_trashed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class SubTask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subTasks')
    title = models.CharField(max_length=255)
    date = models.DateField(null=True, blank=True)
    tag = models.CharField(max_length=100, blank=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Notice(models.Model):
    team = models.ManyToManyField(User, related_name='notices')
    text = models.TextField()
    task = models.ForeignKey('Task', on_delete=models.CASCADE, related_name='notices')
    noti_type = models.CharField(max_length=20, default='alert')
    is_read = models.ManyToManyField(User, related_name='read_notices', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Notice for task: {self.task.title}"

class Activity(models.Model):
    task = models.ForeignKey('Task', on_delete=models.CASCADE, related_name='activities')
    type = models.CharField(max_length=50, default='assigned')
    activity = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='activities_by')

    def __str__(self):
        return f"{self.type} by {self.by} on {self.task.title}"
    

User = get_user_model()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    title = models.CharField(max_length=50, default='Member')
    role = models.CharField(max_length=50, default='Member')

    def __str__(self):
        return f"{self.user.username} Profile"
