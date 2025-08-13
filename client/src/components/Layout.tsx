import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Dumbbell, 
  Apple, 
  Brain, 
  Coffee, 
  Activity, 
  CreditCard, 
  User,
  Settings
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  React.useEffect(() => {
    // Role-based redirects after login
    if (user && location.pathname === '/login') {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, location.pathname, navigate]);

  const isActive = (path: string) => location.pathname === path;
  
  // Check if user can access a specific feature
  const canAccessFeature = (feature: string) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    switch (feature) {
      case 'training':
        return user.features?.training || false;
      case 'nutrition':
        return user.features?.nutrition || false;
      case 'meditation':
        return user.features?.meditation || false;
      case 'active_breaks':
        return user.features?.active_breaks || false;
      default:
        return true;
    }
  };

  // Navigation items configuration
  const getNavigationItems = () => {
    const items = [];
    
    // Dashboard - always available for logged-in users
    if (user) {
      items.push({
        path: '/dashboard',
        label: 'Dashboard',
        icon: Home,
        available: true
      });
    }

    // Training - show if user has training features or is admin
    if (user && (canAccessFeature('training') || user.role === 'admin')) {
      items.push({
        path: '/training',
        label: 'Training',
        icon: Dumbbell,
        available: canAccessFeature('training')
      });
    }

    // Nutrition - show if user has nutrition features or is admin
    if (user && (canAccessFeature('nutrition') || user.role === 'admin')) {
      items.push({
        path: '/nutrition',
        label: 'Nutrition',
        icon: Apple,
        available: canAccessFeature('nutrition')
      });
    }

    // Meditation - show if user has meditation features or is admin
    if (user && (canAccessFeature('meditation') || user.role === 'admin')) {
      items.push({
        path: '/meditation',
        label: 'Meditation',
        icon: Brain,
        available: canAccessFeature('meditation')
      });
    }

    // Active Breaks - show if user has active_breaks features or is admin
    if (user && (canAccessFeature('active_breaks') || user.role === 'admin')) {
      items.push({
        path: '/active-breaks',
        label: 'Breaks',
        icon: Coffee,
        available: canAccessFeature('active_breaks')
      });
    }

    // Exercises - show if user has training features or is admin  
    if (user && (canAccessFeature('training') || user.role === 'admin')) {
      items.push({
        path: '/exercises',
        label: 'Exercises',
        icon: Activity,
        available: canAccessFeature('training')
      });
    }

    // Plans - always available
    items.push({
      path: '/plans',
      label: 'Plans',
      icon: CreditCard,
      available: true
    });

    // Profile - always available for logged-in users
    if (user && user.role !== 'admin') {
      items.push({
        path: '/profile',
        label: 'Profile',
        icon: User,
        available: true
      });
    }

    // Admin Panel - only for admins
    if (user && user.role === 'admin') {
      items.push({
        path: '/admin',
        label: 'Admin',
        icon: Settings,
        available: true
      });
    }

    return items;
  };

  const navigationItems = getNavigationItems();
  
  // Don't show navigation on dashboard for users
  const showFullNav = !user || user.role === 'admin' || !location.pathname.startsWith('/dashboard');
  
  if (user && user.role === 'user' && location.pathname === '/dashboard') {
    // Minimal header for dashboard with bottom navigation
    return (
      <div className="min-h-screen">
        <nav className="bg-black border-b border-gray-800 px-4 py-2">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Link to="/" className="text-xl font-bold text-[#D3B869]">
              Outdoor Team
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                {user.full_name.split(' ')[0]}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-[#D3B869] text-[#D3B869] hover:bg-[#D3B869] hover:text-black"
              >
                Salir
              </Button>
            </div>
          </div>
        </nav>
        <main className="pb-20">
          {children}
        </main>
        
        {/* Bottom Navigation for logged-in users */}
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-1 py-2 z-50">
          <div className="grid grid-cols-4 gap-0.5 max-w-md mx-auto">
            {navigationItems.slice(0, 8).map((item) => (
              <Link 
                key={item.path}
                to={item.available ? item.path : '#'} 
                className={`flex flex-col items-center space-y-1 px-1 py-1 rounded-lg transition-colors ${
                  isActive(item.path) 
                    ? 'text-[#D3B869]' 
                    : item.available 
                      ? 'text-gray-400 hover:text-[#D3B869]' 
                      : 'text-gray-600 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  if (!item.available) {
                    e.preventDefault();
                  }
                }}
              >
                <item.icon size={16} />
                <span className="text-xs">{item.label}</span>
                {!item.available && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // For other logged-in users (non-dashboard pages) or admin users
  if (user && user.role === 'user') {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-xl font-bold text-brand-black">
                Outdoor Team
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                {navigationItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.available ? item.path : '#'} 
                    className={`hover:text-brand-gold transition-colors ${
                      isActive(item.path) 
                        ? 'text-brand-gold font-medium' 
                        : item.available 
                          ? 'text-brand-black' 
                          : 'text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      if (!item.available) {
                        e.preventDefault();
                        alert('Esta funcionalidad no está disponible en tu plan actual');
                      }
                    }}
                  >
                    {item.label}
                    {!item.available && <span className="text-red-500 ml-1">🔒</span>}
                  </Link>
                ))}
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Hola, {user.full_name.split(' ')[0]}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="border-brand-gold text-brand-black hover:bg-brand-gold hover:text-brand-black"
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {user.full_name.split(' ')[0]}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="border-brand-gold text-brand-black hover:bg-brand-gold hover:text-brand-black"
                  >
                    Salir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>

        {/* Bottom Navigation for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-1 py-2 z-50">
          <div className="grid grid-cols-4 gap-0.5">
            {navigationItems.slice(0, 8).map((item) => (
              <Link 
                key={item.path}
                to={item.available ? item.path : '#'} 
                className={`flex flex-col items-center space-y-1 px-1 py-2 rounded-lg transition-colors relative ${
                  isActive(item.path) 
                    ? 'text-brand-gold bg-brand-gold/10' 
                    : item.available 
                      ? 'text-brand-black hover:text-brand-gold' 
                      : 'text-gray-400 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  if (!item.available) {
                    e.preventDefault();
                    alert('Esta funcionalidad no está disponible en tu plan actual');
                  }
                }}
              >
                <item.icon size={16} />
                <span className="text-xs">{item.label}</span>
                {!item.available && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default layout for non-logged in users and admins
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-brand-black">
              Outdoor Team
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className={`hover:text-brand-gold transition-colors ${
                  isActive('/') ? 'text-brand-gold font-medium' : 'text-brand-black'
                }`}
              >
                Inicio
              </Link>
              
              <Link 
                to="/planes" 
                className={`hover:text-brand-gold transition-colors ${
                  isActive('/planes') ? 'text-brand-gold font-medium' : 'text-brand-black'
                }`}
              >
                Planes
              </Link>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  {user.role === 'admin' ? (
                    <Link 
                      to="/admin" 
                      className={`hover:text-brand-gold transition-colors ${
                        isActive('/admin') ? 'text-brand-gold font-medium' : 'text-brand-black'
                      }`}
                    >
                      Panel Admin
                    </Link>
                  ) : (
                    <Link 
                      to="/dashboard" 
                      className={`hover:text-brand-gold transition-colors ${
                        isActive('/dashboard') ? 'text-brand-gold font-medium' : 'text-brand-black'
                      }`}
                    >
                      Mi Panel
                    </Link>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Hola, {user.full_name.split(' ')[0]}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="border-brand-gold text-brand-black hover:bg-brand-gold hover:text-brand-black"
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-brand-gold text-brand-black hover:bg-brand-gold hover:text-brand-black"
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button 
                      size="sm"
                      className="bg-brand-gold hover:bg-brand-gold/90 text-brand-black"
                    >
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {user.full_name.split(' ')[0]}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="border-brand-gold text-brand-black hover:bg-brand-gold hover:text-brand-black"
                  >
                    Salir
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <Link to="/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-brand-gold text-brand-black">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;