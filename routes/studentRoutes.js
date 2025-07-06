const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

router.post('/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json({ message: 'Student saved successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;

