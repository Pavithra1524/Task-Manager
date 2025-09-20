from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    title = models.CharField(max_length=50, default='Member')
    role = models.CharField(max_length=50, default='Member')

    def __str__(self):
        return f"{self.user.username} Profile"
