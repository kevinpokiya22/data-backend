const xlsx = require("xlsx");
const ExcelData = require("../models/ExcelData");
const path = require("path");
const fs = require("fs");

// Upload multiple Excel files and store metadata in array structure
exports.uploadExcelFile = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const userId = req.user._id;
    const latest = await ExcelData.findOne({ userId }).sort({ sheetNo: -1 });
    let nextSheetNo =
      latest && typeof latest.sheetNo === "number" ? latest.sheetNo + 1 : 1;

    // Create a main object with files array
    const fileUploadData = {
      userId,
      sheetNo: nextSheetNo,
      files: [], // Array to store file metadata
    };

    // Process each file and add to files array
    for (const file of req.files) {
      fileUploadData.files.push({
        fileName: file.filename,
        fileOriginalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
      });
    }

    // Save the main object with files array to database
    const fileData = new ExcelData(fileUploadData);
    await fileData.save();

    res.json({
      message: `${req.files.length} Excel files uploaded successfully`,
      data: fileData,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get Excel files information for the logged-in user
exports.getUserExcelFiles = async (req, res) => {
  try {
    const userId = req.user._id;
    const files = await ExcelData.find({ userId }).sort({ createdAt: -1 });

    if (!files || files.length === 0) {
      return res
        .status(404)
        .json({ message: "No Excel files found for this user" });
    }

    const totalFiles = files.length;
    const totalSheets = new Set(files.map((item) => item.sheetNo)).size;

    res.json({
      status: 200,
      totalFiles,
      totalSheets,
      message: "Files Found Successfully",
      data: files,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Excel files by user ID (admin access)
exports.getExcelFilesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const files = await ExcelData.find({ userId }).sort({ createdAt: -1 });

    if (!files || files.length === 0) {
      return res
        .status(404)
        .json({ message: "No Excel files found for this user" });
    }

    const totalFiles = files.length;
    const totalSheets = new Set(files.map((item) => item.sheetNo)).size;

    res.json({
      status: 200,
      totalFiles,
      totalSheets,
      message: "Files Found Successfully",
      data: files,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific Excel file by ID
exports.getExcelFileById = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }

    const file = await ExcelData.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "Excel file not found" });
    }

    // Check if the file belongs to the logged-in user
    if (file.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Access denied. This file doesn't belong to you." });
    }

    res.json({
      status: 200,
      message: "File Found Successfully",
      data: file,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Manual excel file
exports.ManualExcelFile = async (req, res) => {
  try {
    const { userId, data,tablename } = req.body;

    const latest = await ExcelData.findOne({ userId }).sort({ sheetNo: -1 });
    let nextSheetNo = latest && typeof latest.sheetNo === "number" ? latest.sheetNo + 1 : 1;

    // Convert data to worksheet and create workbook
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Ensure uploads folder exists
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create filename using userId and timestamp
    const timestamp = Date.now();
    const fileName = `excel_${userId}_${timestamp}.xlsx`;
    const filePath = path.join(uploadsDir, fileName);

    // Write the Excel file
    xlsx.writeFile(workbook, filePath);

    const fileData = new ExcelData({
      userId,
      sheetNo: nextSheetNo,
      tablename,
      files: [{
        fileName,
        fileOriginalName: fileName,
        filePath: `/uploads/${fileName}`,
        fileSize: fs.statSync(filePath).size,
      }],
    });

    await fileData.save();

    res.status(200).json({
      status: 200,
      message: "Excel file created and saved successfully",
      data: fileData,
    });
  } catch (err) {
    console.error("Error in ManualExcelFile:", err);
    res.status(500).json({
      status: 500,
      message: err.message
    });
  }
};

