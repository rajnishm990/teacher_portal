from django.shortcuts import render , redirect , get_object_or_404
from django.contrib.auth import login , logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages 
from django.http import JsonResponse 
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError, transaction
from django.core.paginator import Paginator
from django.db.models import Q
import json
import logging

logger = logging.getLogger(__name__)

from .models import Student
from .forms import TeacherLoginForm, StudentForm, StudentEditForm

def teacher_login(request):
    """Handle teacher login with proper error handling"""
    if request.user.is_authenticated:
        return redirect('portal:dashboard')
    
    if request.method == 'POST':
        form = TeacherLoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f'Welcome back, {user.get_full_name() or user.username}!')
            return redirect('portal:dashboard')
        else:
            messages.error(request, 'Invalid username or password. Please try again.')
    else:
        form = TeacherLoginForm()
    
    return render(request, 'login.html', {'form': form})

@require_http_methods(["POST"])
def teacher_logout(request):
    """Handle teacher logout"""
    logout(request)
    messages.info(request, 'You have been successfully logged out.')
    return redirect('portal:login')

@login_required
def dashboard(request):
    """Display student listing with search and pagination"""
    search_query = request.GET.get('search', '').strip()
    students_list = Student.objects.filter(teacher=request.user)
    
    if search_query:
        students_list = students_list.filter(
            Q(name__icontains=search_query) | 
            Q(subject_name__icontains=search_query)
        )
    
    # Pagination
    paginator = Paginator(students_list, 10)
    page_number = request.GET.get('page')
    students = paginator.get_page(page_number)
    
    context = {
        'students': students,
        'search_query': search_query,
        'total_students': students_list.count(),
        'form': StudentForm(),
    }
    
    return render(request, 'dashboard.html', context)

@login_required
@require_http_methods(["POST"])
def add_student(request):
    """Add new student or update existing marks"""
    try:
        form = StudentForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            subject_name = form.cleaned_data['subject_name']
            marks = form.cleaned_data['marks']
            
            with transaction.atomic():
                # Check if student with same name and subject exists
                existing_student = Student.objects.filter(
                    name=name,
                    subject_name=subject_name,
                    teacher=request.user
                ).first()
                
                if existing_student:
                    # Update existing marks by adding new marks
                    old_marks = existing_student.marks
                    existing_student.marks = min(old_marks + marks, 100)  # Cap at 100
                    existing_student.save()
                    
                    messages.success(
                        request,
                        f'Updated marks for {name} in {subject_name}. '
                        f'Previous: {old_marks}, Added: {marks}, New Total: {existing_student.marks}'
                    )
                else:
                    # Create new student record
                    student = form.save(commit=False)
                    student.teacher = request.user
                    student.save()
                    
                    messages.success(
                        request,
                        f'Successfully added {name} with {marks} marks in {subject_name}.'
                    )
                
                return JsonResponse({'success': True})
        else:
            errors = []
            for field, error_list in form.errors.items():
                errors.extend(error_list)
            return JsonResponse({'success': False, 'errors': errors})
            
    except Exception as e:
        logger.error(f"Error adding student: {str(e)}")
        return JsonResponse({'success': False, 'errors': ['An unexpected error occurred.']})

@login_required
@require_http_methods(["POST"])
def update_student(request, student_id):
    """Update student marks"""
    try:
        student = get_object_or_404(Student, id=student_id, teacher=request.user)
        form = StudentEditForm(request.POST, instance=student)
        
        if form.is_valid():
            old_marks = student.marks
            form.save()
            
            messages.success(
                request,
                f'Updated marks for {student.name} in {student.subject_name} '
                f'from {old_marks} to {student.marks}.'
            )
            return JsonResponse({'success': True})
        else:
            errors = []
            for field, error_list in form.errors.items():
                errors.extend(error_list)
            return JsonResponse({'success': False, 'errors': errors})
            
    except Exception as e:
        logger.error(f"Error updating student: {str(e)}")
        return JsonResponse({'success': False, 'errors': ['Failed to update student.']})

@login_required
@require_http_methods(["POST"])
def delete_student(request, student_id):
    """Delete student record"""
    try:
        student = get_object_or_404(Student, id=student_id, teacher=request.user)
        student_name = student.name
        student_subject = student.subject_name
        student.delete()
        
        messages.success(request, f'Successfully deleted {student_name} from {student_subject}.')
        return JsonResponse({'success': True})
        
    except Exception as e:
        logger.error(f"Error deleting student: {str(e)}")
        return JsonResponse({'success': False, 'errors': ['Failed to delete student.']})