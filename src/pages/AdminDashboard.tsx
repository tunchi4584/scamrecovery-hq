
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Settings,
  LogOut,
  Edit,
  Trash2,
  Shield
} from 'lucide-react';

export default function AdminDashboard() {
  const { isAdmin, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Mock data for demonstration
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      balance: 2500,
      cases: [
        { id: '1', title: 'Investment Scam', status: 'In Progress', amount: 5000 },
        { id: '2', title: 'Romance Scam', status: 'Resolved', amount: 2500 }
      ],
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      balance: 8200,
      cases: [
        { id: '3', title: 'Crypto Scam', status: 'Resolved', amount: 8200 }
      ],
      joinDate: '2024-01-20'
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike@example.com',
      balance: 0,
      cases: [
        { id: '4', title: 'Tech Support Scam', status: 'Pending', amount: 1200 }
      ],
      joinDate: '2024-02-01'
    }
  ]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const updateUserBalance = (userId: string, newBalance: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, balance: newBalance } : user
    ));
    toast({
      title: "Balance Updated",
      description: `User balance has been updated to $${newBalance.toLocaleString()}`,
    });
  };

  const updateCaseStatus = (userId: string, caseId: string, newStatus: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? {
            ...user,
            cases: user.cases.map(case_ =>
              case_.id === caseId ? { ...case_, status: newStatus } : case_
            )
          }
        : user
    ));
    toast({
      title: "Case Status Updated",
      description: `Case status has been updated to ${newStatus}`,
    });
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "User Deleted",
      description: "User account has been permanently deleted",
    });
  };

  const stats = {
    totalUsers: users.length,
    totalCases: users.reduce((acc, user) => acc + user.cases.length, 0),
    totalBalance: users.reduce((acc, user) => acc + user.balance, 0),
    activeCases: users.reduce((acc, user) => 
      acc + user.cases.filter(c => c.status !== 'Resolved').length, 0
    )
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
            <Button onClick={handleLogout} variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
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
                    <p className="text-sm font-medium text-gray-600">Total Balances</p>
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

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Settings className="h-6 w-6 mr-2" />
                User Management
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
                          Edit
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

                    {/* Balance Management */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-700">Current Balance</span>
                          <span className="text-2xl font-bold text-green-600">
                            ${user.balance.toLocaleString()}
                          </span>
                        </div>
                        {selectedUser === user.id && (
                          <div className="flex space-x-2 mt-3">
                            <Input
                              type="number"
                              placeholder="New balance"
                              id={`balance-${user.id}`}
                              className="flex-1"
                            />
                            <Button 
                              size="sm"
                              onClick={() => {
                                const input = document.getElementById(`balance-${user.id}`) as HTMLInputElement;
                                const newBalance = parseFloat(input.value) || 0;
                                updateUserBalance(user.id, newBalance);
                                input.value = '';
                              }}
                            >
                              Update
                            </Button>
                          </div>
                        )}
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
                          <div key={case_.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{case_.title}</p>
                              <p className="text-sm text-gray-600">Amount: ${case_.amount.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className={
                                case_.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                case_.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {case_.status}
                              </Badge>
                              {selectedUser === user.id && (
                                <select 
                                  value={case_.status}
                                  onChange={(e) => updateCaseStatus(user.id, case_.id, e.target.value)}
                                  className="text-sm border rounded px-2 py-1"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Resolved">Resolved</option>
                                  <option value="Closed">Closed</option>
                                </select>
                              )}
                            </div>
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
