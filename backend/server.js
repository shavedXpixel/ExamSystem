const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios'); // <--- Import Axios for self-ping
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- FIREBASE SETUP ---
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    console.error("❌ Error: Firebase keys not found.");
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// --- ROUTES ---

// 1. Health Check (This is what UptimeRobot pings)
app.get('/', (req, res) => {
  res.status(200).send('Exam System Backend is ONLINE 🚀');
});

// 2. Create Exam
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

// 3. Get Exam
app.get('/api/exam/:id', async (req, res) => {
  try {
    const doc = await db.collection('exams').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Exam not found' });
    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Submit Exam
app.post('/api/submit/:examId', async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentName, regNumber, answers } = req.body;

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

// 5. Check Status
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
      marks: data.marks || {},
      answers: data.answers || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Get Submissions
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

// 7. Save Grade
app.post('/api/grade/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marks, totalScore } = req.body;

    await db.collection('submissions').doc(submissionId).update({
      marks: marks,
      score: totalScore,
      isGraded: true
    });

    res.json({ message: 'Graded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Get All Exams
app.get('/api/exams', async (req, res) => {
  try {
    const { teacherId } = req.query; 
    let query = db.collection('exams');
    if (teacherId) query = query.where('teacherId', '==', teacherId);
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SERVER START ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// --- KEEP-ALIVE MECHANISM (PREVENTS SLEEP) ---
const SERVER_URL = "https://exam-system-api-fmyy.onrender.com"; // Your Render URL

const reloadWebsite = () => {
  axios.get(SERVER_URL)
    .then(response => {
      console.log(`Reloaded at ${new Date().toISOString()}: Status ${response.status}`);
    })
    .catch(error => {
      console.error(`Reload Error at ${new Date().toISOString()}: ${error.message}`);
    });
};

// Ping every 10 minutes (600,000 ms)
// Render sleeps after 15 mins, so 10 mins is safe.
setInterval(reloadWebsite, 600000);