import { useState, useCallback, useEffect, useRef, SyntheticEvent } from "react";
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
  useNodesState,
} from "reactflow";

import RichNode from "./Rich.tsx";
import { CanvasContextMenu } from "./CanvasContextMenu.tsx";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

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
  const exportFile = useBoundStore((state) => state.exportFile);
  const importFile = useBoundStore((state) => state.importFile);

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [points, setPoints] = useState({ x: 0, y: 0 });
  const [client, setClient] = useState({ x: 0, y: 0 });
  const [parentNode, setParentNode] = useState("ROOT");

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    importFile(e);
  };

  // const onNodesChange: OnNodesChange = useCallback(
  //   (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
  //   [setNodes]
  // );

  return (
    <Box className="react-flow-container" ref={reactFlowWrapper}>
      <Box sx={{ position: "absolute", left: "10px", top: "10px", zIndex: "1" }}>
        <Button variant="contained" sx={{ mr: 1.5 }} onClick={exportFile}>
          Save
        </Button>
        <Button component="label" variant="contained" color="success">
          Import
          <VisuallyHiddenInput type="file" accept=".json,application/json" onChange={handleFileUpload} />
        </Button>
      </Box>
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
            saveCanvas();
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
