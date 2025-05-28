from django.contrib import admin

from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject_name', 'marks', 'grade', 'teacher', 'created_at']
    list_filter = ['subject_name', 'teacher', 'created_at']
    search_fields = ['name', 'subject_name', 'teacher__username']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('name', 'subject_name', 'marks', 'teacher')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
