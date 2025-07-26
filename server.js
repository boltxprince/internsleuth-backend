const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Models
const Student = require('./models/Student');
const Internship = require('./models/Internship');

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your gmail address
    pass: process.env.EMAIL_PASS  // your gmail app password
  }
});

// Add student route
app.post('/api/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.json({ message: "Student saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save student" });
  }
});

// Admin: Get all students
app.get('/api/students', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// Admin: Add Internship + Email Notification
app.post('/api/internships', async (req, res) => {
  const { title, location, requiredSkills, minGPA } = req.body;

  const internship = new Internship({
    title,
    location,
    requiredSkills,
    minGPA
  });
  await internship.save();

  // Fetch all students
  const students = await Student.find();

  const matchedStudents = students.filter(student => {
    const hasSkill = student.skills.some(skill =>
      requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
    );
    const gpaOk = student.gpa >= minGPA;
    const locationOk = location.toLowerCase().includes(student.city.toLowerCase()) || location === "Remote";
    return hasSkill && gpaOk && locationOk;
  });

  // Email all matched students
  for (let student of matchedStudents) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: `🔔 New Internship Matching You: ${title}`,
      html: `
        <h3>Hello ${student.name},</h3>
        <p>A new internship <b>${title}</b> has been added that matches your profile.</p>
        <ul>
          <li><b>Location:</b> ${location}</li>
          <li><b>Skills Required:</b> ${requiredSkills.join(', ')}</li>
          <li><b>Minimum GPA:</b> ${minGPA}</li>
        </ul>
        <p>Visit InternSleuth to explore more!</p>
      `
    };

    await transporter.sendMail(mailOptions);
  }

  res.json({ message: "Internship added and emails sent to matched students." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
