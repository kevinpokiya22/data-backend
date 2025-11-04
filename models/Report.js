const mongoose = require("mongoose");

const ShapeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  pageNumber: {
    type: Number,
    required: true
  },
  size: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  position: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  type: {
    type: String,
    required: true
  },
  // Store full raw style received from frontend to avoid lossy persistence
  style: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Structured styling used by the UI (background, border, shadow, glow, title, etc.)
  styleProperties: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Optional tooltip text for the shape
  tooltip: {
    type: String,
    default: ''
  },
  // Title/subtitle/divider configuration used by some shapes
  titleProperties: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Header styling for shape action bar (colors, transparency, etc.)
  headerStyling: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Enable/disable controls like show more/delete
  controls: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Bookmarks attached to book shapes; include elements state snapshot
  bookmarks: [{
    id: String,
    text: String,
    isActive: Boolean,
    // Optional fields if frontend sends them
    bookShapeId: String,
    originalId: String,
    elementsData: { type: mongoose.Schema.Types.Mixed, default: [] }
  }]
});

const TextSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  pageNumber: {
    type: Number,
    required: true
  },
  size: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  position: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  type: {
    type: String,
    default: 'text',
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  // Rich HTML content preserving inline formatting like sup/sub
  formattedText: {
    type: String,
    default: ''
  },
  formatting: {
    font: {
      type: String,
      default: 'Segoe UI'
    },
    fontSize: {
      type: Number,
      default: 30
    },
    bold: {
      type: Boolean,
      default: false
    },
    italic: {
      type: Boolean,
      default: false
    },
    underline: {
      type: Boolean,
      default: false
    },
    list: {
      type: Boolean,
      default: false
    },
    alignLeft: {
      type: Boolean,
      default: false
    },
    alignCenter: {
      type: Boolean,
      default: false
    },
    alignRight: {
      type: Boolean,
      default: false
    },
    superscript: {
      type: Boolean,
      default: false
    },
    subscript: {
      type: Boolean,
      default: false
    }
  }
});

const chartSchema = new mongoose.Schema({
  id: {
    type: String, // Changed from Number to String
  },
  type: {
    type: String,
  },
  dataSelection: {
    columns: [String],
    xAxis: String, // Changed from [String] to String
    yAxis: String, // Changed from [String] to String
    legend: String,
    aggregation: String,
    additionalFields: [String],
    tooltips: [
      {
        field: String,
        agg: String
      }
    ],
  },
  chartData: [
    {
      // This is an array of objects, so we need to define the type as Mixed
      type: mongoose.Schema.Types.Mixed,
    },
  ],
  position: {
    x: Number,
    y: Number,
  },
  size: {
    width: Number,
    height: Number,
  },
  pageNumber: {
    type: Number,
    default: 1,
  },
  selectedColumns: {
    type: [String],
  },
  visible: {
    type: Boolean,
    default: true,
  },
  // Appearance settings
  appearance: {
    background: {
      color: {
        type: String,
        default: '#ffffff'
      },
      transparency: {
        type: Number,
        default: 0
      }
    },
    border: {
      color: {
        type: String,
        default: '#e5e7eb'
      },
      width: {
        type: Number,
        default: 0
      },
      radius: {
        type: Number,
        default: 0
      }
    },
    shadow: {
      color: {
        type: String,
        default: 'rgba(0,0,0,0.15)'
      },
      position: {
        type: String,
        default: 'Bottom right'
      },
      offset: {
        type: String,
        default: 'Outside'
      },
      blur: {
        type: Number,
        default: 12
      },
      spread: {
        type: Number,
        default: 0
      }
    }
  },
  // Title properties
  titleProperties: {
    title: {
      text: {
        type: String,
        default: ''
      },
      fontFamily: {
        type: String,
        default: '"Inter", sans-serif'
      },
      fontSize: {
        type: Number,
        default: 14
      },
      color: {
        type: String,
        default: '#000000'
      },
      backgroundColor: {
        type: String,
        default: '#ffffff'
      },
      textWrap: {
        type: Boolean,
        default: false
      },
      styles: {
        bold: {
          type: Boolean,
          default: false
        },
        italic: {
          type: Boolean,
          default: false
        },
        underline: {
          type: Boolean,
          default: false
        }
      }
    },
    subtitle: {
      text: {
        type: String,
        default: ''
      },
      fontFamily: {
        type: String,
        default: '"Inter", sans-serif'
      },
      fontSize: {
        type: Number,
        default: 10
      },
      color: {
        type: String,
        default: '#000000'
      },
      textWrap: {
        type: Boolean,
        default: false
      },
      styles: {
        bold: {
          type: Boolean,
          default: false
        },
        italic: {
          type: Boolean,
          default: false
        },
        underline: {
          type: Boolean,
          default: false
        }
      }
    },
    divider: {
      color: {
        type: String,
        default: '#ffffff'
      },
      lineStyle: {
        type: String,
        default: 'Solid'
      },
      width: {
        type: Number,
        default: 1
      }
    }
  },
  // Legend options
 labelOptions: {
    position: {
      type: String,
      default: 'Outside'
	  },
    contents: {
      type: String,
      default: 'Data Value, Percent of total'
    },
    text: {
      fontFamily: {
        type: String,
        default: 'Segoe UI'
      },
      fontSize: {
        type: Number,
        default: 12
      },
      color: {
        type: String,
        default: '#000000'
      },
      styles: {
        bold: { type: Boolean, default: false },
        italic: { type: Boolean, default: false },
        underline: { type: Boolean, default: false }
      }
    }
  },
  // Per-slice custom colors (pie/donut). Keyed by slice/series name -> hex color
  // Using Map ensures stable storage and retrieval from MongoDB
  sliceColors: {
    type: Map,
    of: String,
    default: {}
  },
  // Pie/Donut slice border configuration (per-chart)
  sliceBorder: {
    color: { type: String, default: '#ffffff' },
    width: { type: Number, default: 0 },
    radiusPercent: { type: Number, default: 0 },
    matchFillColor: { type: Boolean, default: false },
    hideInnerBorders: { type: Boolean, default: false },
    // Frontend sends an array of category/series labels
    targetSeries: { type: [String], default: [] },
    // Frontend may send per-series overrides as objects/maps
    seriesColors: { type: Map, of: String, default: {} },
    seriesWidths: { type: Map, of: Number, default: {} },
    seriesTransparencies: { type: Map, of: Number, default: {} },
    // Optional global transparency support
    transparency: { type: Number, default: 0 }
  },
  // Pie specific options
  pieOptions: {
    rotation: { type: Number, default: 0 }
  },
  // Legend options (chart legend)
  legendOptions: {
    position: { type: String, default: 'Top Center' },
    enabled: { type: Boolean, default: true },
    text: {
      fontFamily: { type: String, default: 'Segoe UI' },
      fontSize: { type: Number, default: 11 },
      color: { type: String, default: '#000000' },
      styles: {
        bold: { type: Boolean, default: false },
        italic: { type: Boolean, default: false },
        underline: { type: Boolean, default: false }
      }
    }
  },
  // Header styling (top action area colors)
  headerStyling: {
    color: { type: String, default: '#ffffff' },
    transparency: { type: Number, default: 100 },
    borderColor: { type: String, default: '#ffffff' },
    iconColor: { type: String, default: '#000000' }
  },
  // Tooltip properties
  tooltipProperties: {
    options: {
      type: { type: String, default: 'Default' },
      page: { type: String, default: 'Auto' }
    },
    text: {
      font: {
        family: { type: String, default: '"Inter", sans-serif' },
        size: { type: Number, default: 14 },
        styles: {
          bold: { type: Boolean, default: false },
          italic: { type: Boolean, default: false },
          underline: { type: Boolean, default: false }
        }
      },
      labelColor: { type: String, default: '#000000' },
      valueColor: { type: String, default: '#000000' }
    },
    background: {
      color: { type: String, default: '#ffffff' },
      transparency: { type: Number, default: 10 }
    }
  },
  // X-axis properties
  xAxisProperties: {
    value: {
      fontFamily: { type: String, default: '"Inter", sans-serif' },
      fontSize: { type: Number, default: 11 },
      color: { type: String, default: '#000000' },
      transparency: { type: Number, default: 0 },
      styles: {
        bold: { type: Boolean, default: false },
        italic: { type: Boolean, default: false },
        underline: { type: Boolean, default: false }
      }
    },
    title: {
      text: { type: String, default: '' },
      fontFamily: { type: String, default: '"Inter", sans-serif' },
      fontSize: { type: Number, default: 13 },
      color: { type: String, default: '#000000' },
      transparency: { type: Number, default: 0 },
      styles: {
        bold: { type: Boolean, default: false },
        italic: { type: Boolean, default: false },
        underline: { type: Boolean, default: false }
      }
    },
    layout: {
      transparency: { type: Number, default: 0 }
    }
  },
  // Y-axis properties
  yAxisProperties: {
    value: {
      fontFamily: { type: String, default: '"Inter", sans-serif' },
      fontSize: { type: Number, default: 11 },
      color: { type: String, default: '#000000' },
      transparency: { type: Number, default: 0 },
      styles: {
        bold: { type: Boolean, default: false },
        italic: { type: Boolean, default: false },
        underline: { type: Boolean, default: false }
      },
      decimalPlaces: { type: Number, default: 0 },
      displayUnits: { type: String, default: 'Auto' }
    },
    title: {
      text: { type: String, default: '' },
      fontFamily: { type: String, default: '"Inter", sans-serif' },
      fontSize: { type: Number, default: 12 },
      color: { type: String, default: '#000000' },
      transparency: { type: Number, default: 0 },
      styles: {
        bold: { type: Boolean, default: false },
        italic: { type: Boolean, default: false },
        underline: { type: Boolean, default: false }
      }
    }
  },
  // Gridlines
  gridlines: {
    color: { type: String, default: '#9ca3af' },
    transparency: { type: Number, default: 0 },
    lineStyle: { type: String, default: 'Dotted' },
    horizontal: { type: Boolean, default: true },
    vertical: { type: Boolean, default: false },
    width: { type: Number, default: 1 }
  },
  // Line styles for line charts
  lineStyles: {
    applyTo: { type: String, default: 'All' },
    global: {
      color: { type: String, default: '#3b82f6' },
      style: { type: String, default: 'Solid' },
      join: { type: String, default: 'Round' },
      width: { type: Number, default: 2 },
      interpolation: { type: String, default: 'Linear' },
      transparency: { type: Number, default: 0 }
    },
    perSeries: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
  },
  // Plot area background
  plotArea: {
    background: {
      color: { type: String, default: '#ffffff' },
      image: { type: mongoose.Schema.Types.Mixed, default: null },
      transparency: { type: Number, default: 100 },
      fit: { type: String, default: 'Fit' }
    }
  },
  // Chart control toggles
  showMoreEnabled: { type: Boolean, default: true },
  deleteChartEnabled: { type: Boolean, default: true },
  // Separate map to store per-series fill transparencies
  sliceColorTransparencies: { type: Map, of: Number, default: {} },
  // Area shading config
  areaShade: {
    applyTo: { type: String, default: 'All' },
    color: { type: String, default: null },
    globalTransparency: { type: Number, default: 80 },
    seriesTransparencies: { type: Map, of: Number, default: {} },
    seriesColors: { type: Map, of: String, default: {} }
  },
  // Data labels configuration
  dataLabels: {
    enabled: { type: Boolean, default: false },
    applyTo: { type: String, default: 'All' },
    orientation: { type: String, default: 'Horizontal' },
    position: { type: String, default: 'Outside end' },
    layout: { type: String, default: 'Single line' },
    showTitle: { type: Boolean, default: false },
    title: {
      fontFamily: { type: String, default: 'Segoe UI' },
      fontSize: { type: Number, default: 10 },
      color: { type: String, default: '#000000' },
      styles: {
        bold: { type: Boolean, default: false },
        italic: { type: Boolean, default: false },
        underline: { type: Boolean, default: false }
      }
    },
    value: {
      fontFamily: { type: String, default: 'Segoe UI' },
      fontSize: { type: Number, default: 10 },
      color: { type: String, default: '#000000' },
      styles: {
        bold: { type: Boolean, default: false },
        italic: { type: Boolean, default: false },
        underline: { type: Boolean, default: false }
      }
    },
    background: {
      color: { type: String, default: '#ffffff' },
      transparency: { type: Number, default: 100 }
    }
  },
  // Bars layout
  barsLayout: {
    categoryGap: { type: Number, default: 20 }
  },
  // Total labels for stacked bars
  totalLabels: {
    enabled: { type: Boolean, default: false },
    displayUnits: { type: String, default: 'Auto' },
    text: {
      fontFamily: { type: String, default: 'Segoe UI' },
      fontSize: { type: Number, default: 11 },
      color: { type: String, default: '#000000' },
      styles: {
        bold: { type: Boolean, default: false },
        italic: { type: Boolean, default: false },
        underline: { type: Boolean, default: false }
      }
    },
    background: {
      enabled: { type: Boolean, default: false },
      color: { type: String, default: '#e5e7eb' },
      transparency: { type: Number, default: 0 },
      paddingX: { type: Number, default: 6 },
      paddingY: { type: Number, default: 2 },
      borderRadius: { type: Number, default: 4 }
    }
  },
  // Y-axis range config
  yAxisRange: {
    mode: { type: String, default: 'auto' },
    min: { type: Number, default: null },
    max: { type: Number, default: null }
  },
  // Marker configuration for line charts
  marker: {
    applyTo: { type: String, default: 'All' },
    enabled: { type: Boolean, default: false },
    shape: {
      type: { type: String, default: 'Circle' },
      size: { type: Number, default: 5 },
      rotation: { type: Number, default: 0 }
    },
    color: {
      selectedColor: { type: String, default: '#3b82f6' },
      transparency: { type: Number, default: 0 }
    },
    border: {
      color: { type: String, default: '#ffffff' },
      width: { type: Number, default: 1 },
      transparency: { type: Number, default: 0 }
    },
    perSeries: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
  }
});

const reportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  workspaceId: {
    type: String,
    required: true,
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  },
  excelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'exceldatas',
    default: null,
  },
  nodeId: {
    type: String,
    default: null,
  },
  charts: [chartSchema], // Array of chartSchema
  shapes: [ShapeSchema],
  texts: [TextSchema], // Add texts array
  // Visual settings
  wallpaper: {
    color: { type: String, default: '#ffffff' },
    image: {
      // Frontend sends { file, url, name } – persist name and url
      name: { type: String, default: null },
      url: { type: String, default: null }
    },
    transparency: { type: Number, default: 100 },
    fit: { type: String, default: 'Fit' }
  },
  canvas: {
    color: { type: String, default: '#F7F7F7' },
    image: {
      name: { type: String, default: null },
      url: { type: String, default: null }
    },
    transparency: { type: Number, default: 100 },
    fit: { type: String, default: 'Fit' },
    type: { type: String, default: '16:9' },
    customWidth: { type: Number, default: 1280 },
    customHeight: { type: Number, default: 720 },
    verticalAlign: { type: String, default: 'Middle' },
    contrastMode: { type: String, default: 'normal' }
  },
  // Page names keyed by page index/id
  pageNames: {
    type: Map,
    of: String,
    default: {}
  },
  // Filter styling states
  filterStyles: {
    // Text styling
    selectedFont: { type: String, default: 'Inter' },
    textSize: { type: Number, default: 14 },
    selectedTextColor: { type: String, default: '#000000' },
    
    // Input styling
    inputBackgroundColor: { type: String, default: '#ffffff' },
    searchBoxSize: { type: Number, default: 12 },
    
    // Border styling
    borderColor: { type: String, default: '#d1d5db' },
    
    // Background styling
    backgroundColor: { type: String, default: '#ffffff' },
    backgroundTransparency: { type: Number, default: 100 },
  },
  filtercards: {
    // Text styling
    selectedFont: { type: String, default: 'Inter' },
    textSize: { type: Number, default: 12 },
    selectedTextColor: { type: String, default: '#000000' },
    // Input styling
    inputBackgroundColor: { type: String, default: '#ffffff' },
    
    // Border styling
    borderColor: { type: String, default: '#d1d5db' },
    
    // Background styling
    backgroundColor: { type: String, default: '#ffffff' },
    backgroundTransparency: { type: Number, default: 100 },
  },
  // createdAt: {
  //   type: Date,
  //   default: Date.now,
  // },
  // updatedAt: {
  //   type: Date,
  //   default: Date.now,
  // },
  SavedType: {
    type: String,
  },
},
  {
    timestamps: true,
    versionKey: false
  });

// // Update the updatedAt timestamp before saving
// reportSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

module.exports = mongoose.model("Report", reportSchema);


