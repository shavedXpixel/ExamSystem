from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Exam, Student, Submission, Question, Answer
from .serializers import ExamSerializer

@api_view(['GET'])
def get_exam(request, exam_id):
    try:
        exam = Exam.objects.get(id=exam_id)
        serializer = ExamSerializer(exam)
        return Response(serializer.data)
    except Exam.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

@api_view(['POST'])
def submit_exam(request, exam_id):
    data = request.data
    exam = Exam.objects.get(id=exam_id)
    
    student, _ = Student.objects.get_or_create(
        reg_number=data['reg_number'], defaults={'name': data['name']}
    )

    if Submission.objects.filter(student=student, exam=exam).exists():
        return Response({"message": "Already submitted!"}, status=400)

    submission = Submission.objects.create(student=student, exam=exam)
    
    for q_id, ans_text in data['answers'].items():
        Answer.objects.create(
            submission=submission,
            question_id=q_id,
            student_answer=ans_text
        )
    return Response({"message": "Submitted!"})

@api_view(['POST'])
def check_status(request, exam_id):
    reg = request.data.get('reg_number')
    try:
        sub = Submission.objects.get(exam__id=exam_id, student__reg_number=reg)
        return Response({"found": True, "graded": sub.is_graded, "score": sub.score})
    except Submission.DoesNotExist:
        return Response({"found": False})