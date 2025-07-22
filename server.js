const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const studentRoutes = require('./routes/studentRoutes'); // ✅ ROUTES
const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ MOUNT ROUTES HERE
app.use('/api/students', studentRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// (You can keep these if needed)
const submissionSchema = new mongoose.Schema({
  name: String,
  college: String,
  branch: String,
  year: String,
  skills: String,
  gpa: Number,
  city: String,
});
const Submission = mongoose.model('Submission', submissionSchema);

app.post('/api/submit', async (req, res) => {
  try {
    const submission = new Submission(req.body);
    await submission.save();
    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit form.' });
  }
});

app.get('/api/submissions', async (req, res) => {
  const submissions = await Submission.find();
  res.json(submissions);
});

// Student POST route
app.post('/submit', async (req, res) => {
  try {
    const { name, college, branch, year, skills, gpa, city } = req.body;

    const newStudent = new Student({
      name,
      college,
      branch,
      year,
      skills: skills.split(',').map(s => s.trim()),
      gpa,
      city
    });

    await newStudent.save();
    res.status(201).json({ message: 'Student data saved successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save student data' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
