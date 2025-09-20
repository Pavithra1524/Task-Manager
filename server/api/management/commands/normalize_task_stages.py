from django.core.management.base import BaseCommand
from api.models import Task

class Command(BaseCommand):
    help = 'Normalize all Task.stage values to correct lowercase format (todo, in progress, completed)'

    def handle(self, *args, **options):
        mapping = {
            'in-progress': 'in progress',
            'In Progress': 'in progress',
            'IN PROGRESS': 'in progress',
            'completed': 'completed',
            'Completed': 'completed',
            'COMPLETED': 'completed',
            'todo': 'todo',
            'To Do': 'todo',
            'TODO': 'todo',
        }
        updated = 0
        for task in Task.objects.all():
            orig = task.stage
            new = mapping.get(orig, orig.lower())
            if new != orig:
                task.stage = new
                task.save(update_fields=['stage'])
                updated += 1
        self.stdout.write(self.style.SUCCESS(f'Updated {updated} tasks to normalized stage values.'))
