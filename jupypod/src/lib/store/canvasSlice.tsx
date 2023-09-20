import { StateCreator } from "zustand";

import { myNanoId } from "../utils";

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

export const newNodeShapeConfig = {
  width: 250,
  // NOTE for import ipynb: we need to specify some reasonable height so that
  // the imported pods can be properly laid-out. 130 is a good one.
  // This number is also used in Canvas.tsx (refer to "A BIG HACK" in Canvas.tsx).
  height: 100,
};

function createNewNode(type: "SCOPE" | "CODE" | "RICH", position): Node {
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
    },
    dragHandle: ".custom-drag-handle",
  };
  return newNode;
}

export interface CanvasSlice {
  nodes: Node[];
  edges: Edge[];

  addNode: (
    type: "CODE" | "SCOPE" | "RICH",
    position: XYPosition
    // parent: string
  ) => void;

  onNodesChange: OnNodesChange;
}

export const createCanvasSlice: StateCreator<MyState, [], [], CanvasSlice> = (set, get) => ({
  nodes: [
    { id: "1", type: "RICH", data: {}, position: { x: -50, y: 250 }, dragHandle: ".custom-drag-handle" },
    { id: "2", type: "RICH", data: {}, position: { x: -50, y: 100 }, dragHandle: ".custom-drag-handle" },
    { id: "3", type: "RICH", data: {}, position: { x: 250, y: 100 }, dragHandle: ".custom-drag-handle" },
  ],
  edges: [],

  addNode: (type, position, parent = "ROOT") => {
    const node = createNewNode(type, position);
    set((state) => ({
      nodes: [...state.nodes, { id: node.id, type: "RICH", data: node.data, position: node.position, dragHandle: node.dragHandle }],
    }));
  },

  onNodesChange: (changes: NodeChange[]) => {
    const newNodes = applyNodeChanges(changes, get().nodes);
    set(() => ({
      nodes: newNodes,
    }))
  }
});
