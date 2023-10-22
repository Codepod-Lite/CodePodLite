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
