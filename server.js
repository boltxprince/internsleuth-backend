// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();
const app = express();

// Middleware
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

// 👉 Get All Students (Admin Panel)
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to fetch students" });
  }
});

// 👉 Add Internship + Notify Matching Students
app.post('/api/internships', async (req, res) => {
  try {
    const { title, location, requiredSkills, minGPA, applyLink } = req.body;

    // Save internship to DB
    const internship = new Internship({ title, location, requiredSkills, minGPA, applyLink });
    await internship.save();

    const students = await Student.find();

    const matchedStudents = students.filter(student => {
      const hasSkill = student.skills.some(skill =>
        requiredSkills.some(req =>
          req.toLowerCase() === skill.toLowerCase()
        )
      );
      const gpaOk = student.gpa >= minGPA;
      const locationOk = location.toLowerCase().includes(student.city.toLowerCase()) || location.toLowerCase() === "remote";
      return hasSkill && gpaOk && locationOk;
    });

    for (const student of matchedStudents) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: `🔔 New Internship Matching You: ${title}`,
        html: `
          <h3>Hello ${student.name},</h3>
          <p>A new internship <strong>${title}</strong> has been added that matches your profile.</p>
          <ul>
            <li><strong>Location:</strong> ${location}</li>
            <li><strong>Required Skills:</strong> ${requiredSkills.join(', ')}</li>
            <li><strong>Minimum GPA:</strong> ${minGPA}</li>
            <li><strong>Apply Link:</strong> <a href="${applyLink}" target="_blank">${applyLink}</a></li>
          </ul>
          <p>Visit <a href="https://internsleuth.vercel.app" target="_blank">InternSleuth</a> to explore more!</p>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    res.json({ message: "✅ Internship added and emails sent to matched students." });

  } catch (error) {
    console.error("❌ Internship creation failed:", error);
    res.status(500).json({ error: "❌ Failed to add internship and notify students." });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
