import AppRoutes from './routes/AppRoutes'
import { ToastProvider } from './components/ui/Toast'

function App() {
  return (
    <>
      <AppRoutes />
      <ToastProvider />
    </>
  )
}

export default App
