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

export interface CanvasSlice {
  nodes: Node[];
  edges: Edge[];

  addNode: (
    type: "CODE" | "GROUP" | "RICH",
    position: XYPosition
    // parent: string
  ) => void;

  onNodesChange: OnNodesChange;

  focusedEditor: string | undefined;
  setFocusedEditor: (id?: string) => void;

  saveCanvas: (nodes: Node[]) => void;
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

  addNode: (type, position, parent = "ROOT") => {
    const node = createNewNode(type, position);
    set((state: MyState) => ({
      nodes: [
        ...state.nodes,
        node,
      ],
    }));
  },

  onNodesChange: (changes: NodeChange[]) => {
    const newNodes = applyNodeChanges(changes, get().nodes);
    set(() => ({
      nodes: newNodes,
    }));
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
});
