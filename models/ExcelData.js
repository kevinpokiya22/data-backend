const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  fileOriginalName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  }
});

const excelDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tablename: {
      type: String
    },
    sheetNo: {
      type: Number,
      required: true,
    },
    files: [fileSchema]
  },
  { strict: false, timestamps: true }
);

module.exports = mongoose.model('ExcelData', excelDataSchema);