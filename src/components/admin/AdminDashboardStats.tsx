
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Activity,
  UserCheck,
  Clock,
  CheckCircle
} from 'lucide-react';

interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  totalCases: number;
  pendingCases: number;
  inProgressCases: number;
  completedCases: number;
  totalAmountLost: number;
  totalAmountRecovered: number;
}

export function AdminDashboardStats() {
  const [data, setData] = useState<DashboardData>({
    totalUsers: 0,
    activeUsers: 0,
    totalCases: 0,
    pendingCases: 0,
    inProgressCases: 0,
    completedCases: 0,
    totalAmountLost: 0,
    totalAmountRecovered: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user statistics
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('is_active');

      if (profilesError) throw profilesError;

      const totalUsers = profiles?.length || 0;
      const activeUsers = profiles?.filter(p => p.is_active).length || 0;

      // Fetch case statistics
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('status, amount');

      if (casesError) throw casesError;

      const totalCases = cases?.length || 0;
      const pendingCases = cases?.filter(c => c.status === 'pending').length || 0;
      const inProgressCases = cases?.filter(c => c.status === 'in_progress').length || 0;
      const completedCases = cases?.filter(c => ['complete', 'resolved'].includes(c.status)).length || 0;

      // Calculate amounts
      const totalAmountLost = cases?.reduce((sum, case_) => sum + Number(case_.amount || 0), 0) || 0;

      // Fetch recovery amounts from balances
      const { data: balances, error: balancesError } = await supabase
        .from('balances')
        .select('amount_recovered');

      if (balancesError) throw balancesError;

      const totalAmountRecovered = balances?.reduce((sum, balance) => sum + Number(balance.amount_recovered || 0), 0) || 0;

      setData({
        totalUsers,
        activeUsers,
        totalCases,
        pendingCases,
        inProgressCases,
        completedCases,
        totalAmountLost,
        totalAmountRecovered
      });
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Users */}
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate('/admin/user-accounts')}
      >
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate('/admin/user-accounts')}
      >
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{data.activeUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Cases */}
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate('/admin/user-accounts')}
      >
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalCases}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Cases */}
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate('/admin/user-accounts')}
      >
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Cases</p>
              <p className="text-2xl font-bold text-gray-900">{data.pendingCases}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* In Progress Cases */}
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate('/admin/user-accounts')}
      >
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Activity className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{data.inProgressCases}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Cases */}
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate('/admin/user-accounts')}
      >
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{data.completedCases}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Amount Lost */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Amount Lost</p>
              <p className="text-2xl font-bold text-gray-900">${data.totalAmountLost.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Amount Recovered */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Amount Recovered</p>
              <p className="text-2xl font-bold text-gray-900">${data.totalAmountRecovered.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
