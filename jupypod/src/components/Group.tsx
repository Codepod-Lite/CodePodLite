import {
  memo
} from "react";
import * as React from "react";
import {
  NodeProps,
  useStore as useReactFlowStore,
  NodeResizer,
  NodeResizeControl
} from "reactflow";

import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Grid from "@mui/material/Grid";



export const GroupNode = memo<NodeProps>(function GroupNode({
  data,
  id,
  isConnectable,
  selected,
  xPos,
  yPos,

}){
  return (
    <Box
      // ref={ref}
      sx={{
        width: "100%",
        height: "100%",
        border: "solid 1px #d6dee6",
        borderColor: selected ? "#003c8f" : undefined,
        borderRadius: "4px",
        cursor: "auto",
        // fontSize,
      }}
      // onMouseEnter={() => {
      //   setShowToolbar(true);
      // }}
      // onMouseLeave={() => {
      //   setShowToolbar(false);
      // }}
      className="custom-drag-handle"
    >
      {/* <NodeResizer color="#ff0071" minWidth={100} minHeight={30} />
      <Box sx={{ opacity: 1 }}>
        <NodeResizeControl
          style={{
            background: "transparent",
            border: "none",
          }}
          minWidth={100}
          minHeight={50}
        >
          <ResizeIcon />
        </NodeResizeControl>
      </Box> */}

      {/* <Box
        sx={{
          opacity: showToolbar ? 1 : 0,
          marginLeft: "10px",
          borderRadius: "4px",
          position: "absolute",
          border: "solid 1px #d6dee6",
          right: "25px",
          top: "-60px",
          background: "white",
          zIndex: 250,
          justifyContent: "center",
        }}
      >
        <MyFloatingToolbar id={id} />
      </Box> */}
      {/* <Box
        sx={{
          opacity: showToolbar ? 1 : 0,
        }}
      >
        <Handles
          width={width}
          height={height}
          parent={parent}
          xPos={xPos}
          yPos={yPos}
        />
      </Box> */}
      {/* The header of scope nodes. */}
      <Box
        // bgcolor={"rgb(225,225,225)"}
        sx={{ display: "flex" }}
      >
        {/* {devMode && (
          <Box
            sx={{
              position: "absolute",
              top: "-48px",
              userSelect: "text",
              cursor: "auto",
            }}
          >
            {id} at ({xPos}, {yPos}), w: {width}, h: {height} parent: {parent}{" "}
            level: {data.level} fontSize: {fontSize}
          </Box>
        )} */}
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid item xs={4}>
            {/* <IconButton size="small">
                <CircleIcon sx={{ color: "red" }} fontSize="inherit" />
              </IconButton> */}
          </Grid>
          <Grid item xs={4}>
            <Box
              sx={{
                display: "flex",
                flexGrow: 1,
                justifyContent: "center",
                // fontSize,
              }}
            >
              <InputBase
                className="nodrag"
                defaultValue={data.name || "Group"}
                // onBlur={(e) => {
                //   const name = e.target.value;
                //   if (name === data.name) return;
                //   const node = nodesMap.get(id);
                //   if (node) {
                //     nodesMap.set(id, {
                //       ...node,
                //       data: { ...node.data, name },
                //     });
                //   }
                //   // setPodName({ id, name });
                // }}
                // inputRef={inputRef}
                // disabled={editMode === "view"}
                inputProps={{
                  style: {
                    padding: "0px",
                    textAlign: "center",
                    textOverflow: "ellipsis",
                    // fontSize,
                    // width: width ? width : undefined,
                  },
                }}
              ></InputBase>
            </Box>
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
      </Box>
    </Box>
  );
})