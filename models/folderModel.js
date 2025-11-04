const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    required: true
  },
  workspaceId: {
    type: String,
    required: true
  },
  reportIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  SavedType: {
    type: String,
  },
});

// Update the updatedAt timestamp before saving
folderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Folder", folderSchema); 