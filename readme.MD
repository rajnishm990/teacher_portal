## Setup Instructions (README.md)

# Teacher Portal - Django Application



## Technology Stack

- **Backend**: Django 
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5
- **Database**: SQLite (development)
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

1. **Login**: Use your credentials to access the portal
2. **View Students**: See all your students with their marks and grades
3. **Add Students**: Use the "Add New Student" button to add records
4. **Edit Marks**: Click the edit icon to modify student marks inline
5. **Delete Records**: Remove student records as needed
6. **Search**: Use the search bar to find specific students or subjects


### Performance Optimizations
- Database indexing on frequently queried fields
- Pagination for large datasets
- Efficient query optimization
- Minimal database hits per page load

