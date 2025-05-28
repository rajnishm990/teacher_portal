from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.core.exceptions import ValidationError
from .models import Student
import re 

class TeacherLoginForm(AuthenticationForm):
    username = forms.CharField(
        max_length=254,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Username',
            'autofocus': True
        })
    )
    password = forms.CharField(
        label="Password",
        strip=False,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Password'
        })
    )

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ['name', 'subject_name', 'marks']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter student name',
                'maxlength': '100'
            }),
            'subject_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter subject name',
                'maxlength': '100'
            }),
            'marks': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter marks (0-100)',
                'min': '0',
                'max': '100',
                'step': '0.01'
            })
        }
    def clean_name(self):
        name = self.cleaned_data.get('name')
        if not re.match(r'^[a-zA-Z\s]+$', name):
            raise ValidationError("Name should only contain letters and spaces.")
        return name.strip().title()
    
    def clean_subject_name(self):
        subject = self.cleaned_data.get('subject_name')
        return subject.strip().title()
    
    def clean_marks(self):
        marks = self.cleaned_data.get('marks')
        if marks < 0 or marks > 100:
            raise ValidationError("Marks should be between 0 and 100.")
        return marks

class StudentEditForm(forms.ModelForm):
    class Meta:
        model = Student 
        fields = ['marks']
        widgets = {
            'marks': forms.NumberInput(attrs={
                'class': 'form-control form-control-sm',
                'min': '0',
                'max': '100',
                'step': '0.01'
            })
        }

