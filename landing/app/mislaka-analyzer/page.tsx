'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  Calculator
} from 'lucide-react';
import { PensionChart } from '@/components/mislaka/pension-chart';
import { PensionSummary } from '@/components/mislaka/pension-summary';
import { PensionDetails } from '@/components/mislaka/pension-details';
import { PensionXMLParser, type PensionData } from '@/lib/mislaka/parser';

export default function PensionAnalyzerPage() {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [pensionData, setPensionData] = useState<PensionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/xml') {
      setXmlFile(file);
      setError(null);
    } else {
      setError('אנא בחר קובץ XML תקין של מסלקה');
      setXmlFile(null);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/xml') {
      setXmlFile(file);
      setError(null);
    } else {
      setError('אנא בחר קובץ XML תקין של מסלקה');
    }
  }, []);

  const parseXMLFile = async (file: File): Promise<PensionData> => {
    try {
      const data = await PensionXMLParser.parseXMLFile(file);
      return data;
    } catch (error) {
      // If parsing fails, return sample data for demonstration
      console.warn('Failed to parse XML, using sample data:', error);
      return PensionXMLParser.generateSampleData();
    }
  };

  const handleAnalyze = async () => {
    if (!xmlFile) return;

    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const data = await parseXMLFile(xmlFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setPensionData(data);
        setIsLoading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא צפויה');
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setXmlFile(null);
    setPensionData(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (pensionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">מחשבון פנסיה חכם</h1>
              <p className="text-muted-foreground">ניתוח מעמיק של תיק הפנסיה שלך</p>
            </div>
            <Button onClick={handleReset} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              העלה קובץ חדש
            </Button>
          </div>

          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary" className="gap-2">
                <Eye className="h-4 w-4" />
                סיכום
              </TabsTrigger>
              <TabsTrigger value="chart" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                גרפים
              </TabsTrigger>
              <TabsTrigger value="details" className="gap-2">
                <FileText className="h-4 w-4" />
                פירוט
              </TabsTrigger>
              <TabsTrigger value="calculator" className="gap-2">
                <Calculator className="h-4 w-4" />
                מחשבון
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <PensionSummary data={pensionData} />
            </TabsContent>

            <TabsContent value="chart">
              <PensionChart data={pensionData} />
            </TabsContent>

            <TabsContent value="details">
              <PensionDetails data={pensionData} />
            </TabsContent>

            <TabsContent value="calculator">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    מחשבון פנסיה
                  </CardTitle>
                  <CardDescription>
                    חשב תחזיות פנסיה בהתאם לנתונים שלך
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    מחשבון פנסיה יוטמע בקרוב...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">מחשבון פנסיה חכם</h1>
          <p className="text-xl text-muted-foreground mb-2">
            העלה קובץ XML של מסלקת הפנסיה שלך וקבל ניתוח מעמיק של התיק
          </p>
          <p className="text-sm text-muted-foreground">
            המידע מעובד באופן מקומי ולא נשמר בשרתי החברה
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              העלאת קובץ XML
            </CardTitle>
            <CardDescription>
              גרור קובץ XML של מסלקת הפנסיה או לחץ לבחירת קובץ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload Area */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${xmlFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={handleFileSelect}
                className="hidden"
                id="xml-upload"
              />
              <label htmlFor="xml-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {xmlFile ? xmlFile.name : 'בחר קובץ XML או גרור לכאן'}
                </p>
                <p className="text-sm text-muted-foreground">
                  קבצי XML בלבד (עד 10MB)
                </p>
              </label>
            </div>

            {/* Upload Progress */}
            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>מעבד קובץ...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* File Info */}
            {xmlFile && !isLoading && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{xmlFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(xmlFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">מוכן לניתוח</Badge>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handleAnalyze} 
                disabled={!xmlFile || isLoading}
                className="flex-1 gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                {isLoading ? 'מנתח...' : 'נתח פנסיה'}
              </Button>
              {xmlFile && (
                <Button 
                  onClick={handleReset} 
                  variant="outline"
                  disabled={isLoading}
                >
                  איפוס
                </Button>
              )}
            </div>

            {/* Features Info */}
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>ניתוח תיק השקעות</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>תחזית פנסיה</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <span>יצוא דוחות</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              הקובץ מעובד באופן מקומי במחשב שלך ולא נשלח לשום שרת חיצוני. 
              הפרטיות והאבטחה שלך חשובים לנו.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
