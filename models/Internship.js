const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  category: String,     // optional, if using for filters
  applyLink: String     // NEW field
});

module.exports = mongoose.model('Internship', internshipSchema);
