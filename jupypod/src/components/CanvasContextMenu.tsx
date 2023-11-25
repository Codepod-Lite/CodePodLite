import Box from "@mui/material/Box";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import React from "react";
import NoteIcon from "@mui/icons-material/Note";
import PostAddIcon from "@mui/icons-material/PostAdd";

import "./components.css";

const paneMenuStyle = (left, top) => {
  return {
    left: `${left}px`,
    top: `${top}px`,
    zIndex: 100,
    position: "absolute",
    boxShadow: "0px 1px 8px 0px rgba(0, 0, 0, 0.1)",
    // width: '200px',
    backgroundColor: "#fff",
    borderRadius: "5px",
    boxSizing: "border-box",
  } as React.CSSProperties;
};

const ItemStyle = {
  "&:hover": {
    background: "#f1f3f7",
    color: "#4b00ff",
  },
};

export function CanvasContextMenu(props) {
  return (
    <Box sx={paneMenuStyle(props.x, props.y)}>
      <MenuList className="paneContextMenu">
        {
          <MenuItem onClick={props.addRich} sx={ItemStyle}>
            <ListItemIcon sx={{ color: "inherit" }}>
              <NoteIcon className="context-menu-icon" />
            </ListItemIcon>
            <ListItemText className="context-menu-item">New Note</ListItemText>
          </MenuItem>
        }
        {
          <MenuItem onClick={props.addGroup} sx={ItemStyle}>
          <ListItemIcon sx={{ color: "inherit" }}>
            <PostAddIcon />
          </ListItemIcon>
          <ListItemText>New Group</ListItemText>
        </MenuItem>
        }
      </MenuList>
    </Box>
  );
}
