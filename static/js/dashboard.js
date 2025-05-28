class StudentManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupCSRF();
    }

    setupCSRF() {
        // Get CSRF token for AJAX requests
        this.csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    }

    bindEvents() {
        // Add student form submission
        const addStudentForm = document.getElementById('addStudentForm');
        if (addStudentForm) {
            addStudentForm.addEventListener('submit', (e) => this.handleAddStudent(e));
        }

        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEditClick(e));
        });

        // Save buttons
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSaveClick(e));
        });

        // Cancel buttons
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCancelClick(e));
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDeleteClick(e));
        });

        // Enter key on edit inputs
        document.querySelectorAll('.edit-marks-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const studentId = input.dataset.studentId;
                    this.saveMarks(studentId);
                }
            });
        });
    }

    async handleAddStudent(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<span class="loading-spinner me-2"></span>Adding...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            
            const response = await fetch('/student/add/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': this.csrfToken
                }
            });

            const data = await response.json();

            if (data.success) {
                // Close modal and refresh page
                const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
                modal.hide();
                
                // Show success message and refresh
                this.showMessage('Student added successfully!', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                this.showErrors(data.errors);
            }
        } catch (error) {
            console.error('Error adding student:', error);
            this.showMessage('An error occurred while adding the student.', 'danger');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    handleEditClick(e) {
        const studentId = e.target.closest('.edit-btn').dataset.studentId;
        this.enterEditMode(studentId);
    }

    async handleSaveClick(e) {
        const studentId = e.target.closest('.save-btn').dataset.studentId;
        await this.saveMarks(studentId);
    }

    handleCancelClick(e) {
        const studentId = e.target.closest('.cancel-btn').dataset.studentId;
        this.exitEditMode(studentId);
    }

    async handleDeleteClick(e) {
        const studentId = e.target.closest('.delete-btn').dataset.studentId;
        const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
        const studentName = row.querySelector('td:first-child').textContent.trim();
        
        if (confirm(`Are you sure you want to delete ${studentName}?`)) {
            await this.deleteStudent(studentId);
        }
    }

    enterEditMode(studentId) {
        const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
        const marksSpan = row.querySelector('.editable-marks');
        const marksInput = row.querySelector('.edit-marks-input');
        const editBtn = row.querySelector('.edit-btn');
        const saveBtn = row.querySelector('.save-btn');
        const cancelBtn = row.querySelector('.cancel-btn');
        const deleteBtn = row.querySelector('.delete-btn');

        // Store original value
        marksInput.dataset.originalValue = marksSpan.textContent.trim();

        // Toggle visibility
        marksSpan.classList.add('d-none');
        marksInput.classList.remove('d-none');
        editBtn.classList.add('d-none');
        saveBtn.classList.remove('d-none');
        cancelBtn.classList.remove('d-none');
        deleteBtn.classList.add('d-none');

        // Focus input
        marksInput.focus();
        marksInput.select();
    }

    exitEditMode(studentId, newValue = null) {
        const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
        const marksSpan = row.querySelector('.editable-marks');
        const marksInput = row.querySelector('.edit-marks-input');
        const editBtn = row.querySelector('.edit-btn');
        const saveBtn = row.querySelector('.save-btn');
        const cancelBtn = row.querySelector('.cancel-btn');
        const deleteBtn = row.querySelector('.delete-btn');

        // Restore original value if canceling
        if (newValue === null) {
            marksInput.value = marksInput.dataset.originalValue;
        } else {
            marksSpan.textContent = newValue;
            this.updateGradeBadge(row, newValue);
        }

        // Toggle visibility
        marksSpan.classList.remove('d-none');
        marksInput.classList.add('d-none');
        editBtn.classList.remove('d-none');
        saveBtn.classList.add('d-none');
        cancelBtn.classList.add('d-none');
        deleteBtn.classList.remove('d-none');
    }

    async saveMarks(studentId) {
        const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
        const marksInput = row.querySelector('.edit-marks-input');
        const newMarks = parseFloat(marksInput.value);

        // Validate marks
        if (isNaN(newMarks) || newMarks < 0 || newMarks > 100) {
            this.showMessage('Marks must be between 0 and 100.', 'warning');
            return;
        }

        const saveBtn = row.querySelector('.save-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span class="loading-spinner"></span>';
        saveBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('marks', newMarks);
            formData.append('csrfmiddlewaretoken', this.csrfToken);

            const response = await fetch(`/student/${studentId}/update/`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.exitEditMode(studentId, newMarks);
                this.showMessage('Marks updated successfully!', 'success');
            } else {
                this.showErrors(data.errors);
            }
        } catch (error) {
            console.error('Error updating marks:', error);
            this.showMessage('Failed to update marks.', 'danger');
        } finally {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    }

    async deleteStudent(studentId) {
        const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
        const deleteBtn = row.querySelector('.delete-btn');
        const originalText = deleteBtn.innerHTML;
        
        deleteBtn.innerHTML = '<span class="loading-spinner"></span>';
        deleteBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('csrfmiddlewaretoken', this.csrfToken);

            const response = await fetch(`/student/${studentId}/delete/`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // Animate row removal
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '0';
                row.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    row.remove();
                    this.updateStudentCount();
                }, 300);
                
                this.showMessage('Student deleted successfully!', 'success');
            } else {
                this.showErrors(data.errors);
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            this.showMessage('Failed to delete student.', 'danger');
        } finally {
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;
        }
    }

    updateGradeBadge(row, marks) {
        const gradeBadge = row.querySelector('.badge');
        let grade, badgeClass;

        if (marks >= 90) {
            grade = 'A+';
            badgeClass = 'bg-success';
        } else if (marks >= 80) {
            grade = 'A';
            badgeClass = 'bg-info';
        } else if (marks >= 70) {
            grade = 'B';
            badgeClass = 'bg-primary';
        } else if (marks >= 60) {
            grade = 'C';
            badgeClass = 'bg-warning';
        } else {
            grade = 'F';
            badgeClass = 'bg-danger';
        }

        gradeBadge.textContent = grade;
        gradeBadge.className = `badge ${badgeClass}`;
    }

    updateStudentCount() {
        const countBadge = document.querySelector('.badge.bg-info');
        if (countBadge) {
            const currentCount = parseInt(countBadge.textContent.match(/\d+/)[0]);
            countBadge.textContent = `Total Students: ${currentCount - 1}`;
        }
    }

    showMessage(message, type) {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Insert at top of container
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    showErrors(errors) {
        const errorMessage = errors.join('<br>');
        this.showMessage(errorMessage, 'danger');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudentManager();
});

// Handle modal reset
document.getElementById('addStudentModal').addEventListener('hidden.bs.modal', function () {
    const form = this.querySelector('form');
    form.reset();
    // Clear any error messages
    const alerts = this.querySelectorAll('.alert');
    alerts.forEach(alert => alert.remove());
});
