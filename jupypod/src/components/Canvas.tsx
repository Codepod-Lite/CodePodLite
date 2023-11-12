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
  useOnSelectionChange,
} from "reactflow";

import RichNode from "./Rich.tsx";
import { GroupNode } from "./Group.tsx";

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
  GROUP: GroupNode,
};

function Flow() {
  const reactFlowWrapper = useRef<any>(null);
  const reactFlowInstance = useReactFlow();

  const nodes = useBoundStore((state) => state.nodes);
  const addNode = useBoundStore((state) => state.addNode);
  const saveCanvas = useBoundStore((state) => state.saveCanvas);
  const onNodesChange = useBoundStore((state) => state.onNodesChange);
  const getGroupAtPos = useBoundStore((state) => state.getGroupAtPos);
  const setHighlightedNode = useBoundStore((state) => state.setHighlightedNode);
  const removeHighlightedNode = useBoundStore((state) => state.removeHighlightedNode);
  const updateView = useBoundStore((state) => state.updateView);
  const moveIntoScope = useBoundStore((state) => state.moveIntoScope);

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [points, setPoints] = useState({ x: 0, y: 0 });
  const [client, setClient] = useState({ x: 0, y: 0 });
  const [parentNode, setParentNode] = useState("ROOT");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      if (nodes.length > 0) {
        setSelectedNode(nodes[0]);
      } else {
        setSelectedNode(null);
      }
    },
  });

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
        onNodeDrag={(event, node) => {
          const mousePos = project({ x: event.clientX, y: event.clientY });
          const group = getGroupAtPos(mousePos, node.id);
          if (group) {
            setHighlightedNode(group.id);
          } else {
            removeHighlightedNode();
          }
        }}
        onNodeDragStop={(event, node) => {
          const mousePos = project({ x: event.clientX, y: event.clientY });
          const group = getGroupAtPos(mousePos, node.id);
          const nodeIds = [selectedNode!.id];
          if (group === undefined) {
            if (selectedNode!.data.parent != "ROOT") {
              moveIntoScope(nodeIds, "ROOT", -1);
            }
          } else if (group && selectedNode!.data.parent != group.id) {
            moveIntoScope(nodeIds, group.id, group.data.level);
          }
          removeHighlightedNode();
          updateView();
        }}
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
          addGroup={() => {
            addNode("GROUP", project({ x: client.x, y: client.y }), parentNode);
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
