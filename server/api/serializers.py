from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task, SubTask, Notice, Activity

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'name', 'title']

    def get_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        elif obj.first_name:
            return obj.first_name
        elif obj.username:
            return obj.username
        elif obj.email:
            return obj.email
        return "User"

    def get_title(self, obj):
        if hasattr(obj, 'is_superuser') and obj.is_superuser:
            return "Admin"
        elif hasattr(obj, 'is_staff') and obj.is_staff:
            return "Manager"
        return "Member"


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'

class SubTaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(many=True, read_only=True)

    class Meta:
        model = SubTask
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    team = UserSerializer(many=True, read_only=True)
    subTasks = SubTaskSerializer(many=True, read_only=True)
    activities = ActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = '__all__'

class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = '__all__'

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'
