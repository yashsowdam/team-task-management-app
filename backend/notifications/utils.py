from .models import Notification


def create_notification(
    *,
    recipient,
    actor,
    notification_type,
    message,
    workspace=None,
    project=None,
    task=None
):
    if recipient == actor and actor is not None:
        return None

    return Notification.objects.create(
        recipient=recipient,
        actor=actor,
        notification_type=notification_type,
        message=message,
        workspace=workspace,
        project=project,
        task=task,
    )