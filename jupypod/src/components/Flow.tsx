import { useState, useCallback, useEffect, useContext } from "react";
import { useBoundStore } from "../lib/store/index.tsx"

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
} from "reactflow";

import RichNode from "./Rich";
import { CanvasContextMenu } from "./CanvasContextMenu";

import Box from "@mui/material/Box";

const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

const fitViewOptions: FitViewOptions = {
  // padding: 0.2,
};

const defaultEdgeOptions = {
  animated: true,
};

const nodeTypes = {
  RICH: RichNode,
};

export default function Flow() {

  const nodes = useBoundStore((state) => state.nodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [points, setPoints] = useState({ x: 0, y: 0 });

  const onPaneContextMenu = (event) => {
    event.preventDefault();
    setShowContextMenu(true);
    setPoints({ x: event.pageX, y: event.pageY });
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

  // const onNodesChange: OnNodesChange = useCallback(
  //   (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
  //   [setNodes]
  // );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect: OnConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), [setEdges]);

  return (
    <Box className="react-flow-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        // onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
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
          // addRich={() => addNode("RICH", project({ x: client.x, y: client.y }), parentNode)}
        />
      )}
    </Box>
  );
}
