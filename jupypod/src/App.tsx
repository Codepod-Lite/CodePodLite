import Flow from "./components/Flow";
import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';


import "./App.css";

export default function App() {
  return (
    <div className="App">
      <ReactFlow>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

