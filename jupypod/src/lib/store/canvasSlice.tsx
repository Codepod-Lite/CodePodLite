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
      !excludes.includes(node.id) &&
      x <= x1 + node.width! &&
      y >= y1 &&
      y <= y1 + node.height!
    );
  });
  return group;
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

  addNode: (
    type: "CODE" | "GROUP" | "RICH",
    position: XYPosition,
    parent: Node
  ) => void;

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

    set({ nodes });
  },

  getGroupAtPos: ({ x, y }, exclude) => {
    const nodes = get().nodes;
    return getGroupAt(x, y, [exclude], nodes);
  },

  moveIntoScope: (nodeIds, group) => {
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
        node.data.level = group.data.level+1;
        console.log(`Moving node ${node.id} into group ${group.id}`);
      }
    });
  },
});
