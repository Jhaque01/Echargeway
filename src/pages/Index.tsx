import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';

const IndexContent = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <LoginPage />;
};

const Index = () => (
  <AuthProvider>
    <IndexContent />
  </AuthProvider>
);

export default Index;
