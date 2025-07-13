import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Edit,
  Save,
  X,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  AlertCircle,
  Eye,
  FileText,
  Image,
  Download
} from 'lucide-react';

interface AdminCase {
  id: string;
  title: string;
  status: string;
  amount: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  submission_id?: string | null;
  description?: string;
  evidence?: string;
  scam_type?: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  balance: number;
  cases: AdminCase[];
  joinDate: string;
}

interface AdminPortalProps {
  users: AdminUser[];
  onRefresh: () => void;
}

function EvidenceViewer({ evidence }: { evidence: string }) {
  const evidenceParts = evidence.split('\n\n---\n\n');
  const textEvidence = evidenceParts.find(part => !part.startsWith('http')) || '';
  const fileUrls = evidenceParts.filter(part => part.startsWith('http'));

  return (
    <div className="space-y-4">
      {textEvidence && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Text Evidence:</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{textEvidence}</p>
          </div>
        </div>
      )}

      {fileUrls.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Uploaded Files:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fileUrls.map((url, index) => {
              const fileName = url.split('/').pop()?.split('-').slice(1).join('-') || `File ${index + 1}`;
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
              
              return (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {isImage ? (
                      <Image className="h-4 w-4 text-blue-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="text-sm font-medium truncate">{fileName}</span>
                  </div>
                  
                  {isImage && (
                    <img 
                      src={url} 
                      alt={fileName}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(url, '_blank')}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = fileName;
                        link.click();
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminPortal({ users, onRefresh }: AdminPortalProps) {
  const { toast } = useToast();
  const [editingCase, setEditingCase] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ amount: string; status: string }>({ amount: '', status: '' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'under_review': return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'approved': return 'bg-green-100 text-green-800 border border-green-300';
      case 'complete': return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'closed': return 'bg-gray-100 text-gray-800 border border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
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

  const startEditing = (caseItem: AdminCase) => {
    setEditingCase(caseItem.id);
    setEditValues({
      amount: String(caseItem.amount),
      status: caseItem.status
    });
  };

  const cancelEditing = () => {
    setEditingCase(null);
    setEditValues({ amount: '', status: '' });
  };

  const saveChanges = async (caseId: string) => {
    try {
      const updateData: any = { status: editValues.status };
      const newAmount = parseFloat(editValues.amount);
      if (!isNaN(newAmount)) {
        updateData.amount = newAmount;
      }

      const { error } = await supabase
        .from('cases')
        .update(updateData)
        .eq('id', caseId);

      if (error) throw error;

      toast({
        title: "Case Updated",
        description: `Case status updated to ${getStatusLabel(editValues.status)}`,
      });

      setEditingCase(null);
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update case",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {users.map((user) => (
        <Card key={user.id} className="w-full shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {user.name}
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 mt-2 text-sm opacity-90">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined: {new Date(user.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${user.balance.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Recovered</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* User Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Recovery Amount</p>
                    <p className="text-2xl font-bold text-green-600">${user.balance.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Cases</p>
                    <p className="text-2xl font-bold text-blue-600">{user.cases.length}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Cases List */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Cases Management</h4>
              
              {user.cases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No cases found for this user</p>
                </div>
              ) : (
                user.cases.map((caseItem) => (
                  <div key={caseItem.id} className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h5 className="font-medium text-gray-900 truncate">{caseItem.title}</h5>
                          <Badge className={getStatusColor(caseItem.status)}>
                            {getStatusLabel(caseItem.status)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Created: {new Date(caseItem.created_at).toLocaleDateString()}</p>
                          {caseItem.scam_type && <p>Type: {caseItem.scam_type}</p>}
                          {caseItem.description && (
                            <p className="line-clamp-2">Description: {caseItem.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {editingCase === caseItem.id ? (
                        <div className="flex flex-col sm:flex-row gap-3 min-w-0 sm:min-w-96">
                          <div className="flex-1">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Amount"
                              value={editValues.amount}
                              onChange={(e) => setEditValues(prev => ({ ...prev, amount: e.target.value }))}
                              className="w-full"
                            />
                          </div>
                          <div className="flex-1">
                            <Select
                              value={editValues.status}
                              onValueChange={(value) => setEditValues(prev => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger className="w-full">
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
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => saveChanges(caseItem.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              ${Number(caseItem.amount).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">Case Amount</div>
                          </div>
                          <div className="flex gap-2">
                            {caseItem.evidence && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Evidence
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Case Evidence: {caseItem.title}</DialogTitle>
                                  </DialogHeader>
                                  <EvidenceViewer evidence={caseItem.evidence} />
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button
                              size="sm"
                              onClick={() => startEditing(caseItem)}
                              variant="outline"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
