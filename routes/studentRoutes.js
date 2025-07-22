const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// 📌 POST route to save student & return matched internships
router.post('/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();

    // 💡 Sample internship database (replace with your real one or connect later)
    const internships = [
      {
        title: 'Data Analyst Intern at DataDive',
        location: 'Pune',
        skills: ['Python', 'Excel', 'SQL'],
        minGPA: 8,
      },
      {
        title: 'Frontend Developer Intern',
        location: 'Delhi',
        skills: ['React', 'CSS'],
        minGPA: 7.5,
      },
    ];

    // 🎯 Matching logic
    const matchingInternships = internships.filter((internship) => {
      return (
        internship.location.toLowerCase() === newStudent.location.toLowerCase() &&
        internship.skills.every((skill) =>
          newStudent.skills.toLowerCase().includes(skill.toLowerCase())
        ) &&
        newStudent.gpa >= internship.minGPA
      );
    });

    res.status(201).json({
      message: 'Student saved successfully!',
      matchingInternships,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET all student data
router.get('/all', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

module.exports = router;
