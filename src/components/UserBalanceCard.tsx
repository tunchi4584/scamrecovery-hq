
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, TrendingUp, TrendingDown, Calculator } from 'lucide-react';

export function UserBalanceCard() {
  const { balance } = useAuth();

  if (!balance) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Account Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-500">No balance information available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recoveryRate = balance.amount_lost > 0 
    ? (balance.amount_recovered / balance.amount_lost * 100).toFixed(1)
    : '0.0';

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Account Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Amount Lost</span>
            </div>
            <p className="text-2xl font-bold text-red-700">
              ${balance.amount_lost?.toLocaleString() || '0'}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Account Balance</span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              ${balance.amount_recovered?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-green-600 mt-1">Amount Recovered</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Recovery Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-blue-700">{recoveryRate}%</p>
              <Badge variant={parseFloat(recoveryRate) > 50 ? "default" : "secondary"}>
                {parseFloat(recoveryRate) > 50 ? 'Good' : 'Improving'}
              </Badge>
            </div>
          </div>
        </div>

        {balance.recovery_notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Recovery Notes</h4>
            <p className="text-sm text-gray-700">{balance.recovery_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
