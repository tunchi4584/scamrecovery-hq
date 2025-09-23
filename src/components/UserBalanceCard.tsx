
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, TrendingUp, TrendingDown, Calculator, FileText } from 'lucide-react';

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
    <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/10 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-30"></div>
      <CardHeader className="relative pb-6">
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl shadow-lg">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          Account Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-gradient-to-br from-red-50 via-red-100/50 to-red-50 p-6 rounded-2xl border border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-sm font-bold text-red-600 uppercase tracking-wider">Amount Lost</span>
            </div>
            <p className="text-3xl font-bold text-red-700">
              ${balance.amount_lost?.toLocaleString() || '0'}
            </p>
          </div>

          <div className="group bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-50 p-6 rounded-2xl border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Account Balance</span>
            </div>
            <p className="text-3xl font-bold text-emerald-700">
              ${balance.amount_recovered?.toLocaleString() || '0'}
            </p>
            <p className="text-xs text-emerald-600 mt-2 font-semibold">Amount Recovered</p>
          </div>

          <div className="group bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 p-6 rounded-2xl border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Recovery Rate</span>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-blue-700">{recoveryRate}%</p>
              <Badge 
                variant={parseFloat(recoveryRate) > 50 ? "default" : "secondary"} 
                className="font-bold px-3 py-1 text-xs"
              >
                {parseFloat(recoveryRate) > 50 ? 'Excellent' : 'Improving'}
              </Badge>
            </div>
          </div>
        </div>

        {balance.recovery_notes && (
          <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl border border-primary/20 shadow-lg">
            <h4 className="font-bold text-primary mb-4 flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              Admin Notes & Updates
            </h4>
            <p className="text-sm text-foreground leading-relaxed font-medium">{balance.recovery_notes}</p>
            <div className="mt-4 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Last updated by admin
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
