'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Search, 
  Building2, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Bot,
  Sparkles,
  Eye,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { type PensionData } from '@/lib/mislaka/parser';
import { GeminiAIService } from '@/lib/mislaka/ai-service';

interface PensionDetailsProps {
  data: PensionData;
}

type SortField = 'date' | 'type' | 'amount';
type SortDirection = 'asc' | 'desc';

export function PensionDetails({ data }: PensionDetailsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const filteredAndSortedTransactions = data.transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === '' || transaction.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleAIAnalysis = async (type: 'fees' | 'track' | 'portfolio', fundId?: string) => {
    if (!apiKey.trim()) {
      setAnalysisError('נדרש מפתח API של Google AI לביצוע הניתוח');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError('');
    setIsDialogOpen(true);
    setAnalysisResult('');

    try {
      let result = '';
      
      if (type === 'portfolio') {
        result = await GeminiAIService.analyzePortfolio(data, apiKey);
      } else if (fundId) {
        const fund = data.funds.find(f => f.id === fundId);
        if (!fund) {
          throw new Error('קרן לא נמצאה');
        }
        
        if (type === 'fees') {
          result = await GeminiAIService.analyzeFees(fund, apiKey);
        } else if (type === 'track') {
          result = await GeminiAIService.analyzeTrack(fund, apiKey);
        }
      }
      
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'שגיאה לא צפויה בניתוח');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const transactionTypes = [...new Set(data.transactions.map(t => t.type))];
  
  const handleExportData = () => {
    const csvContent = [
      ['תאריך', 'סוג', 'סכום', 'תיאור'],
      ...filteredAndSortedTransactions.map(t => [
        formatDate(t.date),
        t.type,
        t.amount.toString(),
        t.description
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pension_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* API Key Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            ניתוח AI מתקדם
          </CardTitle>
          <CardDescription>
            הזן מפתח Google AI API לקבלת ניתוחים מותאמים אישית
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="api-key">מפתח Google AI API</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="הדבק כאן את מפתח ה-API שלך"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={() => handleAIAnalysis('portfolio')}
                disabled={!apiKey.trim() || isAnalyzing}
                className="gap-2"
              >
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                נתח תיק כולל
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>המפתח נשמר מקומית בדפדפן ומשמש רק לקריאות ישירות ל-Google AI</span>
          </div>
          <div className="text-xs text-muted-foreground">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              קבל מפתח API בחינם מ-Google AI Studio ←
            </a>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions" className="gap-2">
            <FileText className="h-4 w-4" />
            תנועות
          </TabsTrigger>
          <TabsTrigger value="funds" className="gap-2">
            <Building2 className="h-4 w-4" />
            פירוט קרנות
          </TabsTrigger>
          <TabsTrigger value="calculations" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            חישובים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    היסטוריית תנועות
                  </CardTitle>
                  <CardDescription>
                    {filteredAndSortedTransactions.length} תנועות מתוך {data.transactions.length}
                  </CardDescription>
                </div>
                <Button onClick={handleExportData} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  יצוא CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="חיפוש בתנועות..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full h-10 px-3 border border-input bg-background text-sm rounded-md"
                  >
                    <option value="">כל הסוגים</option>
                    {transactionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="border rounded-lg">
                <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 border-b font-medium">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('date')}
                    className="justify-start p-0 h-auto font-medium hover:bg-transparent"
                  >
                    תאריך {getSortIcon('date')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('type')}
                    className="justify-start p-0 h-auto font-medium hover:bg-transparent"
                  >
                    סוג {getSortIcon('type')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('amount')}
                    className="justify-start p-0 h-auto font-medium hover:bg-transparent"
                  >
                    סכום {getSortIcon('amount')}
                  </Button>
                  <div>תיאור</div>
                </div>
                
                <ScrollArea className="h-96">
                  {filteredAndSortedTransactions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      לא נמצאו תנועות התואמות לחיפוש
                    </div>
                  ) : (
                    filteredAndSortedTransactions.map((transaction, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/20">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(transaction.date)}</span>
                        </div>
                        <div>
                          <Badge 
                            variant={transaction.type === 'הפקדה' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {transaction.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className={transaction.amount > 0 ? 'text-income' : 'text-expense'}>
                            {formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.description}
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funds">
          <div className="space-y-4">
            {data.funds.map((fund, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {fund.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{fund.percentage.toFixed(1)}% מהתיק</Badge>
                      {apiKey.trim() && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAIAnalysis('fees', fund.id)}
                            disabled={isAnalyzing}
                            className="gap-1"
                          >
                            <DollarSign className="h-3 w-3" />
                            דמי ניהול
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAIAnalysis('track', fund.id)}
                            disabled={isAnalyzing}
                            className="gap-1"
                          >
                            <TrendingUp className="h-3 w-3" />
                            ביצועים
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {formatCurrency(fund.balance)}
                      </div>
                      <div className="text-sm text-muted-foreground">יתרה נוכחית</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-income mb-1">
                        {fund.returns}%
                      </div>
                      <div className="text-sm text-muted-foreground">תשואה שנתית</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-upcoming mb-1">
                        {formatCurrency(fund.balance * (fund.returns / 100))}
                      </div>
                      <div className="text-sm text-muted-foreground">רווח שנתי צפוי</div>
                    </div>
                  </div>
                  
                  {/* Additional fund details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-muted-foreground mb-2">פרטי חשבון</div>
                      <div className="space-y-1">
                        <div>מספר חשבון: {fund.accountDetails?.accountNumber || 'לא צוין'}</div>
                        <div>מספר פוליסה: {fund.accountDetails?.policyNumber || 'לא צוין'}</div>
                        <div>עדכון אחרון: {fund.lastUpdate}</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground mb-2">דמי ניהול</div>
                      <div className="space-y-1">
                        <div>דמי ניהול: {fund.fees?.managementFee || 0}%</div>
                        <div>דמי השקעה: {fund.fees?.investmentFee || 0}%</div>
                        <div>דמי סיכון: {fund.fees?.riskFee || 0}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calculations">
          <div className="space-y-6">
            {/* Monthly Calculations */}
            <Card>
              <CardHeader>
                <CardTitle>חישובים חודשיים</CardTitle>
                <CardDescription>פירוט ההפקדות והצמיחה החודשית</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl font-bold text-primary mb-1">
                      {formatCurrency(data.monthlyContribution)}
                    </div>
                    <div className="text-sm text-muted-foreground">הפקדת עובד</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl font-bold text-income mb-1">
                      {formatCurrency(data.employerContribution)}
                    </div>
                    <div className="text-sm text-muted-foreground">הפקדת מעביד</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl font-bold text-upcoming mb-1">
                      {formatCurrency(data.monthlyContribution + data.employerContribution)}
                    </div>
                    <div className="text-sm text-muted-foreground">סה"כ הפקדה</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl font-bold text-primary mb-1">
                      {formatCurrency(data.currentBalance * (data.funds.reduce((acc, fund) => acc + fund.returns * fund.percentage, 0) / 100 / 100) / 12)}
                    </div>
                    <div className="text-sm text-muted-foreground">צמיחה חודשית צפויה</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Annual Calculations */}
            <Card>
              <CardHeader>
                <CardTitle>חישובים שנתיים</CardTitle>
                <CardDescription>סיכום שנתי והתפתחות</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl font-bold text-primary mb-1">
                      {formatCurrency((data.monthlyContribution + data.employerContribution) * 12)}
                    </div>
                    <div className="text-sm text-muted-foreground">הפקדות שנתיות</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl font-bold text-income mb-1">
                      {formatCurrency(data.currentBalance * (data.funds.reduce((acc, fund) => acc + fund.returns * fund.percentage, 0) / 100 / 100))}
                    </div>
                    <div className="text-sm text-muted-foreground">צמיחה שנתית צפויה</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl font-bold text-upcoming mb-1">
                      {(((data.monthlyContribution + data.employerContribution) * 12) / data.currentBalance * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">שיעור הפקדה מהיתרה</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Retirement Calculations */}
            <Card>
              <CardHeader>
                <CardTitle>חישובי פרישה</CardTitle>
                <CardDescription>תחזיות לגיל הפרישה</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">יתרה צפויה בפרישה</h4>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(data.projectedBalance)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      בהתבסס על התשואה הממוצעת הנוכחית והפקדות קבועות
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">פנסיה חודשית צפויה</h4>
                    <div className="text-2xl font-bold text-income">
                      {formatCurrency(data.monthlyPension)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      בהתבסס על יתרה צפויה וטבלאות תוחלת חיים
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Analysis Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              ניתוח Gemini AI
            </DialogTitle>
            <DialogDescription>
              ניתוח מתקדם של הנתונים הפנסיוניים שלך
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] p-4">
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-lg">מבצע ניתוח AI...</span>
              </div>
            ) : analysisError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{analysisError}</AlertDescription>
              </Alert>
            ) : analysisResult ? (
              <div 
                className="prose prose-sm max-w-none text-right [&>*]:text-right"
                dangerouslySetInnerHTML={{ __html: analysisResult }}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                בחר סוג ניתוח כדי להתחיל
              </div>
            )}
          </ScrollArea>
          
          <div className="flex items-center gap-2 p-4 border-t bg-muted/20 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            <span>
              הניתוח מבוסס על נתוני AI ומיועד למטרות הכוונה בלבד. 
              לא מהווה ייעוץ פיננסי מקצועי.
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
