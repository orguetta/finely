'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartConfiguration
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp, PieChart, BarChart3, LineChart } from 'lucide-react';
import { type PensionData } from '@/lib/mislaka/parser';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface PensionChartProps {
  data: PensionData;
}

export function PensionChart({ data }: PensionChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Generate projection data for the next 20 years
  const generateProjectionData = () => {
    const years = [];
    const balances = [];
    const contributions = [];
    
    let currentBalance = data.currentBalance;
    const monthlyTotal = data.monthlyContribution + data.employerContribution;
    const averageReturn = data.funds.reduce((acc, fund) => acc + fund.returns * fund.percentage, 0) / 100 / 100;
    
    for (let i = 0; i <= 20; i++) {
      const year = new Date().getFullYear() + i;
      years.push(year.toString());
      
      // Calculate balance with compound growth
      if (i > 0) {
        currentBalance = (currentBalance + monthlyTotal * 12) * (1 + averageReturn);
      }
      
      balances.push(Math.round(currentBalance));
      contributions.push(monthlyTotal * 12 * i);
    }
    
    return { years, balances, contributions };
  };

  const projectionData = generateProjectionData();

  // Fund distribution chart data
  const fundDistributionData = {
    labels: data.funds.map(fund => fund.name),
    datasets: [
      {
        data: data.funds.map(fund => fund.balance),
        backgroundColor: [
          'hsl(var(--color-primary))',
          'hsl(var(--color-income))',
          'hsl(var(--color-upcoming))',
          'hsl(var(--chart-4))',
          'hsl(var(--chart-5))',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Balance projection chart data
  const balanceProjectionData = {
    labels: projectionData.years,
    datasets: [
      {
        label: 'צפי יתרה',
        data: projectionData.balances,
        borderColor: 'hsl(var(--color-primary))',
        backgroundColor: 'hsla(var(--color-primary), 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'סה"כ הפקדות',
        data: projectionData.contributions,
        borderColor: 'hsl(var(--color-income))',
        backgroundColor: 'hsla(var(--color-income), 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Monthly contributions chart data
  const contributionsData = {
    labels: ['הפקדת עובד', 'הפקדת מעביד', 'סה"כ חודשי'],
    datasets: [
      {
        label: 'הפקדות (₪)',
        data: [
          data.monthlyContribution,
          data.employerContribution,
          data.monthlyContribution + data.employerContribution,
        ],
        backgroundColor: [
          'hsl(var(--color-primary))',
          'hsl(var(--color-income))',
          'hsl(var(--color-upcoming))',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Fund returns comparison
  const fundReturnsData = {
    labels: data.funds.map(fund => fund.name),
    datasets: [
      {
        label: 'תשואה שנתית (%)',
        data: data.funds.map(fund => fund.returns),
        backgroundColor: data.funds.map((_, index) => 
          `hsl(var(--chart-${(index % 5) + 1}))`
        ),
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: {
            family: 'Inter',
          },
        },
      },
      tooltip: {
        rtl: true,
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex !== undefined) {
              const label = context.dataset.label || '';
              const value = context.parsed.y || context.parsed;
              if (label.includes('₪') || label.includes('יתרה') || label.includes('הפקדות')) {
                return `${label}: ${formatCurrency(value)}`;
              }
              return `${label}: ${value}`;
            }
            return '';
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const percentageChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: {
            family: 'Inter',
          },
        },
      },
      tooltip: {
        rtl: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...data.funds.map(f => f.returns)) + 2,
        ticks: {
          callback: function(value: any) {
            return `${value}%`;
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        rtl: true,
        labels: {
          font: {
            family: 'Inter',
          },
          padding: 20,
        },
      },
      tooltip: {
        rtl: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = ((value / data.currentBalance) * 100).toFixed(1);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="projection" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projection" className="gap-2">
            <LineChart className="h-4 w-4" />
            תחזית
          </TabsTrigger>
          <TabsTrigger value="distribution" className="gap-2">
            <PieChart className="h-4 w-4" />
            התפלגות
          </TabsTrigger>
          <TabsTrigger value="contributions" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            הפקדות
          </TabsTrigger>
          <TabsTrigger value="returns" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            תשואות
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                תחזית יתרה לעתיד
              </CardTitle>
              <CardDescription>
                התפתחות יתרת הפנסיה ב-20 השנים הקרובות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Line data={balanceProjectionData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                התפלגות קרנות פנסיה
              </CardTitle>
              <CardDescription>
                חלוקת הכספים בין הקרנות השונות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Doughnut data={fundDistributionData} options={doughnutOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                הפקדות חודשיות
              </CardTitle>
              <CardDescription>
                פירוט ההפקדות החודשיות שלך ושל המעביד
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar data={contributionsData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                תשואות קרנות
              </CardTitle>
              <CardDescription>
                השוואת התשואות השנתיות של הקרנות השונות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar data={fundReturnsData} options={percentageChartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">
              {((data.projectedBalance - data.currentBalance) / data.currentBalance * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">צמיחה צפויה עד פרישה</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-income mb-2">
              {formatCurrency((data.monthlyContribution + data.employerContribution) * 12)}
            </div>
            <div className="text-sm text-muted-foreground">הפקדות שנתיות</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-upcoming mb-2">
              {(data.funds.reduce((acc, fund) => acc + fund.returns * fund.percentage, 0) / 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">תשואה ממוצעת משוקללת</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
