const Workspace = require("../models/workspaceModal"); // Corrected
const mongoose = require("mongoose");
const Report = require("../models/Report");

const createWorkspace = async (req, res) => {
  try {
    console.log("req", req.body);
    const { name, description } = req.body;
    const photo = req.file ? req.file.path : "";

    if (!name || !description || !photo) {
      return res
        .status(400)
        .json({ message: "Name, description and photo are required" });
    }

    // Create a deep copy of the default flow diagram to avoid reference issues
    const workspaceData = {
      userId: req.user._id,
      name,
      description,
      photo,
      flowDiagram: JSON.parse(JSON.stringify(defaultFlowDiagram)), // Deep copy
    };

    console.log("workspaceData: ", workspaceData);
    console.log(
      "flowDiagram nodes length:",
      workspaceData.flowDiagram.nodes.length
    );

    const newWorkspace = await Workspace.create(workspaceData);
    res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      workspace: newWorkspace,
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({
      success: false,
      message: "Error creating workspace",
      error: error.message,
    });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const { name, description, flowDiagram } = req.body;
    const photo = req.file ? req.file.path : null;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if user has permission to update this workspace
    if (workspace.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this workspace" });
    }

    // Update fields if provided
    if (name) workspace.name = name;
    if (description) workspace.description = description;
    if (photo) workspace.photo = photo;

    // Update flow diagram if provided
    if (flowDiagram) {
      try {
        // Parse flowDiagram if it's a string
        const flowDiagramData =
          typeof flowDiagram === "string"
            ? JSON.parse(flowDiagram)
            : flowDiagram;

        // Validate flow diagram data
        if (!flowDiagramData.nodes || !Array.isArray(flowDiagramData.nodes)) {
          throw new Error("Invalid flow diagram nodes data");
        }
        if (!flowDiagramData.edges || !Array.isArray(flowDiagramData.edges)) {
          throw new Error("Invalid flow diagram edges data");
        }

        // Validate each edge
        flowDiagramData.edges.forEach((edge) => {
          if (!edge.id || !edge.source || !edge.target) {
            throw new Error("Invalid edge data structure");
          }
        });

        // Update the flow diagram
        workspace.flowDiagram = {
          nodes: flowDiagramData.nodes,
          edges: flowDiagramData.edges,
          lastUpdated: new Date(),
        };
      } catch (error) {
        console.error("Error processing flow diagram:", error);
        return res.status(400).json({
          success: false,
          message: "Invalid flow diagram data",
          error: error.message,
        });
      }
    }

    await workspace.save();

    res.status(200).json({
      success: true,
      message: "Workspace updated successfully",
      workspace,
    });
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).json({
      success: false,
      message: "Error updating workspace",
      error: error.message,
    });
  }
};

const workspacesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    const workspaces = await Workspace.find({ userId });

    res.status(200).json({
      success: true,
      message: "Workspaces retrieved successfully",
      workspaces,
    });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching workspaces",
      error: error.message,
    });
  }
};

const getAllWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find();

    res.status(200).json({
      success: true,
      message: "All workspaces retrieved successfully",
      workspaces,
    });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching workspaces",
      error: error.message,
    });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if user has permission to delete this workspace
    if (workspace.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this workspace" });
    }

    await Workspace.findByIdAndDelete(workspaceId);
    res.status(200).json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting workspace",
      error: error.message,
    });
  }
};

const getWorkspaceById = async (req, res) => {
  try {
    const workspaceId = req.params.id;

    const workspaceArr = await Workspace.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(workspaceId) } },
      {
        $addFields: {
          "flowDiagram.nodes": {
            $map: {
              input: "$flowDiagram.nodes",
              as: "node",
              in: {
                $mergeObjects: [
                  "$$node",
                  {
                    data: {
                      $mergeObjects: [
                        "$$node.data",
                        {
                          assignedItems: {
                            $cond: {
                              if: { $isArray: "$$node.data.assignedItems" },
                              then: "$$node.data.assignedItems",
                              else: []
                            }
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "reports",
          let: { 
            allAssignedItems: {
              $reduce: {
                input: "$flowDiagram.nodes",
                initialValue: [],
                in: {
                  $concatArrays: [
                    "$$value",
                    {
                      $cond: {
                        if: { $isArray: "$$this.data.assignedItems" },
                        then: "$$this.data.assignedItems",
                        else: []
                      }
                    }
                  ]
                }
              }
            }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    { $toString: "$_id" },
                    {
                      $map: {
                        input: "$$allAssignedItems",
                        as: "item",
                        in: { $toString: "$$item" }
                      }
                    }
                  ]
                }
              }
            }
          ],
          as: "reportData"
        }
      },
      {
        $addFields: {
          "flowDiagram.nodes": {
            $map: {
              input: "$flowDiagram.nodes",
              as: "node",
              in: {
                $mergeObjects: [
                  "$$node",
                  {
                    data: {
                      $mergeObjects: [
                        "$$node.data",
                        {
                          assignedReports: {
                            $filter: {
                              input: "$reportData",
                              as: "report",
                              cond: {
                                $in: [
                                  { $toString: "$$report._id" },
                                  {
                                    $map: {
                                      input: "$$node.data.assignedItems",
                                      as: "item",
                                      in: { $toString: "$$item" }
                                    }
                                  }
                                ]
                              }
                            }
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          reportData: 0 // Remove the temporary reportData field
        }
      }
    ]);

    const workspace = workspaceArr[0];
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Workspace retrieved successfully",
      workspace,
    });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching workspace",
      error: error.message,
    });
  }
};

// Assign item(s) to a node in a workspace's flow diagram
const assignItemToNode = async (req, res) => {
  try {
    const { workspaceId, nodeId } = req.params;
    const { assignedItems } = req.body; // Array of item IDs

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if user has permission to modify this workspace
    if (workspace.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this workspace" });
    }

    // Find the target node
    const targetNode = workspace.flowDiagram.nodes.find((n) => n.id === nodeId);
    if (!targetNode) {
      return res.status(404).json({ message: "Node not found" });
    }

    // Validate assignedItems input
    if (!Array.isArray(assignedItems)) {
      return res.status(400).json({ 
        success: false,
        message: "assignedItems must be an array" 
      });
    }

    // Convert all assigned items to strings for consistent comparison
    const newAssignedItems = assignedItems.map(item => item.toString());
    
    // Remove these items from all other nodes first
    workspace.flowDiagram.nodes.forEach((node) => {
      if (node.id !== nodeId) {
        // Initialize assignedItems if it doesn't exist
        if (!node.data.assignedItems) {
          node.data.assignedItems = [];
        }
        
        // Remove any items that are being assigned to the target node
        node.data.assignedItems = node.data.assignedItems.filter(
          (item) => !newAssignedItems.includes(item.toString())
        );
      }
    });

    // Initialize assignedItems for target node if it doesn't exist
    if (!targetNode.data.assignedItems) {
      targetNode.data.assignedItems = [];
    }

    // Get existing items in target node
    const existingItems = targetNode.data.assignedItems.map(item => item.toString());
    
    // Add new items to target node (avoid duplicates)
    newAssignedItems.forEach((item) => {
      if (!existingItems.includes(item)) {
        targetNode.data.assignedItems.push(item);
      }
    });

    // Update the nodeId in the Report model for all assigned items
    await Report.updateMany(
      { _id: { $in: newAssignedItems } },
      { $set: { nodeId: nodeId } }
    );

    // Clear nodeId for items that were removed from other nodes
    const removedItems = [];
    workspace.flowDiagram.nodes.forEach((node) => {
      if (node.id !== nodeId) {
        const itemsRemoved = node.data.assignedItems.filter(
          item => !newAssignedItems.includes(item.toString())
        );
        if (itemsRemoved.length > 0) {
          removedItems.push(...itemsRemoved);
        }
      }
    });

    if (removedItems.length > 0) {
      await Report.updateMany(
        { _id: { $in: removedItems } },
        { $set: { nodeId: null } }
      );
    }

    workspace.flowDiagram.lastUpdated = new Date();
    await workspace.save();

    // Prepare response data showing which items were moved
    const movedItems = [];
    workspace.flowDiagram.nodes.forEach((node) => {
      if (node.id !== nodeId) {
        const removedItems = assignedItems.filter(item => {
          const originalItems = node.data.assignedItems || [];
          return !originalItems.map(i => i.toString()).includes(item.toString());
        });
        if (removedItems.length > 0) {
          movedItems.push({
            fromNodeId: node.id,
            fromNodeTitle: node.data.title,
            removedItems: removedItems
          });
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Item(s) assigned to node successfully",
      data: {
        targetNode: {
          id: targetNode.id,
          title: targetNode.data.title,
          assignedItems: targetNode.data.assignedItems
        },
        movedItems: movedItems,
        totalAssignedItems: targetNode.data.assignedItems.length
      }
    });
  } catch (error) {
    console.error("Error assigning item to node:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning item to node",
      error: error.message,
    });
  }
};

// Delete a node from a workspace's flow diagram
const deleteNodeFromWorkspace = async (req, res) => {
  try {
    const { workspaceId, nodeId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    // Authorization check
    if (workspace.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to modify this workspace" });
    }

    // Find node index
    const nodeIndex = workspace.flowDiagram.nodes.findIndex((n) => n.id === nodeId);
    if (nodeIndex === -1) {
      return res.status(404).json({ success: false, message: "Node not found" });
    }

    const nodeToDelete = workspace.flowDiagram.nodes[nodeIndex];

    // Collect assigned items from this node to clear their nodeId
    const assignedItems = (nodeToDelete?.data?.assignedItems || []).map((i) => i.toString());

    // Remove the node
    workspace.flowDiagram.nodes.splice(nodeIndex, 1);

    // Remove connected edges
    workspace.flowDiagram.edges = workspace.flowDiagram.edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId
    );

    // Clear nodeId in Report documents that were assigned to this node
    if (assignedItems.length > 0) {
      await Report.updateMany({ _id: { $in: assignedItems } }, { $set: { nodeId: null } });
    }

    workspace.flowDiagram.lastUpdated = new Date();
    await workspace.save();

    return res.status(200).json({
      success: true,
      message: "Node deleted successfully",
      workspace,
      removedNodeId: nodeId,
      clearedItems: assignedItems,
    });
  } catch (error) {
    console.error("Error deleting node from workspace:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting node from workspace",
      error: error.message,
    });
  }
};

const defaultFlowDiagram = {
  nodes: [
    {
      id: "1",
      type: "customNode",
      data: {
        title: "Get data",
        description: "Get data",
        color: "#0078D4",
        icon: "m-get-data",
        assignedItems: [],
      },
      position: { x: 0, y: 0 },
      style: {
        padding: "16px",
        borderRadius: "8px",
        minWidth: "160px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        border: "1px solid #0078D4",
      },
    },
    {
      id: "2",
      type: "customNode",
      data: {
        title: "Mirror",
        description: "Mirror data",
        color: "#881798",
        icon: "mirror",
        assignedItems: [],
      },
      position: { x: 0, y: 180 },
      style: {
        padding: "16px",
        borderRadius: "8px",
        minWidth: "160px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        border: "1px solid #881798",
      },
    },
    {
      id: "3",
      type: "customNode",
      data: {
        title: "Store",
        description: "Store data",
        color: "#0078D4",
        icon: "store",
        assignedItems: [],
      },
      position: { x: 260, y: 90 },
      style: {
        padding: "16px",
        borderRadius: "8px",
        minWidth: "160px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        border: "1px solid #0078D4",
      },
    },
    {
      id: "4",
      type: "customNode",
      data: {
        title: "Prepare",
        description: "Prepare data",
        color: "#5C2E91",
        icon: "m-prepare",
        assignedItems: [],
      },
      position: { x: 520, y: 90 },
      style: {
        padding: "16px",
        borderRadius: "8px",
        minWidth: "160px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        border: "1px solid #5C2E91",
      },
    },
    {
      id: "5",
      type: "customNode",
      data: {
        title: "Analyze and train",
        description: "Analyze and train data",
        color: "#DA3B01",
        icon: "m-analyze",
        assignedItems: [],
      },
      position: { x: 780, y: 0 },
      style: {
        padding: "16px",
        borderRadius: "8px",
        minWidth: "160px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        border: "1px solid #DA3B01",
      },
    },
    {
      id: "6",
      type: "customNode",
      data: {
        title: "Develop",
        description: "Develop data",
        color: "#0099BC",
        icon: "m-develop",
        assignedItems: [],
      },
      position: { x: 1040, y: 0 },
      style: {
        padding: "16px",
        borderRadius: "8px",
        minWidth: "160px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        border: "1px solid #0099BC",
      },
    },
    {
      id: "7",
      type: "customNode",
      data: {
        title: "Visualize",
        description: "Visualize data",
        color: "#EAA300",
        icon: "m-visualize",
        assignedItems: [],
      },
      position: { x: 780, y: 180 },
      style: {
        padding: "16px",
        borderRadius: "8px",
        minWidth: "160px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        border: "1px solid #EAA300",
      },
    },
    {
      id: "8",
      type: "customNode",
      data: {
        title: "Track",
        description: "Track data",
        color: "#BF0077",
        icon: "m-track",
        assignedItems: [],
      },
      position: { x: 1040, y: 180 },
      style: {
        padding: "16px",
        borderRadius: "8px",
        minWidth: "160px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        border: "1px solid #BF0077",
      },
    },
    {
      id: "9",
      type: "customNode",
      data: {
        title: "Distribute",
        description: "Distribute data",
        color: "#00CC6A",
        icon: "m-distribute",
        assignedItems: [],
      },
      position: { x: 1300, y: 90 },
      style: {
        padding: "16px",
        borderRadius: "8px",
        minWidth: "160px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        border: "1px solid #00CC6A",
      },
    },
  ],
  edges: [
    {
      id: "e1-3",
      source: "1",
      target: "3",
      type: "smoothstep",
      style: { stroke: "#00796b", strokeWidth: 3 },
    },
    {
      id: "e2-3",
      source: "2",
      target: "3",
      type: "smoothstep",
      style: { stroke: "#00796b", strokeWidth: 3 },
    },
    {
      id: "e3-4",
      source: "3",
      target: "4",
      type: "smoothstep",
      style: { stroke: "#00796b", strokeWidth: 3 },
    },
    {
      id: "e4-5",
      source: "4",
      target: "5",
      type: "smoothstep",
      style: { stroke: "#00796b", strokeWidth: 3 },
    },
    {
      id: "e5-6",
      source: "5",
      target: "6",
      type: "smoothstep",
      style: { stroke: "#00796b", strokeWidth: 3 },
    },
    {
      id: "e4-7",
      source: "4",
      target: "7",
      type: "smoothstep",
      style: { stroke: "#00796b", strokeWidth: 3 },
    },
    {
      id: "e7-8",
      source: "7",
      target: "8",
      type: "smoothstep",
      style: { stroke: "#00796b", strokeWidth: 3 },
    },
    {
      id: "e6-8",
      source: "6",
      target: "8",
      type: "smoothstep",
      style: { stroke: "#00796b", strokeWidth: 3 },
    },
    {
      id: "e8-9",
      source: "8",
      target: "9",
      type: "smoothstep",
      style: { stroke: "#00796b", strokeWidth: 3 },
    },
    {
      id: "e7-9",
      source: "7",
      target: "9",
      type: "smoothstep",
      style: { stroke: "#00796b", strokeWidth: 3 },
    },
  ],
};

module.exports = {
  createWorkspace,
  updateWorkspace,
  workspacesByUserId,
  getAllWorkspaces,
  deleteWorkspace,
  getWorkspaceById,
  assignItemToNode,
  deleteNodeFromWorkspace,
};