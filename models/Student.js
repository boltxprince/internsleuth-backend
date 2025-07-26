const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  college: String,
  branch: String,
  year: String,
  email: String,
  skills: [String],
  gpa: Number,
  city: String,
  
});

module.exports = mongoose.model('Student', studentSchema);
