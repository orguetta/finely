// Pension XML Parser - Based on Israeli Pension Clearing House XML format

export interface PensionFund {
  id: string;
  name: string;
  provider: string;
  productType: string;
  productDisplayName: string;
  balance: number;
  percentage: number;
  returns: number;
  fees: {
    managementFee: number;
    investmentFee: number;
    riskFee: number;
  };
  lastUpdate: string;
  accountDetails?: {
    accountNumber: string;
    policyNumber: string;
    accountType: string;
  };
}

export interface PensionTransaction {
  date: string;
  type: string;
  amount: number;
  description: string;
  fund?: string;
  reference?: string;
}

export interface PensionData {
  personalDetails: {
    name: string;
    id: string;
    birthDate: string;
    employmentStartDate: string;
  };
  currentBalance: number;
  monthlyContribution: number;
  employerContribution: number;
  expectedRetirement: string;
  projectedBalance: number;
  monthlyPension: number;
  funds: PensionFund[];
  transactions: PensionTransaction[];
  rawData?: {
    provider: string;
    reportDate: string;
    fileName: string;
  };
}

export class PensionXMLParser {
  private static getProductType(productTypeCode: string): string {
    const code = String(productTypeCode).trim();
    const productMap: Record<string, string> = {
      '101': 'פנסיה תעסוקתית',
      '102': 'קופת גמל לפנסיה',
      '103': 'קרן פנסיה',
      '201': 'קופת גמל להשתלמות', 
      '202': 'תגמולים',
      '301': 'ביטוח מנהלים',
      '401': 'קופת ביטוח סיעודי',
      '501': 'קופת גמל לתגמולים',
      // Add more product type mappings as needed
    };
    return productMap[code] || `קוד ${code}`;
  }

  private static getText(node: Element | null, query: string, defaultValue = ''): string {
    if (!node) return defaultValue;
    const el = node.querySelector(query);
    return el?.textContent?.trim() || defaultValue;
  }

  private static getFloat(node: Element | null, query: string, defaultValue = 0): number {
    if (!node) return defaultValue;
    const el = node.querySelector(query);
    const text = el?.textContent?.trim();
    return text ? parseFloat(text) : defaultValue;
  }

  private static formatDate(yyyymmdd: string): string {
    if (!yyyymmdd || yyyymmdd.length < 8) return '-';
    const year = yyyymmdd.substring(0, 4);
    const month = yyyymmdd.substring(4, 6);
    const day = yyyymmdd.substring(6, 8);
    if (day === '00') return `${month}/${year}`;
    return `${day}/${month}/${year}`;
  }

  static async parseXMLFile(file: File): Promise<PensionData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const xmlText = e.target?.result as string;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
          
          // Check for parsing errors
          const parserError = xmlDoc.querySelector('parsererror');
          if (parserError) {
            throw new Error('שגיאה בפענוח קובץ ה-XML');
          }

          const parsedData = this.extractDataFromXML(xmlDoc, file.name);
          resolve(parsedData);
          
        } catch (err) {
          reject(new Error('שגיאה בעיבוד קובץ ה-XML: ' + (err instanceof Error ? err.message : 'שגיאה לא ידועה')));
        }
      };

      reader.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'));
      reader.readAsText(file);
    });
  }

  private static extractDataFromXML(xmlDoc: Document, fileName: string): PensionData {
    const funds: PensionFund[] = [];
    const transactions: PensionTransaction[] = [];
    
    // Extract provider information
    const providerNameNode = xmlDoc.querySelector('YeshutYatzran > SHEM-YATZRAN');
    const providerName = providerNameNode?.textContent?.trim() || 'ספק לא ידוע';

    // Extract report date
    const reportDateNode = xmlDoc.querySelector('KodResha, ReportPeriod, TaarichBitzua');
    const reportDate = reportDateNode?.textContent?.trim() || '';

    // Extract products (Mutzarim)
    const mutzarim = xmlDoc.querySelectorAll('Mutzarim > Mutzar');
    let fundCounter = 0;
    let totalBalance = 0;

    mutzarim.forEach(mutzarNode => {
      fundCounter++;
      const productType = this.getText(mutzarNode, 'SUG-MUTZAR');
      const productDisplayName = this.getProductType(productType);
      
      // Extract account details
      const accountNumber = this.getText(mutzarNode, 'MISPAR-HESHBON');
      const policyNumber = this.getText(mutzarNode, 'MISPAR-POLISA');
      
      // Extract financial data
      const balance = this.getFloat(mutzarNode, 'TSAVUR-NETO, YitratKeren, Yitrah');
      const managementFee = this.getFloat(mutzarNode, 'DmeiNihul, DmeiNihul');
      const lastUpdateRaw = this.getText(mutzarNode, 'TaarichYetziratDivuach, TaarichBitzu, TAARICH-OHEN');

      totalBalance += balance;

      const fund: PensionFund = {
        id: `fund_${fundCounter}`,
        name: this.getText(mutzarNode, 'SHEM-MUTZAR') || `${productDisplayName} ${fundCounter}`,
        provider: providerName,
        productType: productType,
        productDisplayName: productDisplayName,
        balance: balance,
        percentage: 0, // Will be calculated later
        returns: this.getFloat(mutzarNode, 'SHAA-TSUA', 6.5), // Default return rate
        fees: {
          managementFee: managementFee,
          investmentFee: this.getFloat(mutzarNode, 'DmeiHanhalah'),
          riskFee: this.getFloat(mutzarNode, 'DmeiSikun'),
        },
        lastUpdate: this.formatDate(lastUpdateRaw),
        accountDetails: {
          accountNumber: accountNumber,
          policyNumber: policyNumber,
          accountType: productDisplayName
        }
      };

      funds.push(fund);

      // Extract transactions if available
      const transactionNodes = mutzarNode.querySelectorAll('Tenuot > Tenua, Hatzabua > Hatzbah');
      transactionNodes.forEach(transactionNode => {
        const transactionDate = this.getText(transactionNode, 'TaarichTenua, TaarichHatzbah');
        const transactionAmount = this.getFloat(transactionNode, 'SachTenua, SachHatzbah');
        const transactionType = this.getText(transactionNode, 'SugTenua, SugHatzbah') || 'תנועה';
        const description = this.getText(transactionNode, 'TeurTenua, TeurHatzbah') || transactionType;

        if (transactionAmount !== 0) {
          transactions.push({
            date: this.formatDate(transactionDate) || new Date().toISOString().split('T')[0],
            type: transactionType,
            amount: transactionAmount,
            description: description,
            fund: fund.name,
            reference: this.getText(transactionNode, 'MisparAshrai, Eched')
          });
        }
      });
    });

    // Calculate percentages
    funds.forEach(fund => {
      fund.percentage = totalBalance > 0 ? (fund.balance / totalBalance) * 100 : 0;
    });

    // Calculate derived values
    const averageReturns = funds.reduce((acc, fund) => acc + (fund.returns * fund.percentage / 100), 0);
    const monthlyContribution = 2500; // Default - could be extracted from XML if available
    const employerContribution = 1800; // Default - could be extracted from XML if available
    
    // Extract personal details from XML
    const personalDetails = {
      name: xmlDoc.querySelector('PrateiAdam > ShemPrati, PrateyIsh > Shem')?.textContent?.trim() || 'לא צוין',
      id: xmlDoc.querySelector('PrateiAdam > TeuhatZehut, PrateyIsh > TeuhatZehut')?.textContent?.trim() || '',
      birthDate: this.formatDate(xmlDoc.querySelector('PrateiAdam > TaarichLeidah, TaarichLeida')?.textContent?.trim() || '') || '',
      employmentStartDate: this.formatDate(xmlDoc.querySelector('TaarichTchilathAvoda')?.textContent?.trim() || '') || ''
    };

    // Calculate retirement projections
    const currentAge = personalDetails.birthDate ? 
      new Date().getFullYear() - new Date(personalDetails.birthDate).getFullYear() : 35;
    const yearsToRetirement = Math.max(0, 67 - currentAge);
    const totalMonthlyContributions = monthlyContribution + employerContribution;
    
    // Simple compound growth calculation
    const projectedBalance = totalBalance + 
      (totalMonthlyContributions * 12 * yearsToRetirement) * 
      Math.pow(1 + (averageReturns / 100), yearsToRetirement);
    
    const monthlyPension = projectedBalance / (25 * 12); // Assuming 25 years of pension

    return {
      personalDetails,
      currentBalance: totalBalance,
      monthlyContribution,
      employerContribution,
      expectedRetirement: new Date(new Date().getFullYear() + yearsToRetirement, 0, 1).toISOString().split('T')[0],
      projectedBalance,
      monthlyPension,
      funds,
      transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      rawData: {
        provider: providerName,
        reportDate: this.formatDate(reportDate),
        fileName
      }
    };
  }

  static generateSampleData(): PensionData {
    return {
      personalDetails: {
        name: 'יוסי כהן',
        id: '123456789',
        birthDate: '1980-01-15',
        employmentStartDate: '2005-03-01'
      },
      currentBalance: 450000,
      monthlyContribution: 2500,
      employerContribution: 1800,
      expectedRetirement: '2047-01-15',
      projectedBalance: 1250000,
      monthlyPension: 8500,
      funds: [
        { 
          id: 'fund_1',
          name: 'קרן מקסימה', 
          provider: 'מנורה מבטחים',
          productType: '101',
          productDisplayName: 'פנסיה תעסוקתית',
          balance: 280000, 
          percentage: 62.2, 
          returns: 7.2,
          fees: { managementFee: 0.5, investmentFee: 0.2, riskFee: 0.1 },
          lastUpdate: '15/01/2024',
          accountDetails: {
            accountNumber: '12345-678',
            policyNumber: 'POL-789456',
            accountType: 'פנסיה תעסוקתית'
          }
        },
        { 
          id: 'fund_2',
          name: 'קרן צמיחה', 
          provider: 'מנורה מבטחים',
          productType: '102',
          productDisplayName: 'קופת גמל לפנסיה',
          balance: 120000, 
          percentage: 26.7, 
          returns: 6.8,
          fees: { managementFee: 0.4, investmentFee: 0.25, riskFee: 0.05 },
          lastUpdate: '15/01/2024',
          accountDetails: {
            accountNumber: '12345-679',
            policyNumber: 'POL-789457',
            accountType: 'קופת גמל לפנסיה'
          }
        },
        { 
          id: 'fund_3',
          name: 'קרן יציבה', 
          provider: 'מנורה מבטחים',
          productType: '103',
          productDisplayName: 'קרן פנסיה',
          balance: 50000, 
          percentage: 11.1, 
          returns: 4.5,
          fees: { managementFee: 0.3, investmentFee: 0.15, riskFee: 0.0 },
          lastUpdate: '15/01/2024',
          accountDetails: {
            accountNumber: '12345-680',
            policyNumber: 'POL-789458',
            accountType: 'קרן פנסיה'
          }
        }
      ],
      transactions: [
        { date: '2024-01-01', type: 'הפקדה', amount: 2500, description: 'הפקדה חודשית', fund: 'קרן מקסימה' },
        { date: '2024-01-01', type: 'הפקדת מעביד', amount: 1800, description: 'השתתפות מעביד', fund: 'קרן מקסימה' },
        { date: '2023-12-01', type: 'הפקדה', amount: 2500, description: 'הפקדה חודשית', fund: 'קרן מקסימה' },
        { date: '2023-12-01', type: 'הפקדת מעביד', amount: 1800, description: 'השתתפות מעביד', fund: 'קרן צמיחה' },
        { date: '2023-11-01', type: 'תשואה', amount: 3200, description: 'רווח חודשי', fund: 'קרן מקסימה' },
      ],
      rawData: {
        provider: 'מנורה מבטחים',
        reportDate: '15/01/2024',
        fileName: 'sample_data.xml'
      }
    };
  }
}
