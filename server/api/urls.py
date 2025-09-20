from django.urls import path
from . import views



urlpatterns = [
    path("tasks/<str:task_id>/change-priority/", views.change_task_priority_view),
    path("token/", views.login_view),
    path("register/", views.register_view),
    path("logout/", views.logout_view),
    path("profile/", views.update_profile_view),
    path("get-team/", views.get_team_view),
    path("get-status/", views.get_user_task_status_view),
    path("notices/", views.get_notifications_view),
    path("read-noti/", views.mark_noti_read_view),
    path("change-password/", views.change_password_view),
    path("tasks/", views.tasks_collection_view),
    path("tasks/dashboard/", views.tasks_dashboard_view),
    path("tasks/<str:task_id>/", views.task_item_view),
    path("tasks/<str:task_id>/subtask/", views.create_subtask_view),
    path("tasks/<str:task_id>/activity/", views.post_activity_view),
    path("tasks/<str:task_id>/change-stage/", views.change_task_stage_view),
    path(
        "tasks/<str:task_id>/change-status/<str:sub_id>/",
        views.change_subtask_status_view,
    ),
    path("tasks/duplicate/<str:task_id>/", views.duplicate_task_view),
    path("tasks/<str:task_id>/delete-restore/", views.delete_restore_task_view),

    # Keep catch-all user id route last to avoid shadowing other endpoints
    path("<str:user_id>/", views.user_item_view),
    
]


