
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Settings,
  LogOut,
  Edit,
  Trash2,
  Shield,
  Mail,
  Bell,
  Save
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
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [editingCase, setEditingCase] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

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
        setNotifications(notificationsData || []);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const updateCaseStatus = async (caseId: string, newStatus: string, newAmount?: number) => {
    try {
      const updateData: any = { status: newStatus };
      if (newAmount !== undefined) {
        updateData.amount = newAmount;
      }

      const { error } = await supabase
        .from('cases')
        .update(updateData)
        .eq('id', caseId);

      if (error) throw error;

      // Call the edge function to update case status and send notifications
      await supabase.functions.invoke('case-status-updater', {
        body: {
          caseId,
          newStatus,
          recoveredAmount: newAmount,
          notes: `Status updated to ${newStatus} by admin`
        }
      });

      await fetchAdminData();
      setEditingCase(null);
      
      toast({
        title: "Case Updated",
        description: `Case status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update case status",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await fetchAdminData();
      toast({
        title: "User Deleted",
        description: "User account has been permanently deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const sendNotificationEmail = async (type: string, userEmail: string, message: string) => {
    try {
      await supabase.functions.invoke('send-admin-notification', {
        body: {
          type,
          email: userEmail,
          message
        }
      });
    } catch (error) {
      console.error('Failed to send notification email:', error);
    }
  };

  const stats = {
    totalUsers: users.length,
    totalCases: cases.length,
    totalBalance: users.reduce((acc, user) => acc + user.balance, 0),
    activeCases: cases.filter(c => !['complete', 'closed'].includes(c.status)).length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'complete': return 'bg-emerald-100 text-emerald-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'under_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'complete': return 'Complete';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
              <Button onClick={handleLogout} variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card>
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

            <Card>
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

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Recovered</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.totalBalance.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
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
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Mail className="h-4 w-4 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
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

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Settings className="h-6 w-6 mr-2" />
                User & Case Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-6 bg-white shadow-sm">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                        <p className="text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">Member since: {new Date(user.joinDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* User Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">Total Recovered</span>
                          <span className="text-2xl font-bold text-green-600">
                            ${user.balance.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">Total Cases</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {user.cases.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cases Management */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Cases</h4>
                      <div className="space-y-3">
                        {user.cases.map((case_) => (
                          <div key={case_.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{case_.title}</p>
                                <p className="text-sm text-gray-600">
                                  Created: {new Date(case_.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className={getStatusColor(case_.status)}>
                                {getStatusLabel(case_.status)}
                              </Badge>
                            </div>
                            
                            {editingCase === case_.id ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input
                                  type="number"
                                  placeholder="Amount"
                                  defaultValue={case_.amount}
                                  id={`amount-${case_.id}`}
                                />
                                <Select
                                  defaultValue={case_.status}
                                  onValueChange={(value) => {
                                    const amountInput = document.getElementById(`amount-${case_.id}`) as HTMLInputElement;
                                    const newAmount = parseFloat(amountInput.value) || case_.amount;
                                    updateCaseStatus(case_.id, value, newAmount);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="under_review">Under Review</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="complete">Complete</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  onClick={() => setEditingCase(null)}
                                  variant="outline"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-gray-900">
                                  ${Number(case_.amount).toLocaleString()}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => setEditingCase(case_.id)}
                                  variant="outline"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
