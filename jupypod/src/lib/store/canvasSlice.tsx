import { StateCreator } from "zustand";

import { myNanoId, level2color } from "../utils";

import { MyState } from ".";

import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
  MarkerType,
  NodeDragHandler,
  ReactFlowInstance,
} from "reactflow";
import { parse } from "dotenv";
import { UpdateSharp } from "@mui/icons-material";

import { useStore } from "reactflow";

export const newNodeShapeConfig = {
  width: 250,
  // NOTE for import ipynb: we need to specify some reasonable height so that
  // the imported pods can be properly laid-out. 130 is a good one.
  // This number is also used in Canvas.tsx (refer to "A BIG HACK" in Canvas.tsx).
  height: 100,
};

const newGroupNodeShapeConfig = {
  width: 600,
  height: 600,
};

function createNewNode(type: "GROUP" | "CODE" | "RICH", position): Node {
  const id = myNanoId();
  const newNode = {
    id,
    type,
    position,
    ...(type === "GROUP"
      ? {
          width: newGroupNodeShapeConfig.width,
          height: newGroupNodeShapeConfig.height,
          style: {
            backgroundColor: level2color[0],
            width: newGroupNodeShapeConfig.width,
            height: newGroupNodeShapeConfig.height,
          },
        }
      : {
          width: newNodeShapeConfig.width,
          // Previously, we should not specify height, so that the pod can grow
          // when content changes. But when we add auto-layout on adding a new
          // node, unspecified height will cause  the node to be added always at
          // the top-left corner (the reason is unknown). Thus, we have to
          // specify the height here. Note that this height is a dummy value;
          // the content height will still be adjusted based on content height.
          height: newNodeShapeConfig.height,
          style: {
            width: newNodeShapeConfig.width,
            // It turns out that this height should not be specified to let the
            // height change automatically.
            //
            // height: 200
          },
        }),
    data: {
      label: id,
      name: "",
      parent: "ROOT",
      level: 0,
      state: {},
    },
    // dragHandle: ".custom-drag-handle",
  };
  return newNode;
}

function createStoredNode(type: "GROUP" | "CODE" | "RICH", position, state: any): Node {
  const id = myNanoId();
  const newNode = {
    id,
    type,
    position,
    // ...(type === "SCOPE"
    //   ? {
    //       width: newScopeNodeShapeConfig.width,
    //       height: newScopeNodeShapeConfig.height,
    //       style: {
    //         backgroundColor: level2color[0],
    //         width: newScopeNodeShapeConfig.width,
    //         height: newScopeNodeShapeConfig.height,
    //       },
    //     }
    //   : {
    width: newNodeShapeConfig.width,
    // Previously, we should not specify height, so that the pod can grow
    // when content changes. But when we add auto-layout on adding a new
    // node, unspecified height will cause  the node to be added always at
    // the top-left corner (the reason is unknown). Thus, we have to
    // specify the height here. Note that this height is a dummy value;
    // the content height will still be adjusted based on content height.
    height: newNodeShapeConfig.height,
    style: {
      width: newNodeShapeConfig.width,
      // It turns out that this height should not be specified to let the
      // height change automatically.
      //
      // height: 200
    },
    data: {
      label: id,
      name: "",
      parent: "ROOT",
      level: 0,
      state: state === undefined ? {} : state,
    },
    dragHandle: ".custom-drag-handle",
  };
  return newNode;
}

function parseFromLocalStorage(notebook: Notebook) {
  const nodes: Node[] = [];
  notebook.cells.forEach((cell) => {
    // const cellType = cell.celltype === "markdown" ? "RICH" : "CODE";
    const cellType = "RICH";
    const node = createStoredNode(cellType, cell.metadata.position, cell.source);
    nodes.push(node);
  });
  return nodes;
}

export function getAbsPos(node: Node) {
  let x;
  let y;
  if (node.positionAbsolute !== undefined) {
    x = node.positionAbsolute.x;
    y = node.positionAbsolute.y;
  } else {
    x = node.position.x;
    y = node.position.y;
  }
  return { x, y };
}

function getGroupAt(x: number, y: number, excludes: string[], nodes): Node {
  const group = nodes.findLast((node: Node) => {
    const { x: x1, y: y1 } = getAbsPos(node);
    return (
      node.type === "GROUP" &&
      x >= x1 &&
      !checkParentNodes(node, excludes, nodes) &&
      !excludes.includes(node.id) &&
      x <= x1 + node.width! &&
      y >= y1 &&
      y <= y1 + node.height!
    );
  });
  return group;
}

// function to make sure no group gets moved into its own child
function checkParentNodes(node: Node, excludes: string[], nodes) {
  if (node.parentNode === undefined || node.parentNode === "ROOT") {
    return false;
  }
  if (excludes.includes(node.parentNode)) {
    return true;
  }
  return checkParentNodes(
    nodes.find((pod: Node) => pod.id === node.parentNode),
    excludes,
    nodes
  );
}

function getNodePosInsideGroup(node: Node, group: Node): XYPosition {
  // compute the actual position
  let { x, y } = getAbsPos(node);
  const { x: dx, y: dy } = getAbsPos(group);
  x -= dx;
  y -= dy;
  return { x, y };
}

export interface CanvasSlice {
  nodes: Node[];
  edges: Edge[];

  addNode: (type: "CODE" | "GROUP" | "RICH", position: XYPosition, parent: Node) => void;

  onNodesChange: OnNodesChange;

  focusedEditor: string | undefined;
  setFocusedEditor: (id?: string) => void;

  saveCanvas: (nodes: Node[]) => void;

  highlightedNode?: string;
  setHighlightedNode: (nodeID: string) => void;
  removeHighlightedNode: () => void;

  updateView: () => void;

  getGroupAtPos: ({ x, y }: XYPosition, exclude: string) => Node | undefined;

  moveIntoScope: (nodeIds: string[], groupId: Node) => void;

  autoLayout: (group: Node) => void;

  autoLayoutAll: () => void;
}

export interface Notebook {
  metadata: object;
  nbformat: 4;
  nbformat_minor: 0;
  cells: any[];
}

export const createCanvasSlice: StateCreator<MyState, [], [], CanvasSlice> = (set, get) => ({
  nodes: localStorage.getItem("Canvas") ? parseFromLocalStorage(JSON.parse(localStorage.getItem("Canvas")!)) : [],
  edges: [],

  addNode: (type, position, parentNode) => {
    const node = createNewNode(type, position);
    if (parentNode) {
      node.parentNode = parentNode.id;
      node.position = getNodePosInsideGroup(node, parentNode);
    } else {
      node.parentNode = undefined;
    }
    set((state: MyState) => ({
      nodes: [...state.nodes, node],
    }));
  },

  onNodesChange: (changes: NodeChange[]) => {
    set(() => ({
      nodes: applyNodeChanges(changes, get().nodes),
    }));
    get().updateView();
  },

  focusedEditor: undefined,
  setFocusedEditor: (id?: string) => {
    set(() => ({
      focusedEditor: id,
    }));
  },

  saveCanvas: () => {
    const nodes = get().nodes;
    const notebook: Notebook = {
      metadata: {},
      nbformat: 4,
      nbformat_minor: 0,
      cells: [],
    };

    nodes.forEach((node: Node) => {
      let cell;
      if (node.type?.localeCompare("RICH") === 0) {
        cell = {
          cell_type: "markdown",
          metadata: {
            id: node.id,
            position: node.position,
          },
          source: node.data.state,
        };
        notebook.cells.push(cell);
      }
    });

    localStorage.setItem("Canvas", JSON.stringify(notebook));
  },

  setHighlightedNode: (nodeID) => {
    set({ highlightedNode: nodeID });
  },

  removeHighlightedNode: () => {
    set({ highlightedNode: undefined });
  },

  // may need to add group color based on data level
  updateView: () => {
    let nodes = get().nodes;
    nodes = nodes
      .sort((a: Node, b: Node) => a.data.level - b.data.level)
      .map((node: Node) => ({
        ...node,
        className: get().highlightedNode === node.id ? "active-group" : undefined,
      }));

    nodes.forEach((node: Node) => {
      if (node.parentNode) {
        const parentNode = nodes.find((potParent: Node) => potParent.id === node.parentNode);
        node.data.level = parentNode.data.level + 1;
        node.positionAbsolute = {
          x: parentNode.positionAbsolute.x + node.position.x,
          y: parentNode.positionAbsolute.y + node.position.y,
        };
      }
    });
    set({ nodes });
  },

  getGroupAtPos: ({ x, y }, exclude) => {
    const nodes = get().nodes;
    return getGroupAt(x, y, [exclude], nodes);
  },

  moveIntoScope: (nodeIds, group) => {
    // update state
    const nodes = get().nodes;

    nodeIds.forEach((nodeId) => {
      const node = nodes.find((node: Node) => node.id === nodeId);
      if (group === undefined) {
        node.parentNode = undefined;
        node.position = getAbsPos(node);
        node.data.level = 0;
        console.log(`Moving node ${node.id} into group "ROOT"`);
      } else {
        node.parentNode = group.id;
        node.position = getNodePosInsideGroup(node, group);
        node.data.level = group.data.level + 1;
        console.log(`Moving node ${node.id} into group ${group.id}`);
      }
    });

    set({ nodes });
  },

  autoLayout: (group: Node) => {
    // get all children of the group
    const allNodes = get().nodes;
    const groupChildren = allNodes.filter((node: Node) => node.parentNode === group.id);

    if (groupChildren.length === 0) {
      return;
    }
    // get minX, maxX, minY, maxY
    const minX = Math.min(...groupChildren.map((node: Node) => node.position.x));
    const maxX = Math.max(...groupChildren.map((node: Node) => node.position.x + node.width!));
    const minY = Math.min(...groupChildren.map((node: Node) => node.position.y));
    const maxY = Math.max(...groupChildren.map((node: Node) => node.position.y + node.height!));

    // set padding for the group
    const paddingTop = 70;
    const paddingBottom = 50;
    const paddingLeft = 50;
    const paddingRight = 50;

    // adjust node width and height based on above
    let parent = undefined;
    if (group.parentNode) {
      parent = allNodes.find((node: Node) => node.id === group.parentNode);
    }
    const xOffset = paddingLeft - minX;
    const yOffset = paddingTop - minY;
    const newGroup = {
      ...group,
      position: {
        x: group.position.x + minX - paddingLeft,
        y: group.position.y + minY - paddingTop,
      },
      positionAbsolute: parent
        ? {
            x: parent.positionAbsolute.x + group.position.x + minX - paddingLeft,
            y: parent.positionAbsolute.y + group.position.y + minY - paddingTop,
          }
        : {
            x: group.position.x + minX - paddingLeft,
            y: group.position.y + minY - paddingTop,
          },
      width: maxX - minX + paddingLeft + paddingRight,
      height: maxY - minY + paddingTop + paddingBottom,
      style: {
        ...group.style,
        width: maxX - minX + paddingLeft + paddingRight,
        height: maxY - minY + paddingTop + paddingBottom,
      },
    };

    // when position of a parent node gets updated, the positions of all children get updated relative to the parent
    let updatedNodes = allNodes.map((node: Node) => (node.id === group.id ? newGroup : node));
    updatedNodes = updatedNodes.map((node: Node) => {
      if (groupChildren.includes(node)) {
        return { ...node, position: { x: node.position.x + xOffset, y: node.position.y + yOffset } };
      } else {
        return node;
      }
    });
    set({ nodes: updatedNodes });
    if (group.parentNode) {
      get().autoLayout(updatedNodes.find((node: Node) => node.id === group.parentNode));
    }
  },

  autoLayoutAll: () => {
    const nodes = get().nodes;
    nodes.forEach((node: Node) => {
      if (node.type === "GROUP") {
        get().autoLayout(node);
      }
    })
  }
});
