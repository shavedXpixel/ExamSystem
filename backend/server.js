const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- FIREBASE SETUP ---
let serviceAccount;
try {
  // Try to load from local file (for localhost)
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  // If file not found (Render), use Environment Variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    console.error("❌ Error: serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT var not set.");
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// --- ROUTES ---

// 1. Health Check
app.get('/', (req, res) => {
  res.send('Exam System Backend is ONLINE 🚀');
});

// 2. Create Exam (Teacher)
app.post('/api/create-exam', async (req, res) => {
  try {
    const { title, questions, subject, teacherId } = req.body;
    const totalMarks = questions.reduce((sum, q) => sum + parseInt(q.maxMarks || 0), 0);
    
    const docRef = await db.collection('exams').add({
      title,
      questions,
      subject: subject || "General",
      teacherId: teacherId || "Anonymous",
      totalMarks,
      createdAt: admin.firestore.Timestamp.now()
    });
    
    res.json({ message: 'Exam created', id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get Exam (Student)
app.get('/api/exam/:id', async (req, res) => {
  try {
    const doc = await db.collection('exams').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Exam not found' });
    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Submit Exam (Student)
app.post('/api/submit/:examId', async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentName, regNumber, answers } = req.body;

    // Check duplicate
    const snapshot = await db.collection('submissions')
      .where('examId', '==', examId)
      .where('regNumber', '==', regNumber)
      .get();

    if (!snapshot.empty) return res.status(400).json({ message: 'Already submitted' });

    await db.collection('submissions').add({
      examId,
      studentName,
      regNumber,
      answers,
      score: 0,
      isGraded: false,
      submittedAt: admin.firestore.Timestamp.now()
    });

    res.json({ message: 'Submission received' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Check Status (Student entering hall) -- UPDATED FOR REPORT CARD --
app.post('/api/check/:examId', async (req, res) => {
  try {
    const { regNumber } = req.body;
    const { examId } = req.params;

    const snapshot = await db.collection('submissions')
      .where('examId', '==', examId)
      .where('regNumber', '==', regNumber)
      .get();

    if (snapshot.empty) return res.json({ found: false });

    const data = snapshot.docs[0].data();
    
    res.json({
      found: true,
      graded: data.isGraded || false,
      score: data.score || 0,
      marks: data.marks || {},     // <--- Added: Send marks per question
      answers: data.answers || {}  // <--- Added: Send student's answers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Get Submissions (Teacher Dashboard - Grading View)
app.get('/api/submissions/:examId', async (req, res) => {
  try {
    const snapshot = await db.collection('submissions')
      .where('examId', '==', req.params.examId)
      .get();
    
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Save Grade (Teacher Grading)
app.post('/api/grade/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marks, totalScore } = req.body;

    console.log(`Grading submission ${submissionId} with score ${totalScore}`);

    await db.collection('submissions').doc(submissionId).update({
      marks: marks,
      score: totalScore,
      isGraded: true
    });

    res.json({ message: 'Graded successfully' });
  } catch (error) {
    console.error("Grading Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 8. Get All Exams (Teacher Dashboard History)
app.get('/api/exams', async (req, res) => {
  try {
    const { teacherId } = req.query; 

    let query = db.collection('exams');

    if (teacherId) {
       query = query.where('teacherId', '==', teacherId);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(exams);
  } catch (error) {
    console.error("Error fetching exams:", error); 
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});