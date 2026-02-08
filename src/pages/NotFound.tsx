import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-poker-pattern p-4">
      <div className="glass p-8 rounded-3xl max-w-lg w-full text-center space-y-6 animate-fade-in">
        <h1 className="text-6xl font-bold mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
        <div className="flex justify-center">
          <Button size="lg" className="gap-2" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
