from django.contrib import admin
from .models import Exam, Question, Submission, Student, Answer

# --- 1. Exam Creation ---
class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = ('text', 'question_type', 'max_marks', 'options') # Added max_marks here

class ExamAdmin(admin.ModelAdmin):
    inlines = [QuestionInline]
    list_display = ('title', 'id', 'created_at')

# --- 2. Grading Interface ---
class AnswerInline(admin.TabularInline):
    model = Answer
    # Shows: Question Text | Student Answer | Max Marks | YOUR INPUT FIELD
    fields = ('get_question_text', 'student_answer', 'get_max_marks', 'marks_obtained')
    readonly_fields = ('get_question_text', 'student_answer', 'get_max_marks') # You can't edit the question or student answer
    extra = 0
    can_delete = False

    def get_question_text(self, obj):
        return obj.question.text
    get_question_text.short_description = "Question"

    def get_max_marks(self, obj):
        return obj.question.max_marks
    get_max_marks.short_description = "Max Marks"

class SubmissionAdmin(admin.ModelAdmin):
    inlines = [AnswerInline]
    list_display = ('student', 'exam', 'score', 'is_graded')
    readonly_fields = ('score', 'is_graded') # These are auto-calculated now!

    # MAGIC FUNCTION: This runs when you click "SAVE"
    def save_formset(self, request, form, formset, change):
        # 1. Save the individual marks you entered
        instances = formset.save(commit=False)
        for instance in instances:
            instance.save()
        formset.save_m2m()

        # 2. Calculate the Total
        submission = form.instance
        total_score = 0
        for answer in submission.answers.all():
            total_score += answer.marks_obtained
        
        # 3. Update the Submission
        submission.score = total_score
        submission.is_graded = True
        submission.save()

# Register models
admin.site.register(Exam, ExamAdmin)
admin.site.register(Student)
admin.site.register(Submission, SubmissionAdmin)
# We don't register Question/Answer separately to keep the menu clean