
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Task
from .serializers import TaskSerializer

@api_view(["PUT"])  # /api/tasks/<id>/change-priority/
@permission_classes([AllowAny])
@csrf_exempt
def change_task_priority_view(request, task_id: str):
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"status": False, "message": "Not found"}, status=404)
    priority = (request.data.get("priority") or "normal").lower()
    valid_priorities = {"high", "medium", "normal", "low"}
    if priority and priority in valid_priorities:
        task.priority = priority
        task.save()
        serializer = TaskSerializer(task)
        return Response({"status": True, "message": "priority changed", "task": serializer.data})
    return Response({"status": False, "message": "Invalid or missing priority value"}, status=400)


@api_view(["POST"])  # /api/token/
@permission_classes([AllowAny])
@csrf_exempt
def login_view(request):


    email = (request.data.get("email") or "").strip().lower()
    password = (request.data.get("password") or "").strip()

    if not email:
        return Response({"message": "Email is required"}, status=400)

    # Permissive login: create user if not exists; accept any password
    user, created = User.objects.get_or_create(
        username=email,
        defaults={"email": email, "first_name": email.split("@")[0].title()},
    )

    # If a password is provided and user is newly created (or has no usable pw), set it
    if created or not user.has_usable_password():
        user.set_password(password or "changeme")
        user.save()

    # Elevate dev@example.com to admin for management actions
    if email == "dev@example.com" and not user.is_staff:
        user.is_staff = True
        user.save(update_fields=["is_staff"])

    # Issue JWT tokens but do not block login if password mismatch
    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "id": user.id,
            "name": (user.first_name or user.username),
            "email": user.email,
            "isAdmin": user.is_staff,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
    )


@api_view(["POST"])  # /api/register/
@permission_classes([AllowAny])
def register_view(request):
    from django.contrib.auth.models import User
    from .models import UserProfile
    data = request.data or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "changeme").strip()
    name = (data.get("name") or "").strip()
    title = (data.get("title") or "Member").strip()
    role = (data.get("role") or "Member").strip()

    if not email:
        return Response({"message": "Email is required"}, status=400)

    user, created = User.objects.get_or_create(
        username=email,
        defaults={"email": email, "first_name": name, "is_staff": (role == "Manager"), "is_superuser": (role == "Admin")},
    )
    if created or not user.has_usable_password():
        user.set_password(password)
        user.save()
    # Update title/role if provided
    if title == "Manager" and not user.is_staff:
        user.is_staff = True
        user.save(update_fields=["is_staff"])
    if title == "Admin" and not user.is_superuser:
        user.is_superuser = True
        user.save(update_fields=["is_superuser"])
    # Always create or update UserProfile
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.title = title
    profile.role = role
    profile.save()
    return Response({"status": True, "message": "User registered successfully", "user": {"id": user.id, "name": user.first_name, "email": user.email, "title": profile.title, "role": profile.role}})


@api_view(["POST"])  # /api/logout/
def logout_view(request):
    return Response({"detail": "stub"})


@api_view(["PUT"])  # /api/profile/
def update_profile_view(request):
    from django.contrib.auth.models import User
    from .models import UserProfile
    data = request.data or {}
    user_id = data.get("id")
    name = data.get("name")
    title = data.get("title")
    role = data.get("role")
    email = data.get("email")

    if not user_id:
        return Response({"status": False, "message": "User ID required"}, status=400)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"status": False, "message": "User not found"}, status=404)

    if name:
        user.first_name = name
    if email:
        user.email = email
    # Update or create UserProfile for title/role
    profile, created = UserProfile.objects.get_or_create(user=user)
    if title:
        profile.title = title
    if role:
        profile.role = role
    profile.save()
    # Also update is_staff/is_superuser for role
    if role == "Admin":
        user.is_superuser = True
        user.is_staff = True
    elif role == "Manager":
        user.is_superuser = False
        user.is_staff = True
    else:
        user.is_superuser = False
        user.is_staff = False
    user.save()
    return Response({"status": True, "message": "User updated successfully", "user": {"id": user.id, "name": user.first_name, "email": user.email, "title": profile.title, "role": profile.role}})


@api_view(["GET"])  # /api/get-team/
def get_team_view(request):
    # Return a minimal team list so the UI can render selections
    from django.contrib.auth.models import User
    users = User.objects.all().order_by("id")
    normalized = []
    for u in users:
        name = (u.first_name or "") + (" " + u.last_name if u.last_name else "")
        name = name.strip() or u.username
        # Always try to get title/role from UserProfile
        title = None
        role = None
        if hasattr(u, "profile"):
            title = getattr(u.profile, "title", None)
            role = getattr(u.profile, "role", None)
        if not title:
            title = "Admin" if u.is_superuser else "Manager" if u.is_staff else "Member"
        if not role:
            role = title
        normalized.append({
            "_id": u.id,
            "name": name,
            "title": title,
            "role": role,
            "email": u.email,
            "isActive": u.is_active,
        })
    return Response(normalized)


@api_view(["GET"])  # /api/get-status/
def get_user_task_status_view(request):
    # Minimal status view: return empty for now
    return Response([])


@api_view(["GET"])  # /api/notices/
def get_notifications_view(request):
    from .models import Notice
    from .serializers import NoticeSerializer
    notices = Notice.objects.all().order_by('-created_at')
    serializer = NoticeSerializer(notices, many=True)
    return Response(serializer.data)


@api_view(["PUT"])  # /api/read-noti/
def mark_noti_read_view(request):
    return Response({"detail": "stub"})


@api_view(["PUT"])  # /api/change-password/
def change_password_view(request):
    return Response({"detail": "stub"})


@api_view(["PUT", "DELETE"])  # /api/<user_id>/
@permission_classes([AllowAny])
@csrf_exempt
def user_item_view(request, user_id: str):
    import sys
    print(f"[DEBUG] PUT /api/{user_id}/ request.data: {request.data}", file=sys.stderr)
    # Support enabling/disabling or deleting a user for the admin page
    from django.contrib.auth.models import User

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"status": False, "message": "User not found"}, status=404)

    if request.method == "DELETE":
        user.delete()
        return Response({"status": True, "message": "User deleted successfully"})

    if request.method == "PUT":
        data = request.data or {}
        name = data.get("name")
        title = data.get("title")
        role = data.get("role")
        email = data.get("email")
        is_active = data.get("isActive")

        if name:
            user.first_name = name
        if email:
            user.email = email
        if is_active is not None:
            user.is_active = bool(is_active)
        # Update or create UserProfile for title/role
        from .models import UserProfile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if title:
            profile.title = title
        if role:
            profile.role = role
        profile.save()
        # Also update is_staff/is_superuser for role
        if role == "Admin":
            user.is_superuser = True
            user.is_staff = True
        elif role == "Manager":
            user.is_superuser = False
            user.is_staff = True
        else:
            user.is_superuser = False
            user.is_staff = False
        user.save()
        return Response({"status": True, "message": "User updated successfully", "user": {"id": user.id, "name": user.first_name, "email": user.email, "title": profile.title, "role": profile.role}})


@api_view(["GET", "POST", "OPTIONS"])  # /api/tasks/
@permission_classes([AllowAny])
@csrf_exempt
def tasks_collection_view(request):
    if request.method == "GET":
        stage = (request.GET.get("stage") or "").strip().lower()
        is_trashed_param = request.GET.get("isTrashed")
        search = (request.GET.get("search") or "").strip().lower()

        queryset = Task.objects.all()
        if is_trashed_param in ("true", "1"):
            queryset = queryset.filter(is_trashed=True)
        elif is_trashed_param in ("false", "0", ""):
            queryset = queryset.filter(is_trashed=False)
        if stage:
            queryset = queryset.filter(stage=stage)
        if search:
            queryset = queryset.filter(title__icontains=search)
        queryset = queryset.order_by("-created_at")
        serializer = TaskSerializer(queryset, many=True)
        return Response({"status": True, "tasks": serializer.data})

    # POST create task
    payload = request.data or {}
    title = payload.get("title") or "Untitled"
    stage = (payload.get("stage") or "todo").lower()
    priority = (payload.get("priority") or "normal").lower()
    date = payload.get("date")
    assets = payload.get("assets") or []
    links = payload.get("links") or []
    description = payload.get("description") or ""
    team_ids = [m.get("_id") for m in payload.get("team", []) if isinstance(m, dict) and m.get("_id")]

    task = Task.objects.create(
        title=title,
        stage=stage,
        priority=priority,
        description=description,
        assets=assets,
        links=links,
    )
    if team_ids:
        task.team.set(team_ids)
    task.save()

    # Create notifications for all team members if admin adds a task
    from .models import Notice, User
    if team_ids:
        noti = Notice.objects.create(
            text=f"You have been assigned a new task: {title}",
            task=task,
            noti_type="alert",
        )
        noti.team.set(team_ids)
        noti.save()

    serializer = TaskSerializer(task)
    return Response({"status": True, "task": serializer.data, "message": "Task created successfully."})


@api_view(["GET"])  # /api/tasks/dashboard/
@permission_classes([AllowAny])
def tasks_dashboard_view(request):
    from .models import Task
    user = request.user if request.user.is_authenticated else None
    tasks_qs = Task.objects.filter(is_trashed=False)
    if user and not user.is_superuser and not user.is_staff:
        tasks_qs = tasks_qs.filter(team=user)
    totals = {}
    for t in tasks_qs:
        s = t.stage
        totals[s] = totals.get(s, 0) + 1
    pr_counts = {}
    for t in tasks_qs:
        p = t.priority
        pr_counts[p] = pr_counts.get(p, 0) + 1
    graph = [{"name": k, "total": v} for k, v in pr_counts.items()]
    last10 = TaskSerializer(tasks_qs.order_by('-created_at')[:10], many=True).data
    return Response({
        "status": True,
        "totalTasks": tasks_qs.count(),
        "tasks": totals,
        "graphData": graph,
        "last10Task": last10,
        "users": [],
    })


@api_view(["GET", "PUT"])  # /api/tasks/<id>/
@permission_classes([AllowAny])
def task_item_view(request, task_id: str):
    from .models import Task
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"status": False, "message": "Not found"}, status=404)
    if request.method == "GET":
        from .serializers import TaskSerializer
        serializer = TaskSerializer(task)
        return Response({"status": True, "task": serializer.data})
    # PUT: if empty body, mark trashed; else update fields
    payload = request.data or {}
    if not payload:
        task.is_trashed = True
        task.save()
    else:
        for key in ["title", "date", "priority", "assets", "stage", "links", "description"]:
            if key in payload and payload[key] is not None:
                setattr(task, key, payload[key])
        if "team" in payload and payload["team"] is not None:
            team_ids = [m.get("_id") for m in payload["team"] if isinstance(m, dict) and m.get("_id")]
            task.team.set(team_ids)
        task.save()
    return Response({"status": True, "message": "updated"})


@api_view(["PUT"])  # /api/tasks/<id>/subtask/
@permission_classes([AllowAny])
@csrf_exempt
def create_subtask_view(request, task_id: str):
    from .models import Task, SubTask
    from .serializers import TaskSerializer
    payload = request.data or {}
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"status": False, "message": "Task not found"}, status=404)
    subtask = SubTask.objects.create(
        task=task,
        title=payload.get("title", ""),
        date=payload.get("date", None),
        tag=payload.get("tag", ""),
        is_completed=False,
    )
    serializer = TaskSerializer(task)
    return Response({"status": True, "task": serializer.data, "message": "subtask added"})


@api_view(["POST"])  # /api/tasks/<id>/activity/
@permission_classes([AllowAny])
@csrf_exempt
def post_activity_view(request, task_id: str):
    from .models import Task, Activity
    from .serializers import TaskSerializer
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"status": False, "message": "Task not found"}, status=404)
    payload = request.data or {}
    activity_type = payload.get("type", "commented")
    activity_text = payload.get("activity", "")
    user = request.user if request.user.is_authenticated else None
    Activity.objects.create(
        task=task,
        type=activity_type,
        activity=activity_text,
        by=user,
    )
    serializer = TaskSerializer(task)
    return Response({"status": True, "message": "activity posted", "task": serializer.data})


@api_view(["PUT"])  # /api/tasks/<id>/change-stage/
@permission_classes([AllowAny])
@csrf_exempt
def change_task_stage_view(request, task_id: str):
    from .models import Task
    from .serializers import TaskSerializer
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"status": False, "message": "Not found"}, status=404)
    stage = (request.data.get("stage") or "").lower()
    valid_stages = {"todo", "in progress", "completed"}
    if stage and stage in valid_stages:
        task.stage = stage
        task.save()
        serializer = TaskSerializer(task)
        return Response({"status": True, "message": "stage changed", "task": serializer.data})
    return Response({"status": False, "message": "Invalid or missing stage value"}, status=400)


@api_view(["PUT"])  # /api/tasks/<id>/change-status/<subId>/
@permission_classes([AllowAny])
@csrf_exempt
def change_subtask_status_view(request, task_id: str, sub_id: str):
    return Response({"status": True, "message": "subtask status changed"})


@api_view(["POST"])  # /api/tasks/duplicate/<id>/
@permission_classes([AllowAny])
@csrf_exempt
def duplicate_task_view(request, task_id: str):
    return Response({"status": True, "message": "duplicated"})


@api_view(["DELETE"])  # /api/tasks/<id>/delete-restore/
@permission_classes([AllowAny])
@csrf_exempt
def delete_restore_task_view(request, task_id: str):
    from .models import Task
    action = (request.GET.get("actionType") or "").lower()
    if action == "delete":
        Task.objects.filter(id=task_id).delete()
    elif action == "deleteall":
        Task.objects.filter(is_trashed=True).delete()
    elif action == "restore":
        Task.objects.filter(id=task_id).update(is_trashed=False)
    elif action == "restoreall":
        Task.objects.filter(is_trashed=True).update(is_trashed=False)
    return Response({"status": True, "message": "operation done"})

from django.shortcuts import render

