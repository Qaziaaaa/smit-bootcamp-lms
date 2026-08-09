import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

export const ConfirmDialog = ({ 
  open, 
  title = "Are you sure?", 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "error",
  loading = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{ sx: { borderRadius: '12px', minWidth: '320px' } }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onCancel} color="inherit" disabled={loading}>
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          color={confirmColor} 
          variant="contained" 
          disabled={loading}
          disableElevation
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
