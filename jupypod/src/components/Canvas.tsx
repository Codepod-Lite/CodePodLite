import { useState, useCallback, useEffect, useRef } from "react";
import { useBoundStore } from "../lib/store/index.tsx";

import ReactFlow, {
  addEdge,
  FitViewOptions,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  useNodesState
} from "reactflow";

import RichNode from "./Rich.tsx";
import { CanvasContextMenu } from "./CanvasContextMenu.tsx";

import Box from "@mui/material/Box";


const fitViewOptions: FitViewOptions = {
  // padding: 0.2,
};

const defaultEdgeOptions = {
  animated: true,
};

const nodeTypes = {
  RICH: RichNode,
};

function Flow() {
  const reactFlowWrapper = useRef<any>(null);
  const reactFlowInstance = useReactFlow();

  const nodes = useBoundStore((state) => state.nodes);
  const addNode = useBoundStore((state) => state.addNode);
  const saveCanvas = useBoundStore((state) => state.saveCanvas);
  const onNodesChange = useBoundStore((state) => state.onNodesChange);

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [points, setPoints] = useState({ x: 0, y: 0 });
  const [client, setClient] = useState({ x: 0, y: 0 });
  const [parentNode, setParentNode] = useState("ROOT");

  const onPaneContextMenu = (event) => {
    event.preventDefault();
    setShowContextMenu(true);
    setPoints({ x: event.pageX, y: event.pageY });
    setClient({ x: event.clientX, y: event.clientY });
  };

  useEffect(() => {
    const handleClick = (event) => {
      setShowContextMenu(false);
    };
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [setShowContextMenu]);

  const project = useCallback(
    ({ x, y }) => {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      return reactFlowInstance.project({
        x: x - reactFlowBounds.left,
        y: y - reactFlowBounds.top,
      });
    },
    [reactFlowInstance]
  );

  // const onNodesChange: OnNodesChange = useCallback(
  //   (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
  //   [setNodes]
  // );

  return (
    <Box className="react-flow-container" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        onPaneContextMenu={onPaneContextMenu}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      {showContextMenu && (
        <CanvasContextMenu
          x={points.x}
          y={points.y}
          addRich={() => {
            addNode("RICH", project({ x: client.x, y: client.y }), parentNode);
          }}
        />
      )}
    </Box>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
