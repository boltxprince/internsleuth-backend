// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Models
const Student = require('./models/Student');
const Internship = require('./models/Internship');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// === ROUTES === //

// 👉 Add Student
app.post('/api/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: "✅ Student saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "❌ Failed to save student" });
  }
});

// 👉 Get All Students (Admin)
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to fetch students" });
  }
});

// 👉 Add Internship + Email Matched Students
app.post('/api/internships', async (req, res) => {
  try {
    const { title, location, requiredSkills, minGPA } = req.body;

    // Save internship
    const internship = new Internship({ title, location, requiredSkills, minGPA });
    await internship.save();

    // Find all students
    const students = await Student.find();

    // Filter matched students
    const matchedStudents = students.filter(student => {
      const hasSkill = student.skills.some(skill =>
        requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
      );
      const gpaOk = student.gpa >= minGPA;
      const locationOk = location.toLowerCase().includes(student.city.toLowerCase()) || location.toLowerCase() === "remote";
      return hasSkill && gpaOk && locationOk;
    });

    // Send emails to matched students
    for (const student of matchedStudents) {
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

    res.json({ message: "✅ Internship added and emails sent to matched students." });
  } catch (error) {
    console.error("❌ Internship creation failed:", error);
    res.status(500).json({ error: "Failed to add internship and notify students." });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
