import { Toaster } from 'sonner';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      }}
    />
  );
};
