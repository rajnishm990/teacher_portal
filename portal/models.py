from django.db import models
from django.contrib.auth.models import User 
from django.core.validators import MaxValueValidator , MinValueValidator
from django.db.models import UniqueConstraint 


class Student(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    subject_name = models.CharField(max_length=100, db_index=True)
    marks = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='students')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        constraints = [
            UniqueConstraint(
                fields=['name', 'subject_name', 'teacher'],
                name='unique_student_subject_teacher'
            )
        ]
        ordering = ['name', 'subject_name']
        indexes = [
            models.Index(fields=['name', 'subject_name']),
            models.Index(fields=['teacher', 'created_at']),
        ]

    def __str__(self):
        return f"{self.name} - {self.subject_name} ({self.marks})"

    @property
    def grade(self):
        """calculates grades based on marks"""
        if self.marks >= 90:
            return 'A+'
        elif self.marks >= 80:
            return 'A'
        elif self.marks >= 70:
            return 'B'
        elif self.marks >= 60:
            return 'C'
        elif self.marks >= 50:
            return 'D'
        else:
            return 'F'


