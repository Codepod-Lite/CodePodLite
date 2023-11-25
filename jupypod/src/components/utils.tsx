import { useState } from "react";
import React from "react";

import Button from "@mui/material/Button";
import { Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";


// A delete button that requires confirmation.
// Have to use React.forwardRef to allows <Tooltip> over this component. Ref:
// https://mui.com/material-ui/guides/composition/#caveat-with-refs
export const ConfirmDeleteButton = React.forwardRef(({ handleConfirm, ...props }: any, ref) => {
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <IconButton
        onClick={() => {
          setOpen(true);
        }}
        {...props}
      >
        <DeleteIcon fontSize="inherit" />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        fullWidth
      >
        <DialogTitle>{`Please confirm deletion`}</DialogTitle>
        <DialogContent>Are you sure?</DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleConfirm();
              setOpen(false);
            }}
            autoFocus
            color="error"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export function ResizeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="#ff0071"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: "absolute", right: 5, bottom: 5 }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <polyline points="16 20 20 20 20 16" />
      <line x1="14" y1="14" x2="20" y2="20" />
      <polyline points="8 4 4 4 4 8" />
      <line x1="4" y1="4" x2="10" y2="10" />
    </svg>
  );
}
