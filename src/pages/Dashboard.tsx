import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CaseDetailsModal } from '@/components/CaseDetailsModal';
import { CreateCaseModal } from '@/components/CreateCaseModal';
import { UserBalanceCard } from '@/components/UserBalanceCard';
import { CaseDetailsView } from '@/components/CaseDetailsView';
import { 
  DollarSign, 
  Clock, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Activity,
  Eye,
  RefreshCw,
  Plus
} from 'lucide-react';

type ViewType = 'dashboard' | 'all_cases' | 'pending_cases' | 'in_progress_cases' | 'completed_cases';

export default function Dashboard() {
  const { user, cases, profile, balance, refreshUserData, loading } = useAuth();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Set up real-time subscription for case updates
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for user:', user.id);

    const channel = supabase
      .channel(`dashboard-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time case update received:', payload);
          // Force refresh after a short delay to ensure DB consistency
          setTimeout(() => {
            console.log('Refreshing data after case update');
            refreshUserData();
          }, 500);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'balances',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time balance update received:', payload);
          // Immediately refresh data when balance changes
          refreshUserData();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, refreshUserData]);

  // Manual refresh every 10 seconds when user is active on dashboard
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log('Periodic refresh of user data');
      refreshUserData();
    }, 10000); // 10 seconds for more frequent updates

    return () => clearInterval(interval);
  }, [user, refreshUserData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
      console.log('Dashboard data refreshed');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'complete': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'under_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'complete': return 'Complete';
      case 'resolved': return 'Resolved';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'under_review': return <AlertCircle className="h-5 w-5 text-purple-600" />;
      case 'in_progress': return <Activity className="h-5 w-5 text-blue-600" />;
      default: return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending': return 20;
      case 'in_progress': return 40;
      case 'under_review': return 60;
      case 'approved': return 80;
      case 'complete':
      case 'resolved': return 100;
      default: return 0;
    }
  };

  const totalAmount = cases.reduce((sum, case_) => sum + Number(case_.amount), 0);
  const completedCases = cases.filter(case_ => case_.status === 'complete' || case_.status === 'resolved').length;
  const inProgressCases = cases.filter(case_ => case_.status === 'in_progress').length;
  const pendingCases = cases.filter(case_ => case_.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Render case details view if not on dashboard
  if (currentView !== 'dashboard') {
    const filterMap = {
      'all_cases': 'all',
      'pending_cases': 'pending',
      'in_progress_cases': 'in_progress',
      'completed_cases': 'completed'
    } as const;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <CaseDetailsView 
              filter={filterMap[currentView]} 
              onBack={() => setCurrentView('dashboard')}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {profile?.name || 'User'}!
              </h1>
              <p className="text-xl text-gray-600">Track your recovery cases and progress</p>
            </div>
            
            <div className="flex items-center gap-3">
              <CreateCaseModal />
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Account Balance Section */}
          <div className="mb-8">
            <UserBalanceCard />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card 
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => setCurrentView('all_cases')}
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Cases</p>
                    <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => setCurrentView('pending_cases')}
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Cases</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingCases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => setCurrentView('in_progress_cases')}
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{inProgressCases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => setCurrentView('completed_cases')}
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{completedCases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Cases List */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Recent Cases
                </CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentView('all_cases')}
                  className="flex items-center gap-2"
                >
                  View All Cases
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {cases.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
                  <p className="text-gray-600 mb-6">Create your first recovery case to get started.</p>
                  <CreateCaseModal />
                </div>
              ) : (
                <div className="space-y-4">
                  {cases.slice(0, 3).map((case_) => (
                    <div key={case_.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{case_.title}</h3>
                            <Badge variant="outline" className="font-mono text-xs">
                              {case_.case_number || 'Generating...'}
                            </Badge>
                            <Badge className={`bg-yellow-100 text-yellow-800 border-yellow-200 font-medium`}>
                              {case_.status.charAt(0).toUpperCase() + case_.status.slice(1).replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-gray-600">Amount</p>
                              <p className="text-lg font-semibold text-green-600">${Number(case_.amount).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Created</p>
                              <p className="text-sm font-medium">{new Date(case_.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className="text-sm text-gray-600">{getProgressPercentage(case_.status)}%</span>
                            </div>
                            <Progress value={getProgressPercentage(case_.status)} className="h-2" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <CaseDetailsModal case_={case_}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </CaseDetailsModal>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
