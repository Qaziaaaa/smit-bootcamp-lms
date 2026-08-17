// Root component — just renders routes + toast notifications.
import AppRoutes from './routes/AppRoutes'
import { ToastProvider } from './components/ui/Toast'

function App() {
  return (
    <>
      <AppRoutes />
      <ToastProvider />   {/* global toast notifications */}
    </>
  )
}

export default App
