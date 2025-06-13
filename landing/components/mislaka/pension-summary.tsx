'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Target,
  PiggyBank,
  Building2,
  AlertCircle
} from 'lucide-react';
import { type PensionData } from '@/lib/mislaka/parser';

interface PensionSummaryProps {
  data: PensionData;
}

export function PensionSummary({ data }: PensionSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    return today.getFullYear() - birth.getFullYear();
  };

  const calculateYearsToRetirement = (retirementDate: string) => {
    const retirement = new Date(retirementDate);
    const today = new Date();
    return Math.round((retirement.getTime() - today.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const currentAge = calculateAge(data.personalDetails.birthDate);
  const yearsToRetirement = calculateYearsToRetirement(data.expectedRetirement);
  const totalMonthlyContributions = data.monthlyContribution + data.employerContribution;

  return (
    <div className="space-y-6">
      {/* Personal Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            פרטים אישיים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">שם</p>
              <p className="font-medium">{data.personalDetails.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">גיל נוכחי</p>
              <p className="font-medium">{currentAge} שנים</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">תחילת עבודה</p>
              <p className="font-medium">{formatDate(data.personalDetails.employmentStartDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">פרישה צפויה</p>
              <p className="font-medium">{formatDate(data.expectedRetirement)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">יתרה נוכחית</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(data.currentBalance)}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">הפקדה חודשית</p>
                <p className="text-2xl font-bold text-income">
                  {formatCurrency(totalMonthlyContributions)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  עובד: {formatCurrency(data.monthlyContribution)} | מעביד: {formatCurrency(data.employerContribution)}
                </p>
              </div>
              <div className="h-12 w-12 bg-income/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-income" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">יתרה צפויה</p>
                <p className="text-2xl font-bold text-upcoming">
                  {formatCurrency(data.projectedBalance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  בעוד {yearsToRetirement} שנים
                </p>
              </div>
              <div className="h-12 w-12 bg-upcoming/10 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-upcoming" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">פנסיה חודשית</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(data.monthlyPension)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  צפויה בפרישה
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fund Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            התפלגות קרנות פנסיה
          </CardTitle>
          <CardDescription>
            חלוקת הכספים בין הקרנות השונות
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.funds.map((fund, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{fund.name}</div>
                  <Badge variant="secondary">{fund.percentage}%</Badge>
                </div>
                <div className="text-left">
                  <div className="font-medium">{formatCurrency(fund.balance)}</div>
                  <div className="text-sm text-muted-foreground">
                    תשואה: {fund.returns}%
                  </div>
                </div>
              </div>
              <Progress value={fund.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Progress to Retirement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            התקדמות לפרישה
          </CardTitle>
          <CardDescription>
            {yearsToRetirement} שנים עד לפרישה צפויה
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">התקדמות לפרישה</span>
              <span className="text-sm font-medium">
                {Math.max(0, Math.round(((67 - currentAge) / (67 - 25)) * 100))}%
              </span>
            </div>
            <Progress 
              value={Math.max(0, Math.round(((67 - currentAge) / (67 - 25)) * 100))} 
              className="h-2" 
            />
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-muted-foreground">גיל נוכחי</p>
                <p className="font-medium">{currentAge}</p>
              </div>
              <div>
                <p className="text-muted-foreground">שנים עד פרישה</p>
                <p className="font-medium">{yearsToRetirement}</p>
              </div>
              <div>
                <p className="text-muted-foreground">גיל פרישה</p>
                <p className="font-medium">67</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            אינדיקטורים פיננסיים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-income mb-1">
                {((data.projectedBalance / (data.monthlyPension * 12)) / yearsToRetirement).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">שנות פנסיה צפויות</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">
                {((totalMonthlyContributions * 12) / data.currentBalance * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">שיעור הפקדה שנתי</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-upcoming mb-1">
                {(data.funds.reduce((acc, fund) => acc + fund.returns * fund.percentage, 0) / 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">תשואה ממוצעת משוקללת</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
