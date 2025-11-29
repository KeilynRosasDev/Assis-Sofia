const mongoose = require('mongoose');

const academicDataSchema = new mongoose.Schema({
    registration: { type: String, required: true },
    calendarFile: { type: String, default: "CalendarioAcademico.pdf" },
    aolFile: { type: String, default: "CalendarioAOL.jpeg" },
    scheduleFile: { type: String, default: "" },
    provaFile: { type: String, default: "" }
});

module.exports = mongoose.model('AcademicData', academicDataSchema);