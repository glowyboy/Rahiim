import { AppProvider } from '@/contexts/AppContext';
import { useApp } from '@/contexts/AppContext';
import { AppLayout } from '@/components/AppLayout';
import { LoginPage } from '@/pages/LoginPage';

function AppContent() {
  const { currentUser } = useApp();
  return currentUser ? <AppLayout /> : <LoginPage />;
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
