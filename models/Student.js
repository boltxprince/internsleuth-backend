const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  college: String,
  branch: String,
  year: String,
  skills: String,
  linkedin: String
});

// Avoid OverwriteModelError
module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);
