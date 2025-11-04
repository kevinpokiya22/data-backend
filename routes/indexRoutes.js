const express = require('express');
const indexRoutes = express.Router()
var multer = require('multer');
const {auth} = require('../middleware/auth')
const { createNewUser, userLogin, verifyOtp, changePassword, forgotPassword, resetPassword, emailOtpVerify, resendOtp, userLogout, updateUser, resendRegisterOtp, getAllUsers, getUserById, googleLogin, mobileLogin, refreshAccessToken } = require('../controllers/userController');
const excelController = require('../controllers/excelController');
const { createWorkspace, updateWorkspace, workspacesByUserId, getAllWorkspaces, deleteWorkspace, getWorkspaceById, assignItemToNode, deleteNodeFromWorkspace } = require('../controllers/workspaceController');
const {
    saveChart,
    saveReportToFolder,
    getCharts,
    getChart,
    updateChart,
    deleteChart,
    getReportsByWorkspaceId
  } = require('../controllers/chartController');
const {
    createFolder,
    getFoldersByUserId,
    getFoldersByWorkspaceId,
    getFolderById,
    updateFolder,
    deleteFolder,
    addReportToFolder,
    removeReportFromFolder,
    getReportsByFolderId
  } = require('../controllers/folderController');
  
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname+Date.now())
    }
});

var upload = multer({ storage: storage });

// user Routes 

indexRoutes.post("/userLogin", userLogin);
indexRoutes.post("/mobileLogin", mobileLogin);
indexRoutes.post("/google-login", googleLogin);
indexRoutes.post('/userLogout', auth, userLogout);
indexRoutes.post("/forgotPassword", forgotPassword);
indexRoutes.post('/emailOtpVerify', emailOtpVerify);
indexRoutes.post('/resendEmailOtp', resendOtp);
indexRoutes.put('/resetPassword', resetPassword);
indexRoutes.get('/refresh-token', refreshAccessToken);

indexRoutes.post('/createUser', createNewUser);
indexRoutes.post('/verifyOtp', verifyOtp);
indexRoutes.post('/resendregisterOtp', resendRegisterOtp);
indexRoutes.get('/allUsers', auth,getAllUsers);
indexRoutes.get('/getUserById/:id', auth,getUserById);
indexRoutes.put('/userUpdate/:id', auth, upload.single("photo"), updateUser);
indexRoutes.put("/changePassword", auth, changePassword);

indexRoutes.post('/upload-excel', auth, upload.array('file'), excelController.uploadExcelFile);
indexRoutes.get('/excel-files', auth, excelController.getUserExcelFiles);
indexRoutes.get('/excel-files/user/:userId', auth, excelController.getExcelFilesByUserId);
indexRoutes.get('/excel-files/:fileId', auth, excelController.getExcelFileById);
indexRoutes.post('/manual-excel', auth, excelController.ManualExcelFile);

// Add this route
indexRoutes.post('/create-workspace', auth,  upload.single("photo"), createWorkspace);   
indexRoutes.put('/update-workspaces/:id', auth, upload.single("photo"), updateWorkspace);
indexRoutes.get('/workspacesByUserId/:userId', auth, workspacesByUserId);
indexRoutes.get('/allworkspace', auth, getAllWorkspaces);
indexRoutes.delete('/delete-workspace/:id', auth, deleteWorkspace);
indexRoutes.get('/workspace/:id', auth, getWorkspaceById);
indexRoutes.get('/save/workspace/:workspaceId', getReportsByWorkspaceId);
indexRoutes.post('/workspaces/:workspaceId/nodes/:nodeId/assign-items', auth, assignItemToNode);
indexRoutes.delete('/workspaces/:workspaceId/nodes/:nodeId', auth, deleteNodeFromWorkspace);

// Chart routes
indexRoutes.post('/save',auth, saveChart);
indexRoutes.post('/save-to-folder',auth, saveReportToFolder);
indexRoutes.get('/save/get/:id',auth, getCharts);
indexRoutes.get('/save/:id',auth, getChart);
indexRoutes.put('/save/update/:id',auth, updateChart);
indexRoutes.delete('/save/delete/:id',auth, deleteChart);

// Folder routes
indexRoutes.post('/create-folder', auth, createFolder);
indexRoutes.get('/folders/user/:userId', auth, getFoldersByUserId);
indexRoutes.get('/folders/workspace/:workspaceId', auth, getFoldersByWorkspaceId);
indexRoutes.get('/folder/:id', auth, getFolderById);
indexRoutes.get('/folder/:folderId/reports', auth, getReportsByFolderId);
indexRoutes.put('/folder/:id', auth, updateFolder);
indexRoutes.delete('/folder/:id', auth, deleteFolder);
indexRoutes.post('/folder/add-report', auth, addReportToFolder);
indexRoutes.post('/folder/remove-report', auth, removeReportFromFolder);

module.exports = indexRoutes