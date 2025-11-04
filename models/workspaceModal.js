const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      default: null,
    },
    flowDiagram: {
      nodes: [
        {
          id: { type: String, required: true },
          type: { type: String, required: true },
          data: {
            title: { type: String, required: true },
            description: { type: String, required: true },
            color: { type: String, required: true },
            icon: { type: String, required: true },
            assignedItems: { type: Array, default: [] },
          },
          position: {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
          },
          style: {
            padding: String,
            borderRadius: String,
            minWidth: String,
            boxShadow: String,
            border: String,
            backgroundColor: String,
          },
          
        },
      ],
      edges: [
        {
          id: { type: String, required: true },
          source: { type: String, required: true },
          target: { type: String, required: true },
          type: { type: String, default: "smoothstep" },
          animated: { type: Boolean, default: false },
          style: {
            stroke: { type: String, default: "#00796b" },
            strokeWidth: { type: Number, default: 2 },
          },
          markerEnd: {
            type: { type: String, default: "arrowclosed" },
            width: { type: Number, default: 20 },
            height: { type: Number, default: 20 },
            color: { type: String, default: "#00796b" },
          },
        },
      ],
      lastUpdated: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("workspace", workspaceSchema);
