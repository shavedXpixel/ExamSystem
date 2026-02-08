from django.db import models
import uuid

class Exam(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class Question(models.Model):
    exam = models.ForeignKey(Exam, related_name='questions', on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    question_type = models.CharField(max_length=10, choices=[('MCQ', 'MCQ'), ('TEXT', 'Text')])
    max_marks = models.IntegerField(default=1)  # <-- NEW: Marks for this question
    options = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.text

class Student(models.Model):
    name = models.CharField(max_length=100)
    reg_number = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.name} ({self.reg_number})"

class Submission(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0) # Total Score
    is_graded = models.BooleanField(default=False)

class Answer(models.Model):
    submission = models.ForeignKey(Submission, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    student_answer = models.TextField()
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, default=0) # <-- NEW: Marks for this specific answer