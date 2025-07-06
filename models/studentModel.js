const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  college: String,
  year: String,
  branch: String,
  skills: [String],
  interests: [String],
  github: String,
  linkedin: String
});

module.exports = mongoose.model('Student', studentSchema);
