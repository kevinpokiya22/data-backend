const Folder = require("../models/folderModel");
const Report = require("../models/Report");

// Create a new folder
const createFolder = async (req, res) => {
  try {
    const { name, workspaceId , SavedType } = req.body;
    const userId = req.user._id;

    if (!name || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Folder name and workspace ID are required"
      });
    }

    // Check if folder with same name already exists in the workspace
    const existingFolder = await Folder.findOne({
      name,
      workspaceId,
      userId: userId.toString()
    });

    if (existingFolder) {
      return res.status(400).json({
        success: false,
        message: "A folder with this name already exists in this workspace"
      });
    }

    const folderData = {
      name,
      userId: userId.toString(),
      workspaceId,
      reportIds: [],
      SavedType: SavedType || 'Folder'
    };

    const newFolder = await Folder.create(folderData);

    res.status(201).json({
      success: true,
      message: "Folder created successfully",
      folder: newFolder
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({
      success: false,
      message: "Error creating folder",
      error: error.message
    });
  }
};

// Get all folders for a user
const getFoldersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required"
      });
    }

    const folders = await Folder.find({ userId }).populate('reportIds', 'name createdAt');

    res.status(200).json({
      success: true,
      message: "Folders retrieved successfully",
      folders
    });
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching folders",
      error: error.message
    });
  }
};

// Get folders by workspace ID
const getFoldersByWorkspaceId = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace ID is required"
      });
    }

    const folders = await Folder.find({ 
      workspaceId, 
      userId: userId.toString() 
    }).populate('reportIds', 'name createdAt');

    res.status(200).json({
      success: true,
      message: "Folders retrieved successfully",
      folders
    });
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching folders",
      error: error.message
    });
  }
};

// Get folder by ID
const getFolderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const folder = await Folder.findOne({
      _id: id,
      userId: userId.toString()
    }).populate('reportIds', 'name createdAt charts shapes texts');

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Folder retrieved successfully",
      folder
    });
  } catch (error) {
    console.error("Error fetching folder:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching folder",
      error: error.message
    });
  }
};

// Update folder
const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    const folder = await Folder.findOne({
      _id: id,
      userId: userId.toString()
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found"
      });
    }

    if (name) {
      // Check if folder with same name already exists in the workspace
      const existingFolder = await Folder.findOne({
        name,
        workspaceId: folder.workspaceId,
        userId: userId.toString(),
        _id: { $ne: id }
      });

      if (existingFolder) {
        return res.status(400).json({
          success: false,
          message: "A folder with this name already exists in this workspace"
        });
      }

      folder.name = name;
    }

    await folder.save();

    res.status(200).json({
      success: true,
      message: "Folder updated successfully",
      folder
    });
  } catch (error) {
    console.error("Error updating folder:", error);
    res.status(500).json({
      success: false,
      message: "Error updating folder",
      error: error.message
    });
  }
};

// Delete folder
const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const folder = await Folder.findOne({
      _id: id,
      userId: userId.toString()
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found"
      });
    }

    await Folder.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Folder deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting folder",
      error: error.message
    });
  }
};

// Add report to folder
const addReportToFolder = async (req, res) => {
  try {
    const { folderId, reportId } = req.body;
    const userId = req.user._id;

    if (!folderId || !reportId) {
      return res.status(400).json({
        success: false,
        message: "Folder ID and Report ID are required"
      });
    }

    const folder = await Folder.findOne({
      _id: folderId,
      userId: userId.toString()
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found"
      });
    }

    // Check if report exists
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    // Check if report is already in the folder
    if (folder.reportIds.includes(reportId)) {
      return res.status(400).json({
        success: false,
        message: "Report is already in this folder"
      });
    }

    folder.reportIds.push(reportId);
    await folder.save();

    res.status(200).json({
      success: true,
      message: "Report added to folder successfully",
      folder
    });
  } catch (error) {
    console.error("Error adding report to folder:", error);
    res.status(500).json({
      success: false,
      message: "Error adding report to folder",
      error: error.message
    });
  }
};

// Remove report from folder
const removeReportFromFolder = async (req, res) => {
  try {
    const { folderId, reportId } = req.body;
    const userId = req.user._id;

    if (!folderId || !reportId) {
      return res.status(400).json({
        success: false,
        message: "Folder ID and Report ID are required"
      });
    }

    const folder = await Folder.findOne({
      _id: folderId,
      userId: userId.toString()
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found"
      });
    }

    // Remove report from folder
    folder.reportIds = folder.reportIds.filter(id => id.toString() !== reportId);
    await folder.save();

    res.status(200).json({
      success: true,
      message: "Report removed from folder successfully",
      folder
    });
  } catch (error) {
    console.error("Error removing report from folder:", error);
    res.status(500).json({
      success: false,
      message: "Error removing report from folder",
      error: error.message
    });
  }
};

// Get reports by folder ID
const getReportsByFolderId = async (req, res) => {
  try {
    const { folderId } = req.params;
    const userId = req.user._id;

    if (!folderId) {
      return res.status(400).json({
        success: false,
        message: "Folder ID is required"
      });
    }

    const folder = await Folder.findOne({
      _id: folderId,
      userId: userId.toString()
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found"
      });
    }

    // Get all reports in the folder with detailed information
    const reports = await Report.find({
      _id: { $in: folder.reportIds }
    }).populate('charts shapes texts');

    res.status(200).json({
      success: true,
      message: "Reports retrieved successfully",
      reports,
      folderInfo: {
        _id: folder._id,
        name: folder.name,
        workspaceId: folder.workspaceId,
        reportCount: reports.length
      }
    });
  } catch (error) {
    console.error("Error fetching reports by folder ID:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reports",
      error: error.message
    });
  }
};

module.exports = {
  createFolder,
  getFoldersByUserId,
  getFoldersByWorkspaceId,
  getFolderById,
  updateFolder,
  deleteFolder,
  addReportToFolder,
  removeReportFromFolder,
  getReportsByFolderId
}; 