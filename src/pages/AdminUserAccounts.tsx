import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { 
  Search, 
  Edit, 
  DollarSign, 
  FileText, 
  User,
  Mail,
  Calendar,
  Save,
  X
} from 'lucide-react';
import { CaseSearchModal } from '@/components/admin/CaseSearchModal';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface UserBalance {
  id: string;
  amount_lost: number;
  amount_recovered: number;
  recovery_notes: string | null;
}

interface UserCase {
  id: string;
  title: string;
  amount: number;
  amount_recovered: number;
  recovery_notes: string | null;
  status: string;
  created_at: string;
}

interface UserAccount {
  profile: UserProfile;
  balance: UserBalance | null;
  cases: UserCase[];
}

export default function AdminUserAccounts() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    case_status: '',
    case_id: ''
  });
  const [caseRecoveries, setCaseRecoveries] = useState<Record<string, { amount_recovered: string; recovery_notes: string }>>({});

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchUserAccounts();
  }, [user, isAdmin, navigate]);

  const fetchUserAccounts = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch balances
      const { data: balances, error: balancesError } = await supabase
        .from('balances')
        .select('*');

      if (balancesError) throw balancesError;

      // Fetch cases with recovery amounts
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('*, amount_recovered, recovery_notes')
        .order('created_at', { ascending: false });

      if (casesError) throw casesError;

      // Combine data
      const userAccountsData: UserAccount[] = profiles?.map(profile => ({
        profile,
        balance: balances?.find(b => b.user_id === profile.id) || null,
        cases: cases?.filter(c => c.user_id === profile.id) || []
      })) || [];

      setUserAccounts(userAccountsData);
    } catch (error) {
      console.error('Error fetching user accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user accounts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCaseRecovery = async (caseId: string, amountRecovered: number, recoveryNotes: string) => {
    try {
      console.log('Admin updating case recovery:', { caseId, amountRecovered, recoveryNotes });
      
      // Verify admin status first
      const { data: roleCheck, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleCheck) {
        console.error('Admin role verification failed:', roleError);
        throw new Error('Admin privileges required');
      }

      console.log('Admin role verified, updating case recovery');

      const { error } = await supabase
        .from('cases')
        .update({
          amount_recovered: amountRecovered,
          recovery_notes: recoveryNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) {
        console.error('Case recovery update error:', error);
        throw error;
      }

      console.log('Case recovery updated successfully');

      toast({
        title: "Success",
        description: "Case recovery amount updated successfully",
      });

      fetchUserAccounts();
    } catch (error: any) {
      console.error('Error updating case recovery:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update case recovery",
        variant: "destructive"
      });
    }
  };

  const updateCaseStatus = async (caseId: string, status: string) => {
    try {
      console.log('Admin updating case status:', { caseId, status });
      console.log('Current admin user:', user?.id, 'isAdmin:', isAdmin);
      
      // Verify admin status first
      const { data: roleCheck, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleCheck) {
        console.error('Admin role verification failed:', roleError);
        throw new Error('Admin privileges required');
      }

      console.log('Admin role verified, updating case status');

      const { error } = await supabase
        .from('cases')
        .update({ 
          status,
          last_updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) {
        console.error('Case status update error:', error);
        throw error;
      }

      console.log('Case status updated successfully');

      toast({
        title: "Success",
        description: "Case status updated successfully",
      });

      fetchUserAccounts();
    } catch (error: any) {
      console.error('Error updating case status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update case status",
        variant: "destructive"
      });
    }
  };

  const toggleUserActive = async (userId: string, isActive: boolean) => {
    try {
      console.log('Admin toggling user active status:', { userId, isActive });
      console.log('Current admin user:', user?.id, 'isAdmin:', isAdmin);
      
      // Verify admin status first
      const { data: roleCheck, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleCheck) {
        console.error('Admin role verification failed:', roleError);
        throw new Error('Admin privileges required');
      }

      console.log('Admin role verified, toggling user status');

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('User status update error:', error);
        throw error;
      }

      console.log('User status updated successfully');

      toast({
        title: "Success",
        description: `User ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });

      fetchUserAccounts();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!editingUser) return;

    let hasUpdates = false;

    // Update individual case recovery amounts
    for (const [caseId, recovery] of Object.entries(caseRecoveries)) {
      const currentCase = editingUser.cases.find(c => c.id === caseId);
      if (currentCase) {
        const newAmount = parseFloat(recovery.amount_recovered) || 0;
        const newNotes = recovery.recovery_notes || '';
        
        if (newAmount !== currentCase.amount_recovered || newNotes !== (currentCase.recovery_notes || '')) {
          await updateCaseRecovery(caseId, newAmount, newNotes);
          hasUpdates = true;
        }
      }
    }

    if (editForm.case_status && editForm.case_id) {
      await updateCaseStatus(editForm.case_id, editForm.case_status);
      hasUpdates = true;
    }

    if (hasUpdates) {
      // Trigger balance recalculation for the user
      if (editingUser.profile.id) {
        await supabase.rpc('update_user_balance_stats', { p_user_id: editingUser.profile.id });
      }
      
      setIsDialogOpen(false);
      setEditingUser(null);
      setEditForm({
        case_status: '',
        case_id: ''
      });
      setCaseRecoveries({});
    }
  };

  const startEditing = (userAccount: UserAccount) => {
    setEditingUser(userAccount);
    setEditForm({
      case_status: '',
      case_id: ''
    });
    
    // Initialize case recovery amounts from current case data
    const initialRecoveries: Record<string, { amount_recovered: string; recovery_notes: string }> = {};
    userAccount.cases.forEach(caseItem => {
      initialRecoveries[caseItem.id] = {
        amount_recovered: caseItem.amount_recovered?.toString() || '0',
        recovery_notes: caseItem.recovery_notes || ''
      };
    });
    setCaseRecoveries(initialRecoveries);
  };

  const filteredAccounts = userAccounts.filter(account =>
    account.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.profile.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'complete': return 'bg-emerald-100 text-emerald-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="User Account Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Account Management">
      {/* Search Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <CaseSearchModal />
      </div>

      {/* User Accounts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAccounts.map((userAccount) => (
          <Card key={userAccount.profile.id} className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {userAccount.profile.name}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <Mail className="h-4 w-4" />
                    {userAccount.profile.email}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <Calendar className="h-4 w-4" />
                    Joined: {new Date(userAccount.profile.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant={userAccount.profile.is_active ? "default" : "secondary"}>
                    {userAccount.profile.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleUserActive(userAccount.profile.id, userAccount.profile.is_active)}
                  >
                    {userAccount.profile.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Balance Section */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Balance Information
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Amount Lost</div>
                    <div className="text-lg font-bold text-red-600">
                      ${userAccount.balance?.amount_lost?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Amount Recovered</div>
                    <div className="text-lg font-bold text-green-600">
                      ${userAccount.balance?.amount_recovered?.toLocaleString() || '0'}
                    </div>
                  </div>
                </div>
                {userAccount.balance?.recovery_notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Recovery Notes</div>
                    <div className="text-sm">{userAccount.balance.recovery_notes}</div>
                  </div>
                )}
              </div>

              {/* Cases Section */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Cases ({userAccount.cases.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {userAccount.cases.length === 0 ? (
                    <div className="text-sm text-gray-500 italic">No cases found</div>
                  ) : (
                    userAccount.cases.map((caseItem) => (
                      <div key={caseItem.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-sm">{caseItem.title}</div>
                          <Badge className={getStatusColor(caseItem.status)}>
                            {caseItem.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>${caseItem.amount?.toLocaleString() || '0'}</span>
                          <span>{new Date(caseItem.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      startEditing(userAccount);
                      setIsDialogOpen(true);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Manage Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Manage User Account - Individual Case Recovery</DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                      <div className="space-y-6">
                        {/* Case Recovery Section */}
                        {editingUser.cases.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium mb-4">
                              Individual Case Recovery Amounts
                              <span className="text-xs text-green-600 block font-medium">✓ Update recovery amounts per case - totals will be calculated automatically</span>
                            </label>
                            <div className="space-y-4">
                              {editingUser.cases.map((caseItem) => (
                                <Card key={caseItem.id} className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-medium text-sm">{caseItem.title}</h4>
                                        <p className="text-xs text-gray-600">Case Amount: ${Number(caseItem.amount).toLocaleString()}</p>
                                        <Badge className={getStatusColor(caseItem.status)}>
                                          {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1).replace('_', ' ')}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium mb-1">Amount Recovered ($)</label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          max={caseItem.amount}
                                          value={caseRecoveries[caseItem.id]?.amount_recovered || '0'}
                                          onChange={(e) => setCaseRecoveries(prev => ({
                                            ...prev,
                                            [caseItem.id]: {
                                              ...prev[caseItem.id],
                                              amount_recovered: e.target.value
                                            }
                                          }))}
                                          placeholder="0.00"
                                          className="text-sm"
                                        />
                                      </div>
                                      
                                      <div>
                                        <label className="block text-xs font-medium mb-1">Recovery Notes</label>
                                        <Input
                                          type="text"
                                          value={caseRecoveries[caseItem.id]?.recovery_notes || ''}
                                          onChange={(e) => setCaseRecoveries(prev => ({
                                            ...prev,
                                            [caseItem.id]: {
                                              ...prev[caseItem.id],
                                              recovery_notes: e.target.value
                                            }
                                          }))}
                                          placeholder="Recovery details..."
                                          className="text-sm"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Case Status Update Section */}
                        {editingUser.cases.length > 0 && (
                          <div className="border-t pt-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Update Case Status</label>
                              <Select
                                value={editForm.case_id}
                                onValueChange={(value) => setEditForm(prev => ({ ...prev, case_id: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a case" />
                                </SelectTrigger>
                                <SelectContent>
                                  {editingUser.cases.map((caseItem) => (
                                    <SelectItem key={caseItem.id} value={caseItem.id}>
                                      {caseItem.title} - ${Number(caseItem.amount).toLocaleString()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {editForm.case_id && (
                              <div className="mt-3">
                                <label className="block text-sm font-medium mb-2">New Status</label>
                                <Select
                                  value={editForm.case_status}
                                  onValueChange={(value) => setEditForm(prev => ({ ...prev, case_status: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="complete">Complete</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Summary */}
                        {editingUser.cases.length > 0 && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Current Totals:</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-medium ml-2">
                                  ${editingUser.cases.reduce((sum, c) => sum + Number(c.amount), 0).toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Total Recovered:</span>
                                <span className="font-medium ml-2 text-green-600">
                                  ${Object.values(caseRecoveries).reduce((sum, recovery) => 
                                    sum + (parseFloat(recovery.amount_recovered) || 0), 0
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsDialogOpen(false);
                              setEditingUser(null);
                              setEditForm({
                                case_status: '',
                                case_id: ''
                              });
                              setCaseRecoveries({});
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button onClick={handleSaveChanges}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'No user accounts have been created yet.'}
          </p>
        </div>
      )}
    </AdminLayout>
  );
}
