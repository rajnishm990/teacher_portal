from django.urls import path
from . import views

app_name = 'portal'

urlpatterns = [
    path('', views.teacher_login, name='login'),
    path('logout/', views.teacher_logout, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('student/add/', views.add_student, name='add_student'),
    path('student/<int:student_id>/update/', views.update_student, name='update_student'),
    path('student/<int:student_id>/delete/', views.delete_student, name='delete_student'),
]