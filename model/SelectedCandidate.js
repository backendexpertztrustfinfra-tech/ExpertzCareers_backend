const mongoose = require("mongoose");

const selectedCandidateSchema = mongoose.Schema({
    job: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Job",
        required: true 
    },
    candidate: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true 
    },
    selectedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model("SelectedCandidate", selectedCandidateSchema);
