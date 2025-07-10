
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminPortal } from '@/components/AdminPortal';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  LogOut,
  Shield,
  Bell,
  Menu,
  X
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  balance: number;
  cases: AdminCase[];
  joinDate: string;
}

interface AdminCase {
  id: string;
  title: string;
  status: string;
  amount: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  submission_id?: string | null;
}

interface AdminNotification {
  id: string;
  type: string;
  message: string;
  created_at: string;
  user_id?: string;
  case_id?: string;
}

export default function AdminDashboard() {
  const { isAdmin, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    } else {
      fetchAdminData();
    }
  }, [isAdmin, navigate]);

  const fetchAdminData = async () => {
    try {
      // Fetch users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all cases
      const { data: casesData } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      // For now, we'll skip notifications until the table is created
      // This will be available after the SQL migration is run
      const notificationsData: AdminNotification[] = [];

      if (profilesData && casesData) {
        // Group cases by user
        const usersWithCases = profilesData.map(profile => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          balance: casesData
            .filter(case_ => case_.user_id === profile.id && case_.status === 'complete')
            .reduce((sum, case_) => sum + Number(case_.amount), 0),
          cases: casesData.filter(case_ => case_.user_id === profile.id),
          joinDate: profile.created_at
        }));

        setUsers(usersWithCases);
        setCases(casesData || []);
        setNotifications(notificationsData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = {
    totalUsers: users.length,
    totalCases: cases.length,
    totalBalance: users.reduce((acc, user) => acc + user.balance, 0),
    activeCases: cases.filter(c => !['complete', 'closed'].includes(c.status)).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-red-500" />
            <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
          </div>
          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <div className="relative">
                <Bell className="h-6 w-6 text-yellow-400" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-10 w-10 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage users and cases</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {notifications.length > 0 && (
                <div className="relative">
                  <Bell className="h-6 w-6 text-yellow-400" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </div>
              )}
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="border-gray-600 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cases</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCases}</p>
                </div>
                <FileText className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Recovered</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">${stats.totalBalance.toLocaleString()}</p>
                </div>
                <DollarSign className="h-12 w-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Cases</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeCases}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Bell className="h-5 w-5 mr-2" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <Bell className="h-4 w-4 text-blue-600 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Portal */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Users className="h-6 w-6 mr-2" />
              User & Case Management Portal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AdminPortal users={users} onRefresh={fetchAdminData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
