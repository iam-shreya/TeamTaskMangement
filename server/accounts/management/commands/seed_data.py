import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

from projects.models import Project, ProjectMember
from tasks.models import Task
from teams.models import Team, TeamMember

User = get_user_model()

AVATAR_COLORS = [
    '#6C63FF', '#00D4AA', '#FF6B6B', '#FFB86C',
    '#50C8FF', '#FF79C6', '#8BE9FD',
]

DUMMY_MEMBERS = [
    {'name': 'Monika',    'email': 'monika@planex.dev'},
    {'name': 'Dev',       'email': 'dev@planex.dev'},
    {'name': 'Abhay',     'email': 'abhay@planex.dev'},
    {'name': 'Animesh',   'email': 'animesh@planex.dev'},
    {'name': 'Priya',     'email': 'priya@planex.dev'},
    {'name': 'Sneha',     'email': 'sneha@planex.dev'},
    {'name': 'Dhananjay', 'email': 'dhananjay@planex.dev'},
    {'name': 'Manya',     'email': 'manya@planex.dev'},
    {'name': 'Sachin',    'email': 'sachin@planex.dev'},
    {'name': 'Vaishnavi', 'email': 'vaishnavi@planex.dev'},
    {'name': 'Jatin',     'email': 'jatin@planex.dev'},
    {'name': 'Vedant',    'email': 'vedant@planex.dev'},
    {'name': 'Alok',      'email': 'alok@planex.dev'},
]

PROJECTS = [
    {'name': 'Talos',  'description': 'AI-powered threat detection and security analytics platform', 'color': '#6C63FF'},
    {'name': 'Valor',  'description': 'Next-gen e-commerce solution with real-time inventory management', 'color': '#00D4AA'},
    {'name': 'Atlas',  'description': 'Cloud infrastructure monitoring and auto-scaling dashboard', 'color': '#FF6B6B'},
    {'name': 'Vindex', 'description': 'Data pipeline orchestration and ETL management system', 'color': '#FFB86C'},
]

# Each member appears in exactly ONE project (no overlap)
PROJECT_MEMBERS = {
    'Talos':  ['Monika', 'Dev', 'Abhay'],
    'Valor':  ['Animesh', 'Priya', 'Sneha', 'Jatin'],
    'Atlas':  ['Dhananjay', 'Manya', 'Sachin'],
    'Vindex': ['Vaishnavi', 'Vedant', 'Alok'],
}

TEAMS = [
    {'name': 'Team Alpha', 'color': '#6C63FF', 'members': ['Monika', 'Dev', 'Abhay', 'Animesh']},
    {'name': 'Team Beta',  'color': '#00D4AA', 'members': ['Priya', 'Sneha', 'Dhananjay', 'Manya']},
    {'name': 'Team Gamma', 'color': '#FF79C6', 'members': ['Sachin', 'Vaishnavi', 'Jatin', 'Vedant', 'Alok']},
]

TASKS_DATA = [
    # Talos project tasks
    {'project': 'Talos', 'title': 'Set up authentication microservice', 'status': 'DONE', 'priority': 'HIGH', 'assignee': 'Monika', 'days_due': -5},
    {'project': 'Talos', 'title': 'Implement threat scoring algorithm', 'status': 'IN_PROGRESS', 'priority': 'URGENT', 'assignee': 'Dev', 'days_due': 3},
    {'project': 'Talos', 'title': 'Build real-time alert dashboard', 'status': 'TODO', 'priority': 'HIGH', 'assignee': 'Abhay', 'days_due': 7},
    {'project': 'Talos', 'title': 'Write API documentation', 'status': 'TODO', 'priority': 'LOW', 'assignee': 'Monika', 'days_due': 14},
    {'project': 'Talos', 'title': 'Configure CI/CD pipeline', 'status': 'DONE', 'priority': 'MEDIUM', 'assignee': 'Dev', 'days_due': -10},

    # Valor project tasks
    {'project': 'Valor', 'title': 'Design product listing UI', 'status': 'DONE', 'priority': 'HIGH', 'assignee': 'Animesh', 'days_due': -8},
    {'project': 'Valor', 'title': 'Implement shopping cart logic', 'status': 'IN_PROGRESS', 'priority': 'HIGH', 'assignee': 'Priya', 'days_due': 2},
    {'project': 'Valor', 'title': 'Build payment gateway integration', 'status': 'TODO', 'priority': 'URGENT', 'assignee': 'Sneha', 'days_due': 5},
    {'project': 'Valor', 'title': 'Set up inventory tracking system', 'status': 'IN_PROGRESS', 'priority': 'MEDIUM', 'assignee': 'Jatin', 'days_due': 4},
    {'project': 'Valor', 'title': 'Create order notification emails', 'status': 'TODO', 'priority': 'LOW', 'assignee': 'Animesh', 'days_due': 10},

    # Atlas project tasks
    {'project': 'Atlas', 'title': 'Set up Prometheus metrics collector', 'status': 'DONE', 'priority': 'HIGH', 'assignee': 'Dhananjay', 'days_due': -12},
    {'project': 'Atlas', 'title': 'Build Grafana dashboard templates', 'status': 'IN_PROGRESS', 'priority': 'MEDIUM', 'assignee': 'Manya', 'days_due': 3},
    {'project': 'Atlas', 'title': 'Implement auto-scaling rules engine', 'status': 'TODO', 'priority': 'URGENT', 'assignee': 'Sachin', 'days_due': 6},
    {'project': 'Atlas', 'title': 'Write integration tests for alerts', 'status': 'TODO', 'priority': 'MEDIUM', 'assignee': 'Dhananjay', 'days_due': 8},
    {'project': 'Atlas', 'title': 'Deploy monitoring agent to staging', 'status': 'DONE', 'priority': 'HIGH', 'assignee': 'Manya', 'days_due': -3},

    # Vindex project tasks
    {'project': 'Vindex', 'title': 'Design ETL pipeline architecture', 'status': 'DONE', 'priority': 'HIGH', 'assignee': 'Vaishnavi', 'days_due': -7},
    {'project': 'Vindex', 'title': 'Build data validation framework', 'status': 'IN_PROGRESS', 'priority': 'HIGH', 'assignee': 'Vedant', 'days_due': 4},
    {'project': 'Vindex', 'title': 'Implement scheduler for batch jobs', 'status': 'TODO', 'priority': 'MEDIUM', 'assignee': 'Alok', 'days_due': 9},
    {'project': 'Vindex', 'title': 'Create data quality reports', 'status': 'IN_PROGRESS', 'priority': 'LOW', 'assignee': 'Vaishnavi', 'days_due': 5},
    {'project': 'Vindex', 'title': 'Set up error alerting for pipelines', 'status': 'TODO', 'priority': 'URGENT', 'assignee': 'Vedant', 'days_due': 2},
]


class Command(BaseCommand):
    help = 'Seed the database with dummy users, projects, teams, and tasks'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('Seeding database...'))
        today = timezone.now().date()

        # ── 1. Create Shreya as superuser ─────────────────────────────────
        shreya, created = User.objects.get_or_create(
            email='shreya@planex.dev',
            defaults={
                'username': 'shreya',
                'name': 'Shreya',
                'is_superuser': True,
                'is_staff': True,
                'avatar_color': '#FF79C6',
            },
        )
        
        # Always ensure password and permissions are correct
        shreya.set_password('Shreya@123')
        shreya.is_superuser = True
        shreya.is_staff = True
        shreya.save()
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'  [+] Created admin: Shreya (shreya@planex.dev / Shreya@123)'))
        else:
            self.stdout.write(f'  [-] Shreya already exists (updated password & permissions)')

        # ── 2. Create dummy members ───────────────────────────────────────
        users = {'Shreya': shreya}
        for member in DUMMY_MEMBERS:
            user, created = User.objects.get_or_create(
                email=member['email'],
                defaults={
                    'username': member['email'].split('@')[0],
                    'name': member['name'],
                    'avatar_color': random.choice(AVATAR_COLORS),
                },
            )
            if created:
                user.set_password('Planex@123')
                user.save()
                self.stdout.write(self.style.SUCCESS(f'  [+] Created user: {member["name"]} ({member["email"]})'))
            else:
                self.stdout.write(f'  [-] {member["name"]} already exists')
            users[member['name']] = user

        # ── 3. Create projects ────────────────────────────────────────────
        projects = {}
        for proj_data in PROJECTS:
            project, created = Project.objects.get_or_create(
                name=proj_data['name'],
                defaults={
                    'description': proj_data['description'],
                    'color': proj_data['color'],
                    'created_by': shreya,
                },
            )
            projects[proj_data['name']] = project
            if created:
                self.stdout.write(self.style.SUCCESS(f'  [+] Created project: {proj_data["name"]}'))
            else:
                self.stdout.write(f'  [-] Project {proj_data["name"]} already exists')

            # Add Shreya as ADMIN of every project
            ProjectMember.objects.get_or_create(
                project=project, user=shreya,
                defaults={'role': 'ADMIN'},
            )

            # Add designated members (no overlap)
            for member_name in PROJECT_MEMBERS.get(proj_data['name'], []):
                user = users[member_name]
                ProjectMember.objects.get_or_create(
                    project=project, user=user,
                    defaults={'role': 'MEMBER'},
                )

        # ── 4. Create teams ───────────────────────────────────────────────
        for team_data in TEAMS:
            team, created = Team.objects.get_or_create(
                name=team_data['name'],
                defaults={
                    'color': team_data['color'],
                    'created_by': shreya,
                },
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  [+] Created team: {team_data["name"]}'))
            else:
                self.stdout.write(f'  [-] Team {team_data["name"]} already exists')

            # Add Shreya as LEAD
            TeamMember.objects.get_or_create(
                team=team, user=shreya,
                defaults={'role': 'LEAD'},
            )

            # Add team members
            for member_name in team_data['members']:
                user = users[member_name]
                TeamMember.objects.get_or_create(
                    team=team, user=user,
                    defaults={'role': 'MEMBER'},
                )

        # ── 5. Create tasks ───────────────────────────────────────────────
        tasks_created = 0
        for task_data in TASKS_DATA:
            project = projects[task_data['project']]
            assignee = users[task_data['assignee']]
            due_date = today + timedelta(days=task_data['days_due'])

            task, created = Task.objects.get_or_create(
                title=task_data['title'],
                project=project,
                defaults={
                    'status': task_data['status'],
                    'priority': task_data['priority'],
                    'assignee': assignee,
                    'created_by': shreya,
                    'due_date': due_date,
                },
            )
            if created:
                tasks_created += 1

        self.stdout.write(self.style.SUCCESS(f'  [+] Created {tasks_created} tasks'))

        # ── Summary ───────────────────────────────────────────────────────
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(self.style.SUCCESS('  Seed data complete!'))
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(f'  Users:    {User.objects.count()}')
        self.stdout.write(f'  Projects: {Project.objects.count()}')
        self.stdout.write(f'  Teams:    {Team.objects.count()}')
        self.stdout.write(f'  Tasks:    {Task.objects.count()}')
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('  Admin login:'))
        self.stdout.write(f'    Email:    shreya@planex.dev')
        self.stdout.write(f'    Password: Shreya@123')
        self.stdout.write('')
