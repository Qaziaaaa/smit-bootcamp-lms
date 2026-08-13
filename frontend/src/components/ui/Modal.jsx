import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Typography
} from '@mui/material';
import { X } from 'lucide-react';

export const Modal = ({ 
  open, 
  onClose, 
  title, 
  children, 
  actions, 
  maxWidth = 'sm',
  fullWidth = true,
  hideDividers = false
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: { borderRadius: '12px', pb: actions ? 0 : 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {onClose && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <X size={20} />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent dividers={!hideDividers} sx={{ p: 3, pt: hideDividers ? 1 : 3 }}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions sx={{ p: 2, px: 3, backgroundColor: 'grey.50' }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};
