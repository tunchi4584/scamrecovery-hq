import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CreateCaseModal } from '@/components/CreateCaseModal';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CaseDetailsModal } from '@/components/CaseDetailsModal';


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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/50">
      <Header />
      
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                Welcome back, {profile?.name || 'User'}!
              </h1>
              <p className="text-xl text-muted-foreground font-medium">Track your recovery cases and progress</p>
            </div>
            
            <div className="flex items-center gap-4">
              <CreateCaseModal onCaseCreated={handleRefresh} />
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                variant="outline"
                className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <RefreshCw className={`h-4 w-4 transition-transform duration-300 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Available Balance Section */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50"></div>
              <CardContent className="relative p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl shadow-lg">
                      <DollarSign className="h-10 w-10 text-primary" />
                    </div>
                    <div className="ml-6">
                      <p className="text-sm font-semibold text-primary/70 uppercase tracking-wider">Available Balance</p>
                       <p className="text-4xl font-bold text-primary mt-1">
                         ${balance?.amount_recovered ? Number(balance.amount_recovered).toLocaleString() : '0'}
                       </p>
                       <p className="text-sm text-muted-foreground mt-2">Amount recovered (set by admin)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Balance Section */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <UserBalanceCard />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card 
              className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border-0 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
              onClick={() => setCurrentView('all_cases')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-8">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Cases</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{cases.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border-0 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
              onClick={() => setCurrentView('pending_cases')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-8">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending Cases</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{pendingCases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border-0 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fade-in"
              style={{ animationDelay: '0.5s' }}
              onClick={() => setCurrentView('in_progress_cases')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-8">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">In Progress</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{inProgressCases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border-0 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fade-in"
              style={{ animationDelay: '0.6s' }}
              onClick={() => setCurrentView('completed_cases')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-8">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Completed</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{completedCases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Cases List */}
          <Card className="bg-gradient-to-br from-card via-card to-muted/10 border-0 shadow-2xl animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <CardHeader className="pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg">
                    <FileText className="h-7 w-7 text-primary" />
                  </div>
                  Recent Cases
                </CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentView('all_cases')}
                  className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
                  <CreateCaseModal onCaseCreated={handleRefresh} />
                </div>
              ) : (
                <div className="space-y-6">
                  {cases.slice(0, 3).map((case_, index) => (
                    <div 
                      key={case_.id} 
                      className="group relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 border border-primary/10 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-fade-in"
                      style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            {getStatusIcon(case_.status)}
                            <h3 className="text-xl font-bold text-foreground">{case_.title}</h3>
                            <Badge variant="outline" className="font-mono text-xs bg-muted/50">
                              {case_.case_number || 'Generating...'}
                            </Badge>
                            <Badge className={`${getStatusColor(case_.status)} font-semibold`}>
                              {getStatusLabel(case_.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-xl">
                              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Amount</p>
                              <p className="text-2xl font-bold text-primary">${Number(case_.amount).toLocaleString()}</p>
                            </div>
                            <div className="bg-gradient-to-br from-muted/20 to-muted/30 p-4 rounded-xl">
                              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Created</p>
                              <p className="text-lg font-semibold text-foreground">{new Date(case_.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-6">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-bold text-foreground uppercase tracking-wider">Progress</span>
                              <span className="text-lg font-bold text-primary">{getProgressPercentage(case_.status)}%</span>
                            </div>
                            <Progress value={getProgressPercentage(case_.status)} className="h-3 bg-muted/30" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <CaseDetailsModal case_={case_}>
                            <Button variant="outline" size="lg" className="flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-primary/5 to-primary/10">
                              <Eye className="h-5 w-5" />
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
