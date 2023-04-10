export const defaultOption: Record<string, any> = {
  // zoom: 1,
  // pan: { x: 0, y: 0 },

  // // interaction options:
  // minZoom: 1e-50,
  // maxZoom: 1e50,
  zoomSensitivity: 0.1,
  // zoomingEnabled: true,
  // userZoomingEnabled: true,
  // panningEnabled: true,
  // userPanningEnabled: true,
  boxSelectionEnabled: true,
  // selectionType: "additive",
  // touchTapThreshold: 8,
  // desktopTapThreshold: 4,
  // autolock: false,
  // autoungrabify: false,
  autounselectify: false,
  // multiClickDebounceTime: 250,

  // // rendering options:
  // headless: false,
  // styleEnabled: true,
  // hideEdgesOnViewport: false,
  // textureOnViewport: false,
  // motionBlur: false,
  // motionBlurOpacity: 0.2,
  wheelSensitivity: 0.1,
  // pixelRatio: "auto",
};

export const gridOption: Record<string, any> = {
  fit: true, // whether to fit the viewport to the graph
  padding: 30, // padding used on fit
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
  avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
  nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
  spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  condense: false, // uses all available space on false, uses minimal space on true
  rows: undefined, // force num of rows in the grid
  cols: undefined, // force num of columns in the grid
  position(node: any) {}, // returns { row, col } for element
  sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  animateFilter(node: any, i: number) {
    return true;
  }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  transform(node: any, position: number) {
    return position;
  }, // transform a given node position. Useful for changing flow direction in discrete layouts
};

export const circleOption: Record<string, any> = {
  fit: true, // whether to fit the viewport to the graph
  padding: 30, // the padding on fit
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
  nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
  spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  radius: undefined, // the radius of the circle
  startAngle: (3 / 2) * Math.PI, // where nodes start in radians
  sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
  clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
  sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  animateFilter(node: any, i: number) {
    return true;
  }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  transform(node: any, position: number) {
    return position;
  }, // transform a given node position. Useful for changing flow direction in discrete layouts
};

export const concentricOption: Record<string, any> = {
  fit: true, // whether to fit the viewport to the graph
  padding: 30, // the padding on fit
  startAngle: (3 / 2) * Math.PI, // where nodes start in radians
  sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
  clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
  equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
  minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
  nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
  height: undefined, // height of layout area (overrides container height)
  width: undefined, // width of layout area (overrides container width)
  spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  concentric(node: any) {
    // returns numeric value for each node, placing higher nodes in levels towards the centre
    return node.degree();
  },
  levelWidth(nodes: any) {
    // the variation of concentric values in each level
    return nodes.maxDegree() / 4;
  },
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  animateFilter(node: any, i: number) {
    return true;
  }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  transform(node: any, position: number) {
    return position;
  }, // transform a given node position. Useful for changing flow direction in discrete layouts
};

export const breadthfirstOption: Record<string, any> = {
  fit: true, // whether to fit the viewport to the graph
  directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
  padding: 30, // padding on fit
  circle: false, // put depths in concentric circles if true, put depths top down if false
  grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
  spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
  nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
  roots: undefined, // the roots of the trees
  maximal: false, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
  depthSort: undefined, // a sorting function to order nodes at equal depth. e.g. function(a, b){ return a.data('weight') - b.data('weight') }
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled,
  animateFilter(node: any, i: number) {
    return true;
  }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
  ready: undefined, // callback on layoutready
  stop: undefined, // callback on layoutstop
  transform(node: any, position: number) {
    return position;
  }, // transform a given node position. Useful for changing flow direction in discrete layouts
};

export const klayOption: Record<string, any> = {
  nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
  fit: true, // Whether to fit
  padding: 20, // Padding on fit
  animate: false, // Whether to transition the node positions
  animateFilter(node: any, i: number) {
    return true;
  }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // Duration of animation in ms if enabled
  animationEasing: undefined, // Easing of animation if enabled
  transform(node: any, pos: number) {
    return pos;
  }, // A function that applies a transform to the final node position
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  klay: {
    // Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
    addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
    aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
    borderSpacing: 20, // Minimal amount of space to be left to the border
    compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
    crossingMinimization: "LAYER_SWEEP", // Strategy for crossing minimization.
    /* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
    INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
    cycleBreaking: "GREEDY", // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
    /* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
    INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
    direction: "UNDEFINED", // Overall direction of edges: horizontal (right / left) or vertical (down / up)
    /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
    edgeRouting: "ORTHOGONAL", // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
    edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
    feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
    fixedAlignment: "NONE", // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
    /* NONE Chooses the smallest layout from the four possible candidates.
    LEFTUP Chooses the left-up candidate from the four possible candidates.
    RIGHTUP Chooses the right-up candidate from the four possible candidates.
    LEFTDOWN Chooses the left-down candidate from the four possible candidates.
    RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
    BALANCED Creates a balanced layout from the four possible candidates. */
    inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
    layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
    linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
    mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
    mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
    nodeLayering: "NETWORK_SIMPLEX", // Strategy for node layering.
    /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
    LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
    INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
    nodePlacement: "BRANDES_KOEPF", // Strategy for Node Placement
    /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
    LINEAR_SEGMENTS Computes a balanced placement.
    INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
    SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
    randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
    routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
    separateConnectedComponents: true, // Whether each connected component should be processed separately
    spacing: 20, // Overall setting for the minimal amount of space to be left between objects
    thoroughness: 7, // How much effort should be spent to produce a nice layout..
  },
  priority(edge: any) {
    return null;
  }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled
};

export const dagreOption: Record<string, any> = {
  // dagre algo options, uses default value on undefined
  nodeSep: undefined, // the separation between adjacent nodes in the same rank
  edgeSep: undefined, // the separation between adjacent edges in the same rank
  rankSep: undefined, // the separation between each rank in the layout
  rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
  align: undefined, // alignment for rank nodes. Can be 'UL', 'UR', 'DL', or 'DR', where U = up, D = down, L = left, and R = right
  acyclicer: undefined, // If set to 'greedy', uses a greedy heuristic for finding a feedback arc set for a graph.
  // A feedback arc set is a set of edges that can be removed to make a graph acyclic.
  ranker: undefined, // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
  minLen(edge: any) {
    return 1;
  }, // number of ranks to keep between the source and target of the edge
  edgeWeight(edge: any) {
    return 1;
  }, // higher weight edges are generally made shorter and straighter than lower weight edges

  // general layout options
  fit: true, // whether to fit to viewport
  padding: 100, // fit padding
  spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node
  animate: false, // whether to transition the node positions
  animateFilter(node: any, i: number) {
    return true;
  }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  transform(node: any, pos: any) {
    return pos;
  }, // a function that applies a transform to the final node position
  ready: undefined, // on layoutready
  stop: undefined, // on layoutstop
};

export const ciseOption: Record<string, any> = {
  // ClusterInfo can be a 2D array contaning node id's or a function that returns cluster ids.
  // For the 2D array option, the index of the array indicates the cluster ID for all elements in
  // the collection at that index. Unclustered nodes must NOT be present in this array of clusters.
  //
  // For the function, it would be given a Cytoscape node and it is expected to return a cluster id
  // corresponding to that node. Returning negative numbers, null or undefined is fine for unclustered
  // nodes.
  // e.g
  // Array:                                     OR          function(node){
  //  [ ['n1','n2','n3'],                                       ...
  //    ['n5','n6']                                         }
  //    ['n7', 'n8', 'n9', 'n10'] ]
  clusters: [],

  // -------- Optional parameters --------
  // Whether to animate the layout
  // - true : Animate while the layout is running
  // - false : Just show the end result
  // - 'end' : Animate directly to the end result
  animate: false,

  // number of ticks per frame; higher is faster but more jerky
  refresh: 10,

  // Animation duration used for animate:'end'
  animationDuration: undefined,

  // Easing for animate:'end'
  animationEasing: undefined,

  // Whether to fit the viewport to the repositioned graph
  // true : Fits at end of layout for animate:false or animate:'end'
  fit: true,

  // Padding in rendered co-ordinates around the layout
  padding: 30,

  // separation amount between nodes in a cluster
  // note: increasing this amount will also increase the simulation time
  nodeSeparation: 12.5,

  // Inter-cluster edge length factor
  // (2.0 means inter-cluster edges should be twice as long as intra-cluster edges)
  idealInterClusterEdgeLengthCoefficient: 1.4,

  // Whether to pull on-circle nodes inside of the circle
  allowNodesInsideCircle: false,

  // Max percentage of the nodes in a circle that can move inside the circle
  maxRatioOfNodesInsideCircle: 0.1,

  // - Lower values give looser springs
  // - Higher values give tighter springs
  springCoeff: 0.45,

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 4500,

  // Gravity force (constant)
  gravity: 0.25,

  // Gravity range (constant)
  gravityRange: 3.8,

  // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
  ready: undefined, // on layoutready
  stop: undefined, // on layoutstop
};

export const colaOption: Record<string, any> = {
  animate: true, // whether to show the layout as it's running
  refresh: 1, // number of ticks per frame; higher is faster but more jerky
  maxSimulationTime: 4000, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: true, // on every layout reposition of nodes, fit the viewport
  padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

  // layout event callbacks
  ready() {}, // on layoutready
  stop() {}, // on layoutstop

  // positioning options
  randomize: false, // use random node positions at beginning of layout
  avoidOverlap: true, // if true, prevents overlap of node bounding boxes
  handleDisconnected: true, // if true, avoids disconnected components from overlapping
  convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
  nodeSpacing(node: any) {
    return 10;
  }, // extra spacing around nodes
  flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
  alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
  gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
  centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)

  // different methods of specifying edge length
  // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
  edgeLength: undefined, // sets edge length directly in simulation
  edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
  edgeJaccardLength: undefined, // jaccard edge length in simulation

  // iterations of cola algorithm; uses default values on undefined
  unconstrIter: undefined, // unconstrained initial layout iterations
  userConstIter: undefined, // initial layout iterations with user-specified constraints
  allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
};

export const navigatorOption: Record<string, any> = {
  container: ".moz-graph-navigator", // string | false | undefined. Supported strings: an element id selector (like "#someId"), or a className selector (like ".someClassName"). Otherwise an element will be created by the library.
  viewLiveFramerate: 0, // set false to update graph pan only on drag end; set 0 to do it instantly; set a number (frames per second) to update not more than N times per second
  thumbnailEventFramerate: 30, // max thumbnail's updates per second triggered by graph updates
  thumbnailLiveFramerate: false, // max thumbnail's updates per second. Set false to disable
  dblClickDelay: 200, // milliseconds
  removeCustomContainer: false, // destroy the container specified by user on plugin destroy
  rerenderDelay: 100, // ms to throttle rerender updates to the panzoom for performance
};

export const undoRedoOptions: Record<string, any> = {
  isDebug: false, // Debug mode for console messages
  actions: {}, // actions to be added
  undoableDrag: true, // Whether dragging nodes are undoable can be a function as well
  stackSizeLimit: undefined, // Size limit of undo stack, note that the size of redo stack cannot exceed size of undo stack
  ready() {
    // callback when undo-redo is ready
  },
};

export const viewUtilitiesOptions: Record<string, any> = {
  highlightStyles: [
    {
      node: { "border-color": "#0088f4", "border-width": 4 },
      edge: {
        "line-color": "#0088f4",
        "source-arrow-color": "#0088f4",
        "target-arrow-color": "#0088f4",
        width: 4,
      },
    },
    {
      node: { "border-color": "#0088f4", "border-width": 4 },
      edge: {
        "line-color": "#0088f4",
        "source-arrow-color": "#0088f4",
        "target-arrow-color": "#0088f4",
        width: 4,
      },
    },
  ],
  selectStyles: {
    node: {
      "underlay-color": "#0088f4",
      "underlay-padding": "15px",
      "underlay-opacity": "0.3",
      "underlay-shape": "ellipse",
    },
    // node: { "border-color": "black", "border-width": 3, "background-color": "lightgrey" },
    // edge: {
    //   "line-color": "black",
    //   "source-arrow-color": "black",
    //   "target-arrow-color": "black",
    //   width: 3,
    // },
  },
  setVisibilityOnHide: false, // whether to set visibility on hide/show
  setDisplayOnHide: true, // whether to set display on hide/show
  zoomAnimationDuration: 1500, // default duration for zoom animation speed
  neighbor(ele: any) {
    if (ele.isNode()) {
      return ele.closedNeighborhood();
    } else if (ele.isEdge()) {
      return ele.source().closedNeighborhood().union(ele.target().closedNeighborhood());
    }
    // return ele.closedNeighborhood();
  },
  neighborSelectTime: 500,
  lassoStyle: { lineColor: "#d67614", lineWidth: 3 }, // default lasso line color, dark orange, and default line width
  htmlElem4marqueeZoom: "", // should be string like `#cy` or `.cy`. `#cy` means get element with the ID 'cy'. `.cy` means the element with class 'cy'
  marqueeZoomCursor: "se-resize", // the cursor that should be used when marquee zoom is enabled. It can also be an image if a URL to an image is given
  isShowEdgesBetweenVisibleNodes: true, // When showing elements, show edges if both source and target nodes become visible
};

export const contextMenuOptions: any = {
  // Customize event to bring up the context menu
  // Possible options https://js.cytoscape.org/#events/user-input-device-events
  // evtType: "cxttap",
  evtType: "cxttap",
  // List of initial menu items
  // A menu item must have either onClickFunction or submenu or both
  menuItems: [
    {
      id: "Highlight", // ID of menu item
      content: "Highlight", // Display content of menu item
      tooltipText: "Highlight", // Tooltip text for menu item
      // Filters the elements to have this menu item on cxttap
      // If the selector is not truthy no elements will have this menu item on cxttap
      // onClickFunction: function (event: any) {
      //   // The function to be executed on click
      //   console.log("highlight element");
      // },
      selector: "node, edge",
      disabled: false, // Whether the item will be created as disabled
      show: true, // Whether the item will be shown or not
      hasTrailingDivider: true, // Whether the item will have a trailing divider
      coreAsWell: true, // Whether core instance have this item on cxttap
      submenu: [
        {
          id: "Neighbors", // ID of menu item
          content: "Neighbors", // Display content of menu item
          tooltipText: "Neighbors", // Tooltip text for menu item
          // Filters the elements to have this menu item on cxttap
          // If the selector is not truthy no elements will have this menu item on cxttap
          selector: "node",
          disabled: false, // Whether the item will be created as disabled
          show: false, // Whether the item will be shown or not
          hasTrailingDivider: true, // Whether the item will have a trailing divider
          coreAsWell: true, // Whether core instance have this item on cxttap
          // submenu: [] // Shows the listed menuItems as a submenu for this item. An item must have either submenu or onClickFunction or both.
        },
        {
          id: "Linked Full", // ID of menu item
          content: "Linked Full", // Display content of menu item
          tooltipText: "Linked Full", // Tooltip text for menu item
          // Filters the elements to have this menu item on cxttap
          // If the selector is not truthy no elements will have this menu item on cxttap
          selector: "node",
          disabled: false, // Whether the item will be created as disabled
          show: false, // Whether the item will be shown or not
          hasTrailingDivider: true, // Whether the item will have a trailing divider
          coreAsWell: true, // Whether core instance have this item on cxttap
          // submenu: [] // Shows the listed menuItems as a submenu for this item. An item must have either submenu or onClickFunction or both.
        },
        {
          id: "Remove", // ID of menu item
          content: "Remove All", // Display content of menu item
          tooltipText: "Remove All", // Tooltip text for menu item
          // Filters the elements to have this menu item on cxttap
          // If the selector is not truthy no elements will have this menu item on cxttap
          disabled: false, // Whether the item will be created as disabled
          show: true, // Whether the item will be shown or not
          hasTrailingDivider: true, // Whether the item will have a trailing divider
          coreAsWell: true, // Whether core instance have this item on cxttap
          // submenu: [] // Shows the listed menuItems as a submenu for this item. An item must have either submenu or onClickFunction or both.
        },
      ], // Shows the listed menuItems as a submenu for this item. An item must have either submenu or onClickFunction or both.
    },
  ],
};

export const gridGuideOptions: any = {
  // On/Off Modules
  /* From the following four snap options, at most one should be true at a given time */
  snapToGridOnRelease: false, // Snap to grid on release
  snapToGridDuringDrag: false, // Snap to grid during drag
  snapToAlignmentLocationOnRelease: false, // Snap to alignment location on release
  snapToAlignmentLocationDuringDrag: false, // Snap to alignment location during drag
  distributionGuidelines: false, // Distribution guidelines
  geometricGuideline: false, // Geometric guidelines
  initPosAlignment: false, // Guideline to initial mouse position
  centerToEdgeAlignment: false, // Center to edge alignment
  resize: false, // Adjust node sizes to cell sizes
  parentPadding: false, // Adjust parent sizes to cell sizes by padding
  drawGrid: false, // Draw grid background

  // General
  gridSpacing: 20, // Distance between the lines of the grid.
  snapToGridCenter: false, // Snaps nodes to center of gridlines. When false, snaps to gridlines themselves. Note that either snapToGridOnRelease or snapToGridDuringDrag must be true.

  // Draw Grid
  zoomDash: true, // Determines whether the size of the dashes should change when the drawing is zoomed in and out if grid is drawn.
  panGrid: true, // Determines whether the grid should move then the user moves the graph if grid is drawn.
  gridStackOrder: -1, // Namely z-index
  gridColor: "#dedede", // Color of grid lines
  lineWidth: 1.0, // Width of grid lines

  // // Guidelines
  // guidelinesStackOrder: 4, // z-index of guidelines
  // guidelinesTolerance: 2.0, // Tolerance distance for rendered positions of nodes' interaction.
  // guidelinesStyle: {
  //   // Set ctx properties of line. Properties are here:
  //   strokeStyle: "#8b7d6b", // color of geometric guidelines
  //   geometricGuidelineRange: 400, // range of geometric guidelines
  //   range: 100, // max range of distribution guidelines
  //   minDistRange: 10, // min range for distribution guidelines
  //   distGuidelineOffset: 10, // shift amount of distribution guidelines
  //   horizontalDistColor: "#ff0000", // color of horizontal distribution alignment
  //   verticalDistColor: "#00ff00", // color of vertical distribution alignment
  //   initPosAlignmentColor: "#0000ff", // color of alignment to initial mouse location
  //   lineDash: [0, 0], // line style of geometric guidelines
  //   horizontalDistLine: [0, 0], // line style of horizontal distribution guidelines
  //   verticalDistLine: [0, 0], // line style of vertical distribution guidelines
  //   initPosAlignmentLine: [0, 0], // line style of alignment to initial mouse position
  // },

  // Parent Padding
  parentSpacing: -1, // -1 to set paddings of parents to gridSpacing
};

export const defaultStyle: any = [
  {
    selector: "edge",
    style: {
      // textBackgroundOpacity: 1,
      // textBackgroundColor: "white",
      // textBackgroundShape: "rectangle",
      label: "data(label)",
      curveStyle: "bezier",
      sourceArrowColor: "data(color)",
      targetArrowColor: "data(color)",
      // sourceArrowShape: "circle",
      targetArrowShape: "triangle",
      edgeTextRotation: "autorotate",
      lineColor: "data(color)",
      lineStyle: "solid",
      width: 1,
      fontSize: 10,
      controlPointStepSize: 100,
      overlayColor: "data(overlayColor)",
      overlayPadding: "data(overlayPadding)",
      overlayOpacity: "data(overlayOpacity)",
      overlayShape: "data(overlayShape)",
    },
  },
  {
    selector: "node",
    style: {
      label: "data(label)",
      backgroundColor: "data(color)",
      borderWidth: "data(borderWidth)",
      borderStyle: "data(borderStyle)",
      borderColor: "data(borderColor)",
      width: "data(width)",
      height: "data(height)",
      textValign: "bottom",
      textHalign: "center",
      // textWrap: "ellipsis",
      textWrap: "wrap",
      textMaxWidth: 120,
      fontSize: 12,
      color: "#233253",
      shape: "data(shape)",
      textMarginY: 10,
      overlayColor: "data(overlayColor)",
      overlayPadding: "data(overlayPadding)",
      overlayOpacity: "data(overlayOpacity)",
      overlayShape: "data(overlayShape)",
    },
  },
  {
    selector: ":parent",
    style: {
      textValign: "top",
      textHalign: "center",
      color: "#738099",
      fontSize: 15,
      fontWeight: 700,
      textMarginY: -10,
    },
  },
  {
    selector: ":active",
    style: {
      "overlay-color": "#0088f4",
      // "overlay-padding": "15px",
      "overlay-opacity": "0.2",
      // "overlay-shape": "ellipse",
    },
  },
];
