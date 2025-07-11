
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Search, Edit2, DollarSign, TrendingUp } from 'lucide-react';

interface BalanceData {
  id: string;
  user_id: string;
  amount_lost: number;
  amount_recovered: number;
  recovery_notes?: string;
  created_at: string;
  updated_at: string;
  profile?: {
    name: string;
    email: string;
  };
}

export default function AdminBalances() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [balances, setBalances] = useState<BalanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBalance, setEditingBalance] = useState<BalanceData | null>(null);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchBalances();
  }, [user, isAdmin, navigate]);

  const fetchBalances = async () => {
    try {
      const { data, error } = await supabase
        .from('balances')
        .select(`
          *,
          profiles:user_id (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBalances(data || []);
    } catch (error) {
      console.error('Error fetching balances:', error);
      toast({
        title: "Error",
        description: "Failed to fetch balance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (
    balanceId: string, 
    amountRecovered: number, 
    recoveryNotes: string
  ) => {
    try {
      const { error } = await supabase
        .from('balances')
        .update({ 
          amount_recovered: amountRecovered,
          recovery_notes: recoveryNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', balanceId);

      if (error) throw error;

      setBalances(balances.map(balance => 
        balance.id === balanceId 
          ? { 
              ...balance, 
              amount_recovered: amountRecovered,
              recovery_notes: recoveryNotes,
              updated_at: new Date().toISOString()
            }
          : balance
      ));

      toast({
        title: "Success",
        description: "Balance updated successfully",
      });
      setEditingBalance(null);
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: "Error",
        description: "Failed to update balance",
        variant: "destructive"
      });
    }
  };

  const filteredBalances = balances.filter(balance => {
    if (!balance.profile) return false;
    
    return (
      balance.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      balance.profile.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalLost = balances.reduce((sum, balance) => sum + balance.amount_lost, 0);
  const totalRecovered = balances.reduce((sum, balance) => sum + balance.amount_recovered, 0);
  const recoveryRate = totalLost > 0 ? (totalRecovered / totalLost) * 100 : 0;

  if (loading) {
    return (
      <AdminLayout title="Balance Tracker">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Balance Tracker">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount Lost</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalLost.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recovered</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRecovered.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{recoveryRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>User Balances ({balances.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount Lost</TableHead>
                  <TableHead>Amount Recovered</TableHead>
                  <TableHead>Recovery Rate</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBalances.map((balance) => {
                  const userRecoveryRate = balance.amount_lost > 0 
                    ? (balance.amount_recovered / balance.amount_lost) * 100 
                    : 0;

                  return (
                    <TableRow key={balance.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{balance.profile?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{balance.profile?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        ${balance.amount_lost.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ${balance.amount_recovered.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            userRecoveryRate >= 100
                              ? 'bg-green-100 text-green-800'
                              : userRecoveryRate >= 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {userRecoveryRate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(balance.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingBalance(balance)}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Update
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Recovery Amount</DialogTitle>
                            </DialogHeader>
                            {editingBalance && (
                              <EditBalanceForm
                                balance={editingBalance}
                                onUpdate={updateBalance}
                                onCancel={() => setEditingBalance(null)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredBalances.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No users found matching your search.' : 'No balance data found.'}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

interface EditBalanceFormProps {
  balance: BalanceData;
  onUpdate: (id: string, amountRecovered: number, recoveryNotes: string) => void;
  onCancel: () => void;
}

function EditBalanceForm({ balance, onUpdate, onCancel }: EditBalanceFormProps) {
  const [amountRecovered, setAmountRecovered] = useState(balance.amount_recovered.toString());
  const [recoveryNotes, setRecoveryNotes] = useState(balance.recovery_notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountRecovered) || 0;
    onUpdate(balance.id, amount, recoveryNotes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          User: {balance.profile?.name} ({balance.profile?.email})
        </label>
        <p className="text-sm text-gray-600">
          Amount Lost: ${balance.amount_lost.toLocaleString()}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Amount Recovered ($)</label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={amountRecovered}
          onChange={(e) => setAmountRecovered(e.target.value)}
          placeholder="Enter recovered amount"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Recovery Notes</label>
        <Textarea
          value={recoveryNotes}
          onChange={(e) => setRecoveryNotes(e.target.value)}
          placeholder="Add notes about the recovery process..."
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Update Balance
        </Button>
      </div>
    </form>
  );
}
