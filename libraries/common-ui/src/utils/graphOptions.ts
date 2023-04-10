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
  padding: 30, // fit padding
  spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
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
      node: { "border-color": "#0b9bcd", "border-width": 3 },
      edge: {
        "line-color": "#0b9bcd",
        "source-arrow-color": "#0b9bcd",
        "target-arrow-color": "#0b9bcd",
        width: 3,
      },
    },
    {
      node: { "border-color": "#04f06a", "border-width": 3 },
      edge: {
        "line-color": "#04f06a",
        "source-arrow-color": "#04f06a",
        "target-arrow-color": "#04f06a",
        width: 3,
      },
    },
  ],
  selectStyles: {
    node: { "border-color": "black", "border-width": 3, "background-color": "lightgrey" },
    edge: {
      "line-color": "black",
      "source-arrow-color": "black",
      "target-arrow-color": "black",
      width: 3,
    },
  },
  setVisibilityOnHide: false, // whether to set visibility on hide/show
  setDisplayOnHide: true, // whether to set display on hide/show
  zoomAnimationDuration: 1500, // default duration for zoom animation speed
  neighbor(ele: any) {
    return ele.closedNeighborhood();
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
  evtType: "cxttap",
  // List of initial menu items
  // A menu item must have either onClickFunction or submenu or both
  menuItems: [
    /*
    {
      id: 'remove', // ID of menu item
      content: 'remove', // Display content of menu item
      tooltipText: 'remove', // Tooltip text for menu item
      image: {src : "remove.svg", width : 12, height : 12, x : 6, y : 4}, // menu icon
      // Filters the elements to have this menu item on cxttap
      // If the selector is not truthy no elements will have this menu item on cxttap
      selector: 'node, edge', 
      onClickFunction: function () { // The function to be executed on click
        console.log('remove element');
      },
      disabled: false, // Whether the item will be created as disabled
      show: false, // Whether the item will be shown or not
      hasTrailingDivider: true, // Whether the item will have a trailing divider
      coreAsWell: false // Whether core instance have this item on cxttap
      submenu: [] // Shows the listed menuItems as a submenu for this item. An item must have either submenu or onClickFunction or both.
    },
    {
      id: 'hide',
      content: 'hide',
      tooltipText: 'hide',
      selector: 'node, edge',
      onClickFunction: function () {
        console.log('hide element');
      },
      disabled: true
    },
    {
      id: 'add-node',
      content: 'add node',
      tooltipText: 'add node',
      image: {src : "add.svg", width : 12, height : 12, x : 6, y : 4},
      selector: 'node',
      coreAsWell: true,
      onClickFunction: function () {
        console.log('add node');
      }
    }*/
  ],
  // css classes that menu items will have
  menuItemClasses: [
    // add class names to this list
  ],
  // css classes that context menu will have
  contextMenuClasses: [
    // add class names to this list
  ],
  // Indicates that the menu item has a submenu. If not provided default one will be used
  submenuIndicator: { src: "assets/submenu-indicator-default.svg", width: 12, height: 12 },
};
