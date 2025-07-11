
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardStats {
  totalCases: number;
  totalAmountLost: number;
  totalAmountRecovered: number;
  resolvedCases: number;
  activeUsers: number;
  pendingCases: number;
  scamTypeData: Array<{ name: string; value: number; color: string }>;
  statusData: Array<{ name: string; value: number; color: string }>;
}

export default function AdminDashboard() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin permissions.",
        variant: "destructive"
      });
      navigate('/admin/login');
      return;
    }

    fetchDashboardData();
  }, [isAdmin, user, navigate, toast]);

  const fetchDashboardData = async () => {
    try {
      // Fetch submissions data
      const { data: submissions } = await supabase
        .from('submissions')
        .select('*');

      // Fetch balances data
      const { data: balances } = await supabase
        .from('balances')
        .select('*');

      // Fetch profiles data
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      if (submissions && balances && profiles) {
        const totalAmountLost = submissions.reduce((sum, sub) => sum + Number(sub.amount_lost), 0);
        const totalAmountRecovered = balances.reduce((sum, bal) => sum + Number(bal.amount_recovered), 0);
        const resolvedCases = submissions.filter(sub => sub.status === 'resolved').length;
        const pendingCases = submissions.filter(sub => sub.status === 'pending').length;
        const activeUsers = profiles.filter(profile => profile.is_active).length;

        // Process scam types data
        const scamTypeCounts: { [key: string]: number } = {};
        submissions.forEach(sub => {
          scamTypeCounts[sub.scam_type] = (scamTypeCounts[sub.scam_type] || 0) + 1;
        });

        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
        const scamTypeData = Object.entries(scamTypeCounts).map(([name, value], index) => ({
          name,
          value,
          color: colors[index % colors.length]
        }));

        // Process status data
        const statusCounts: { [key: string]: number } = {};
        submissions.forEach(sub => {
          statusCounts[sub.status] = (statusCounts[sub.status] || 0) + 1;
        });

        const statusColors: { [key: string]: string } = {
          pending: '#F59E0B',
          'in-progress': '#3B82F6',
          resolved: '#10B981',
          rejected: '#EF4444'
        };

        const statusData = Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value,
          color: statusColors[name] || '#6B7280'
        }));

        setStats({
          totalCases: submissions.length,
          totalAmountLost,
          totalAmountRecovered,
          resolvedCases,
          activeUsers,
          pendingCases,
          scamTypeData,
          statusData
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout title="Dashboard">
        <div className="text-center text-gray-500">Failed to load dashboard data</div>
      </AdminLayout>
    );
  }

  const recoveryRate = stats.totalAmountLost > 0 ? (stats.totalAmountRecovered / stats.totalAmountLost) * 100 : 0;

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingCases} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Lost</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmountLost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total reported losses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Recovered</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmountRecovered.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {recoveryRate.toFixed(1)}% recovery rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scam Types Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cases by Scam Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.scamTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.scamTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cases by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pending Cases</p>
                <p className="text-lg font-bold text-yellow-600">{stats.pendingCases}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Resolved Cases</p>
                <p className="text-lg font-bold text-green-600">{stats.resolvedCases}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Recovery Rate</p>
                <p className="text-lg font-bold text-blue-600">{recoveryRate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-lg font-bold text-purple-600">{stats.activeUsers}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
