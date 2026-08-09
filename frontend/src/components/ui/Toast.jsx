import { Toaster } from 'sonner';

export const ToastProvider = () => {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: '#ffffff',
          color: '#1a1a1a',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      }}
    />
  );
};
