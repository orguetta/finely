// Gemini AI integration for pension analysis

export interface GeminiAnalysisResult {
  analysis: string;
  recommendations?: string[];
  warnings?: string[];
}

export class GeminiAIService {
  private static readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  static formatResponse(text: string): string {
    // Convert markdown-like formatting to HTML
    let html = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    const lines = html.split('\n');
    let inList = false;
    let listType = '';
    let processedHtml = '';

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.match(/^[\d]+\./)) {
        if (!inList) {
          processedHtml += '<ol>';
          inList = true;
          listType = 'ol';
        } else if (listType !== 'ol') {
          processedHtml += `</${listType}><ol>`;
          listType = 'ol';
        }
        processedHtml += `<li>${trimmedLine.replace(/^[\d]+\./, '').trim()}</li>`;
      } else if (trimmedLine.match(/^[-*]/)) {
        if (!inList) {
          processedHtml += '<ul>';
          inList = true;
          listType = 'ul';
        } else if (listType !== 'ul') {
          processedHtml += `</${listType}><ul>`;
          listType = 'ul';
        }
        processedHtml += `<li>${trimmedLine.replace(/^[-*]/, '').trim()}</li>`;
      } else {
        if (inList) {
          processedHtml += `</${listType}>`;
          inList = false;
          listType = '';
        }
        if (trimmedLine.startsWith('###')) {
          processedHtml += `<h4>${trimmedLine.replace(/^###/, '').trim()}</h4>`;
        } else if (trimmedLine.startsWith('##')) {
          processedHtml += `<h3>${trimmedLine.replace(/^##/, '').trim()}</h3>`;
        } else if (trimmedLine) {
          processedHtml += `<p>${trimmedLine}</p>`;
        }
      }
    });

    if (inList) {
      processedHtml += `</${listType}>`;
    }

    return processedHtml;
  }

  static async analyzeFees(fundData: any, apiKey: string): Promise<string> {
    const prompt = `
אנא נתח את דמי הניהול של קרן הפנסיה הבאה ותן המלצות לשיפור:

שם הקרן: ${fundData.name}
ספק: ${fundData.provider}
יתרה: ${fundData.balance.toLocaleString('he-IL')} ₪
דמי ניהול: ${fundData.fees?.managementFee || 'לא צוין'}%
דמי השקעה: ${fundData.fees?.investmentFee || 'לא צוין'}%
תשואה שנתית: ${fundData.returns}%

אנא תן ניתוח מקיף הכולל:
1. האם דמי הניהול נמצאים בטווח סביר?
2. השוואה לממוצע בשוק
3. השפעת דמי הניהול על התשואה לטווח ארוך
4. המלצות לשיפור

השב בעברית.
    `.trim();

    return this.callAPI(prompt, apiKey);
  }

  static async analyzeTrack(fundData: any, apiKey: string): Promise<string> {
    const prompt = `
אנא נתח את ביצועי קרן הפנסיה הבאה ותן המלצות:

שם הקרן: ${fundData.name}
ספק: ${fundData.provider}
יתרה: ${fundData.balance.toLocaleString('he-IL')} ₪
תשואה שנתית: ${fundData.returns}%
אחוז מהתיק: ${fundData.percentage.toFixed(1)}%

אנא תן ניתוח מקיף הכולל:
1. איכות הביצועים של הקרן
2. השוואה לתשואות ממוצעות בשוק
3. מידת הסיכון והתשואה
4. האם החלוקה בתיק מאוזנת?
5. המלצות לאופטימיזציה

השב בעברית.
    `.trim();

    return this.callAPI(prompt, apiKey);
  }

  static async analyzePortfolio(pensionData: any, apiKey: string): Promise<string> {
    const totalBalance = pensionData.currentBalance;
    const fundsInfo = pensionData.funds.map((fund: any) => 
      `${fund.name}: ${fund.balance.toLocaleString('he-IL')} ₪ (${fund.percentage.toFixed(1)}%, תשואה: ${fund.returns}%)`
    ).join('\n');

    const prompt = `
אנא נתח את תיק הפנסיה הכולל ותן המלצות מקיפות:

סך היתרה: ${totalBalance.toLocaleString('he-IL')} ₪
הפקדה חודשית: ${(pensionData.monthlyContribution + pensionData.employerContribution).toLocaleString('he-IL')} ₪

פירוט הקרנות:
${fundsInfo}

אנא תן ניתוח מקיף הכולל:
1. האם התיק מגוון ומאוזן?
2. ניתוח התשואות והסיכונים
3. האם ההפקדות החודשיות מספיקות?
4. המלצות לאופטימיזציה של החלוקה
5. אסטרטגיה לטווח ארוך

השב בעברית ובצורה מובנית.
    `.trim();

    return this.callAPI(prompt, apiKey);
  }

  private static async callAPI(prompt: string, apiKey: string): Promise<string> {
    if (!apiKey) {
      throw new Error('מפתח API נדרש לשימוש בניתוח AI');
    }

    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };

    try {
      const response = await fetch(`${this.API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        throw new Error(`שגיאה בקריאה ל-API: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates[0] && result.candidates[0].content) {
        const text = result.candidates[0].content.parts[0].text;
        return this.formatResponse(text);
      } else {
        console.error("Unexpected Gemini API response structure:", result);
        throw new Error('מבנה תגובה לא צפוי מה-API');
      }
    } catch (error) {
      console.error("שגיאה בקריאה ל-Gemini API:", error);
      throw new Error('שגיאה בחיבור לשירות הניתוח');
    }
  }
}
