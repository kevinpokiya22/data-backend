const Report = require('../models/Report');
const Folder = require('../models/folderModel');

// Save a new report
exports.saveChart = async (req, res) => {
  try {
    const reportData = req.body;
    
    if (!reportData.userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Process shapes and persist full styling and related fields
    const processedShapes = (reportData.shapes || []).map(shape => {
      const processedShape = {
        id: shape.id,
        pageNumber: shape.pageNumber,
        size: shape.size,
        position: shape.position,
        type: shape.type,
        // Persist full style as-is to avoid losing fields
        style: shape.style || {},
        // Persist structured styling buckets when present
        styleProperties: shape.styleProperties || {},
        tooltip: shape.tooltip || '',
        titleProperties: shape.titleProperties || {},
        headerStyling: shape.headerStyling || {},
        controls: shape.controls || {}
      };

      // Add bookmarks for book shapes; include elementsData if provided
      if (Array.isArray(shape.bookmarks)) {
        processedShape.bookmarks = shape.bookmarks.map(bookmark => ({
          id: bookmark.id,
          text: bookmark.text,
          isActive: !!bookmark.isActive,
          bookShapeId: bookmark.bookShapeId,
          originalId: bookmark.originalId,
          elementsData: bookmark.elementsData || []
        }));
      }

      return processedShape;
    });

    // Process text boxes
    const processedTexts = reportData.texts.map(text => ({
      id: text.id,
      pageNumber: text.pageNumber,
      size: text.size,
      position: text.position,
      type: text.type,
      content: text.content,
      formattedText: text.formattedText || '',
      formatting: {
        font: text.formatting.font,
        fontSize: text.formatting.fontSize,
        bold: text.formatting.bold,
        italic: text.formatting.italic,
        underline: text.formatting.underline,
        list: text.formatting.list,
        alignLeft: text.formatting.alignLeft,
        alignCenter: text.formatting.alignCenter,
        alignRight: text.formatting.alignRight,
        superscript: text.formatting.superscript,
        subscript: text.formatting.subscript
      }
    }));

    // Process charts with enhanced styling preservation
    const processedCharts = (reportData.charts || []).map(chart => {
      console.log('Processing chart for save:', chart);
      
      const processedChart = {
        ...chart,
        // Ensure all styling properties are preserved
        appearance: chart.appearance || {},
        titleProperties: chart.titleProperties || {},
        labelOptions: chart.labelOptions || {},
        sliceColors: chart.sliceColors || {},
        sliceBorder: chart.sliceBorder || {},
        pieOptions: chart.pieOptions || {},
        legendOptions: chart.legendOptions || {},
        headerStyling: chart.headerStyling || {},
        tooltipProperties: chart.tooltipProperties || {},
        xAxisProperties: chart.xAxisProperties || {},
        yAxisProperties: chart.yAxisProperties || {},
        gridlines: chart.gridlines || {},
        lineStyles: chart.lineStyles || {},
        plotArea: chart.plotArea || {},
        showMoreEnabled: chart.showMoreEnabled !== undefined ? chart.showMoreEnabled : true,
        deleteChartEnabled: chart.deleteChartEnabled !== undefined ? chart.deleteChartEnabled : true,
        sliceColorTransparencies: chart.sliceColorTransparencies || {},
        areaShade: chart.areaShade || {},
        dataLabels: chart.dataLabels || {},
        barsLayout: chart.barsLayout || {},
        totalLabels: chart.totalLabels || {},
        yAxisRange: chart.yAxisRange || {},
        marker: chart.marker || {}
      };
      
      console.log('Processed chart:', processedChart);
      return processedChart;
    });

    const savedReport = new Report({
      ...reportData,
      charts: processedCharts,
      shapes: processedShapes,
      texts: processedTexts,
    });

    await savedReport.save();

    // If folderId is provided, add the report to the folder
    if (reportData.folderId) {
      try {
        const folder = await Folder.findById(reportData.folderId);
        if (folder) {
          folder.reportIds.push(savedReport._id);
          await folder.save();
        }
      } catch (folderError) {
        console.error('Error adding report to folder:', folderError);
        // Don't fail the report save if folder update fails
      }
    }

    res.status(201).json({
      success: true,
      data: savedReport,
      message:"Report Save Successfully..!"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      message:"Report Not Save Successfully..!"

    });
  }
};

// Save report to specific folder
exports.saveReportToFolder = async (req, res) => {
  try {
    const { reportData, folderId } = req.body;
    
    if (!reportData.userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!folderId) {
      return res.status(400).json({
        success: false,
        error: 'Folder ID is required'
      });
    }

    // Verify folder exists and user has access
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      });
    }

    if (folder.userId !== reportData.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to save to this folder'
      });
    }

    // Process shapes and persist full styling and related fields
    const processedShapes = (reportData.shapes || []).map(shape => {
      const processedShape = {
        id: shape.id,
        pageNumber: shape.pageNumber,
        size: shape.size,
        position: shape.position,
        type: shape.type,
        style: shape.style || {},
        styleProperties: shape.styleProperties || {},
        tooltip: shape.tooltip || '',
        titleProperties: shape.titleProperties || {},
        headerStyling: shape.headerStyling || {},
        controls: shape.controls || {}
      };

      if (Array.isArray(shape.bookmarks)) {
        processedShape.bookmarks = shape.bookmarks.map(bookmark => ({
          id: bookmark.id,
          text: bookmark.text,
          isActive: !!bookmark.isActive,
          bookShapeId: bookmark.bookShapeId,
          originalId: bookmark.originalId,
          elementsData: bookmark.elementsData || []
        }));
      }

      return processedShape;
    });

    // Process text boxes
    const processedTexts = reportData.texts.map(text => ({
      id: text.id,
      pageNumber: text.pageNumber,
      size: text.size,
      position: text.position,
      type: text.type,
      content: text.content,
      formattedText: text.formattedText || '',
      formatting: {
        font: text.formatting.font,
        fontSize: text.formatting.fontSize,
        bold: text.formatting.bold,
        italic: text.formatting.italic,
        underline: text.formatting.underline,
        list: text.formatting.list,
        alignLeft: text.formatting.alignLeft,
        alignCenter: text.formatting.alignCenter,
        alignRight: text.formatting.alignRight,
        superscript: text.formatting.superscript,
        subscript: text.formatting.subscript
      }
    }));

    // Process charts with enhanced styling preservation for folder save
    const processedCharts = (reportData.charts || []).map(chart => {
      console.log('Processing chart for folder save:', chart);
      
      const processedChart = {
        ...chart,
        // Ensure all styling properties are preserved
        appearance: chart.appearance || {},
        titleProperties: chart.titleProperties || {},
        labelOptions: chart.labelOptions || {},
        sliceColors: chart.sliceColors || {},
        sliceBorder: chart.sliceBorder || {},
        pieOptions: chart.pieOptions || {},
        legendOptions: chart.legendOptions || {},
        headerStyling: chart.headerStyling || {},
        tooltipProperties: chart.tooltipProperties || {},
        xAxisProperties: chart.xAxisProperties || {},
        yAxisProperties: chart.yAxisProperties || {},
        gridlines: chart.gridlines || {},
        lineStyles: chart.lineStyles || {},
        plotArea: chart.plotArea || {},
        showMoreEnabled: chart.showMoreEnabled !== undefined ? chart.showMoreEnabled : true,
        deleteChartEnabled: chart.deleteChartEnabled !== undefined ? chart.deleteChartEnabled : true,
        sliceColorTransparencies: chart.sliceColorTransparencies || {},
        areaShade: chart.areaShade || {},
        dataLabels: chart.dataLabels || {},
        barsLayout: chart.barsLayout || {},
        totalLabels: chart.totalLabels || {},
        yAxisRange: chart.yAxisRange || {},
        marker: chart.marker || {}
      };
      
      console.log('Processed chart for folder:', processedChart);
      return processedChart;
    });

    const savedReport = new Report({
      ...reportData,
      folderId: folderId,
      charts: processedCharts,
      shapes: processedShapes,
      texts: processedTexts
    });

    await savedReport.save();

    // Add report to folder
    folder.reportIds.push(savedReport._id);
    await folder.save();

    res.status(201).json({
      success: true,
      data: savedReport,
      message: 'Report saved to folder Successfully..!'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Report Not saved to folder Successfully..!',
      error: error.message
    });
  }
};

// Get all reports for a specific user
exports.getCharts = async (req, res) => {
  try {
    console.log("Backend received query:", req.params);
    const userId = req.params.id;
    const workspaceId = req.query.workspaceId;
    console.log("UserId----",userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Build query based on provided parameters
    const query = { userId };
    if (workspaceId) {
      query.workspaceId = workspaceId;
    }

    const savedReports = await Report.aggregate([
      { $match: query },
      { $sort: { updatedAt: -1 } },
      {
        $addFields: {
          workspaceObjectId: { $toObjectId: "$workspaceId" }
        }
      },
      {
        $lookup: {
          from: 'workspaces',
          localField: 'workspaceObjectId',
          foreignField: '_id',
          as: 'workspaceData'
        }
      },
      
      {
        $unset: 'workspaceObjectId' // Remove the temporary field
      }
    ]);

    console.log("Fetched saved reports:", savedReports);

    res.status(200).json({
      success: true,
      message:"Get All Report Successfully..!",
      data: savedReports
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:"Get All Report Not Successfully..!",
      error: error.message
    });
  }
};

// Get a single report by ID
exports.getChart = async (req, res) => {
  try {
    const savedReport = await Report.findById(req.params.id);
    console.log("Retrieved report from database:", savedReport);
    
    if (savedReport && savedReport.charts) {
      console.log("Charts in retrieved report:", savedReport.charts);
      savedReport.charts.forEach((chart, index) => {
        console.log(`Chart ${index} styling properties:`, {
          xAxisProperties: chart.xAxisProperties,
          yAxisProperties: chart.yAxisProperties,
          appearance: chart.appearance,
          titleProperties: chart.titleProperties
        });
      });
    }
    
    if (!savedReport) {
      return res.status(404).json({ 
        success: false,
        error: 'Report not found'
      });
    }
    res.status(200).json({
      success: true,
      message:"Get Single Report Successfully..!",
      data: savedReport
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:"Get Single Report Not Successfully..!",
      error: error.message
    });
  }
};

// Update a report
exports.updateChart = async (req, res) => {
  try {
    const savedReport = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!savedReport) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    res.status(200).json({
      success: true,
      data: savedReport
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:"Report Not Update Successfully..!",
      error: error.message
    });
  }
};

// Delete a report
exports.deleteChart = async (req, res) => {
  try {
    const savedReport = await Report.findByIdAndDelete(req.params.id);
    if (!savedReport) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    res.status(200).json({
      success: true,
      message:"Report Delete Successfully..!",
      data: {} // Return empty object for successful deletion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:"Report Not Delete Successfully..!",
      error: error.message
    });
  }
};


// Get reports by workspace ID with node data
exports.getReportsByWorkspaceId = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        error: 'Workspace ID is required'
      });
    }

    const reports = await Report.aggregate([
      { $match: { workspaceId } },
      { $sort: { updatedAt: -1 } },
      {
        $addFields: {
          workspaceObjectId: { $toObjectId: "$workspaceId" }
        }
      },
      {
        $lookup: {
          from: 'workspaces',
          localField: 'workspaceObjectId',
          foreignField: '_id',
          as: 'nodeData'
        }
      },
      {
        $addFields: {
          nodeData: {
            $cond: {
              if: { $and: [
                { $ne: ["$nodeId", null] },
                { $gt: [{ $size: "$nodeData" }, 0] }
              ]},
              then: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: { $arrayElemAt: ["$nodeData.flowDiagram.nodes", 0] },
                      cond: { $eq: ["$$this.id", "$nodeId"] }
                    }
                  },
                  0
                ]
              },
              else: null
            }
          }
        }
      },
      {
        $unset: ['workspaceObjectId'] // Remove the temporary field
      }
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      message: 'Report Get Workspace wise Successfully..!'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Report Not Get Workspace wise Successfully..!'
    });
  }
};
