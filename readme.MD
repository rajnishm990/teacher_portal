## Setup Instructions (README.md)
```markdown
# Teacher Portal - Django Application

A robust web application for teachers to manage student records with authentication, CRUD operations, and responsive design.

## Features

- **Secure Authentication**: Login/logout functionality for teachers
- **Student Management**: Add, edit, delete student records
- **Smart Duplicate Handling**: Automatically updates marks for existing student-subject combinations
- **Search & Filtering**: Find students by name or subject
- **Responsive Design**: Works on desktop and mobile devices
- **Inline Editing**: Edit student marks directly in the table
- **Grade Calculation**: Automatic grade assignment based on marks
- **Pagination**: Efficient handling of large student lists

## Technology Stack

- **Backend**: Django 4.2.7
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5
- **Database**: SQLite (development), PostgreSQL recommended for production
- **Authentication**: Django's built-in authentication system

## Installation & Setup

### Prerequisites
- Python 3.8+ installed
- Git installed

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd teacher_portal
```

### Step 2: Create Virtual Environment
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Environment Configuration
Create a `.env` file in the project root:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
```

### Step 5: Database Setup
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 6: Create Superuser
```bash
python manage.py createsuperuser
```

### Step 7: Run Development Server
```bash
python manage.py runserver
```

Visit `http://127.0.0.1:8000` to access the application.

## Usage

### For Teachers:
1. **Login**: Use your credentials to access the portal
2. **View Students**: See all your students with their marks and grades
3. **Add Students**: Use the "Add New Student" button to add records
4. **Edit Marks**: Click the edit icon to modify student marks inline
5. **Delete Records**: Remove student records as needed
6. **Search**: Use the search bar to find specific students or subjects

### For Administrators:
- Access the Django admin panel at `/admin/`
- Manage users, students, and system settings

## Project Structure

```
teacher_portal/
├── teacher_portal/          # Django project settings
├── portal/                  # Main application
│   ├── models.py           # Database models
│   ├── views.py            # Business logic
│   ├── forms.py            # Form definitions
│   ├── urls.py             # URL routing
│   └── admin.py            # Admin interface
├── templates/              # HTML templates
├── static/                 # CSS, JS, images
├── requirements.txt        # Python dependencies
└── manage.py              # Django management script
```

## Key Features Implementation

### Smart Duplicate Handling
When adding a student with the same name and subject:
- The system checks for existing records
- If found, adds new marks to existing marks (capped at 100)
- If not found, creates a new record

### Security Features
- CSRF protection on all forms
- Input validation and sanitization
- User authentication required for all operations
- SQL injection prevention through Django ORM

### Performance Optimizations
- Database indexing on frequently queried fields
- Pagination for large datasets
- Efficient query optimization
- Minimal database hits per page load

