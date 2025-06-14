'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Copy, Check, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { FeatureCard } from '@/components/feature-card'

export default function StyleGuidePage() {
  const { theme, setTheme } = useTheme()
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const copyToClipboard = async (text: string, colorName: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedColor(colorName)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  // Finely brand colors as defined in globals.css
  const brandColors = [
    {
      name: 'Primary',
      className: 'bg-primary',
      description: 'Main brand color',
      hslValue: '198 100% 38%',
      hexValue: '#0284C7',
      usage: 'Primary actions, links, key elements'
    },
    {
      name: 'Income',
      className: 'bg-income',
      description: 'Positive financial indicators',
      hslValue: '122 55% 45%',
      hexValue: '#22C55E',
      usage: 'Income amounts, positive trends'
    },
    {
      name: 'Expense',
      className: 'bg-expense',
      description: 'Negative financial indicators',
      hslValue: '0 84% 60%',
      hexValue: '#EF4444',
      usage: 'Expense amounts, alerts, warnings'
    },
    {
      name: 'Upcoming',
      className: 'bg-upcoming',
      description: 'Pending or upcoming items',
      hslValue: '45 93% 47%',
      hexValue: '#EAB308',
      usage: 'Upcoming bills, pending transactions'
    }
  ]

  // System colors from shadcn/ui
  const systemColors = [
    { name: 'Background', className: 'bg-background', description: 'Main background' },
    { name: 'Foreground', className: 'bg-foreground', description: 'Main text color' },
    { name: 'Card', className: 'bg-card', description: 'Card backgrounds' },
    { name: 'Secondary', className: 'bg-secondary', description: 'Secondary elements' },
    { name: 'Muted', className: 'bg-muted', description: 'Muted backgrounds' },
    { name: 'Accent', className: 'bg-accent', description: 'Accent color' },
    { name: 'Destructive', className: 'bg-destructive', description: 'Destructive actions' },
    { name: 'Border', className: 'bg-border', description: 'Border color' }
  ]

  // Typography examples
  const typographyExamples = [
    { tag: 'h1', className: 'text-4xl font-bold tracking-tight', text: 'Heading 1 - Page Title' },
    { tag: 'h2', className: 'text-3xl font-semibold tracking-tight', text: 'Heading 2 - Section Title' },
    { tag: 'h3', className: 'text-2xl font-semibold', text: 'Heading 3 - Subsection' },
    { tag: 'h4', className: 'text-xl font-semibold', text: 'Heading 4 - Component Title' },
    { tag: 'p', className: 'text-base leading-7', text: 'Body text - This is the default paragraph style used throughout the application.' },
    { tag: 'small', className: 'text-sm text-muted-foreground', text: 'Small text - Used for captions and secondary information.' }
  ]

  // Diagnostic function to identify potentially off-brand color usage
  const potentialIssues = [
    'bg-blue-500', 'text-blue-500', 'bg-blue-600', 'text-blue-600',
    'bg-green-500', 'text-green-500', 'bg-green-600', 'text-green-600',
    'bg-red-500', 'text-red-500', 'bg-red-600', 'text-red-600',
    'bg-yellow-500', 'text-yellow-500', 'bg-yellow-600', 'text-yellow-600',
    'bg-gray-500', 'text-gray-500', 'bg-gray-600', 'text-gray-600',
    'bg-slate-500', 'text-slate-500', 'bg-zinc-500', 'text-zinc-500'
  ]

  const brandRecommendations: Record<string, string> = {
    'bg-blue-500': 'bg-primary',
    'text-blue-500': 'text-primary',
    'bg-blue-600': 'bg-primary',
    'text-blue-600': 'text-primary',
    'bg-green-500': 'bg-income',
    'text-green-500': 'text-income',
    'bg-green-600': 'bg-income',
    'text-green-600': 'text-income',
    'bg-red-500': 'bg-expense',
    'text-red-500': 'text-expense',
    'bg-red-600': 'bg-expense',
    'text-red-600': 'text-expense',
    'bg-yellow-500': 'bg-upcoming',
    'text-yellow-500': 'text-upcoming',
    'bg-yellow-600': 'bg-upcoming',
    'text-yellow-600': 'text-upcoming',
    'bg-gray-500': 'bg-muted',
    'text-gray-500': 'text-muted-foreground',
    'bg-gray-600': 'bg-muted',
    'text-gray-600': 'text-muted-foreground',
    'bg-slate-500': 'bg-muted',
    'text-slate-500': 'text-muted-foreground',
    'bg-zinc-500': 'bg-muted',
    'text-zinc-500': 'text-muted-foreground'
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12" dir="ltr">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Finely Style Guide</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A comprehensive visual reference for maintaining consistent brand styling across the Finely landing experience.
        </p>
        
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-center gap-2">
          <Sun className="h-4 w-4" />
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
          <Moon className="h-4 w-4" />
          <span className="text-sm text-muted-foreground ml-2">Dark Mode</span>
        </div>
      </div>

      {/* Color Palette Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Color Palette</h2>
          <p className="text-muted-foreground">
            Finely brand colors defined in <code className="bg-muted px-1 py-0.5 rounded">globals.css</code> and <code className="bg-muted px-1 py-0.5 rounded">tailwind.config.ts</code>
          </p>
        </div>

        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Brand Colors
              <Badge variant="secondary">Primary Palette</Badge>
            </CardTitle>
            <CardDescription>
              Core Finely brand colors used for financial indicators and primary actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {brandColors.map((color) => (
                <Card key={color.name} className="overflow-hidden">
                  <div className={`h-24 ${color.className} relative group cursor-pointer`} 
                       onClick={() => copyToClipboard(color.hexValue, color.name)}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      {copiedColor === color.name ? (
                        <Check className="h-6 w-6 text-white" />
                      ) : (
                        <Copy className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{color.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{color.description}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Class:</span>
                        <code className="bg-muted px-1 rounded">{color.className}</code>
                      </div>
                      <div className="flex justify-between">
                        <span>HSL:</span>
                        <code className="bg-muted px-1 rounded">{color.hslValue}</code>
                      </div>
                      <div className="flex justify-between">
                        <span>HEX:</span>
                        <code className="bg-muted px-1 rounded">{color.hexValue}</code>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">{color.usage}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              System Colors
              <Badge variant="outline">shadcn/ui</Badge>
            </CardTitle>
            <CardDescription>
              Design system colors that adapt to light/dark mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {systemColors.map((color) => (
                <div key={color.name} className="space-y-2">
                  <div className={`h-16 rounded-md ${color.className} border`} />
                  <div>
                    <h5 className="font-medium text-sm">{color.name}</h5>
                    <p className="text-xs text-muted-foreground">{color.description}</p>
                    <code className="text-xs bg-muted px-1 rounded">{color.className}</code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Typography Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Typography</h2>
          <p className="text-muted-foreground">
            Font family: <code className="bg-muted px-1 py-0.5 rounded">Inter</code> with Tailwind typography utilities
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Text Styles</CardTitle>
            <CardDescription>
              Consistent typography hierarchy using Tailwind classes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {typographyExamples.map((example, index) => (
              <div key={index} className="space-y-2">
                <div className={example.className}>
                  {example.text}
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded block w-fit">
                  &lt;{example.tag} className="{example.className}"&gt;
                </code>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Buttons Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Buttons</h2>
          <p className="text-muted-foreground">
            Button variants using the shadcn/ui Button component with Finely brand colors
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>
              All button styles maintain accessibility and brand consistency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Primary Actions</h4>
                <div className="space-y-2">
                  <Button variant="default">Default Primary</Button>
                  <div className="text-xs text-muted-foreground">
                    Uses <code className="bg-muted px-1 rounded">bg-primary</code> - Finely brand blue
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Secondary Actions</h4>
                <div className="space-y-2">
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Destructive Actions</h4>
                <div className="space-y-2">
                  <Button variant="destructive">Destructive</Button>
                  <div className="text-xs text-muted-foreground">
                    Aligned with expense color palette
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Sizes</h4>
                <div className="space-y-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">States</h4>
                <div className="space-y-2">
                  <Button disabled>Disabled</Button>
                  <Button variant="link">Link Style</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cards & Layout Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Cards & Layout Blocks</h2>
          <p className="text-muted-foreground">
            Consistent card designs using shadcn/ui components and brand styling
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Card Examples</CardTitle>
            <CardDescription>
              Various card layouts demonstrating proper spacing and styling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Card</CardTitle>
                  <CardDescription>
                    Standard card with header and content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is a basic card layout using the shadcn/ui Card component.
                  </p>
                </CardContent>
              </Card>

              {/* Feature Card */}
              <FeatureCard
                icon={<div className="w-8 h-8 bg-primary rounded-full" />}
                title="Feature Card"
                description="Custom branded card component for highlighting features"
              />

              {/* Financial Indicator Cards */}
              <Card className="border-l-4 border-l-income">
                <CardHeader className="pb-2">
                  <CardTitle className="text-income">+$1,250.00</CardTitle>
                  <CardDescription>Monthly Income</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-expense">
                <CardHeader className="pb-2">
                  <CardTitle className="text-expense">-$850.00</CardTitle>
                  <CardDescription>Monthly Expenses</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Form Elements Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Form Elements</h2>
          <p className="text-muted-foreground">
            Form components with consistent styling and accessibility features
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>
              All form elements maintain brand consistency and accessibility standards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Input</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="select">Select Dropdown</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms" className="text-sm">
                    Accept terms and conditions
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="notifications" />
                  <Label htmlFor="notifications" className="text-sm">
                    Enable notifications
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Status Badges</Label>
                  <div className="flex gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Dark Mode Preview */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Dark Mode Preview</h2>
          <p className="text-muted-foreground">
            All components automatically adapt to dark mode while maintaining brand colors
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Theme Adaptation</CardTitle>
            <CardDescription>
              Brand colors remain consistent while system colors adapt to the selected theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Current theme:</strong> {theme || 'system'} - Toggle the switch above to see how all components adapt to dark mode.
                Finely brand colors (primary, income, expense, upcoming) remain consistent across themes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Brand Compliance Audit */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Brand Compliance</h2>
          <p className="text-muted-foreground">
            Guidelines for maintaining brand consistency in the Finely landing experience
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Recommended Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Use brand colors</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li><code className="bg-muted px-1 rounded">bg-primary</code> for main actions and links</li>
                <li><code className="bg-muted px-1 rounded">text-income</code> for positive financial values</li>
                <li><code className="bg-muted px-1 rounded">text-expense</code> for negative financial values</li>
                <li><code className="bg-muted px-1 rounded">text-upcoming</code> for pending items</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Use system colors</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li><code className="bg-muted px-1 rounded">bg-background</code>, <code className="bg-muted px-1 rounded">text-foreground</code> for main content</li>
                <li><code className="bg-muted px-1 rounded">text-muted-foreground</code> for secondary text</li>
                <li><code className="bg-muted px-1 rounded">bg-card</code> for card backgrounds</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Potential Issues to Avoid
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600">⚠ Avoid hardcoded colors</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>Don't use <code className="bg-muted px-1 rounded">bg-blue-500</code> instead of <code className="bg-muted px-1 rounded">bg-primary</code></li>
                <li>Don't use <code className="bg-muted px-1 rounded">text-gray-600</code> instead of <code className="bg-muted px-1 rounded">text-muted-foreground</code></li>
                <li>Don't use <code className="bg-muted px-1 rounded">bg-red-500</code> instead of <code className="bg-muted px-1 rounded">bg-expense</code></li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600">⚠ Maintain accessibility</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>Ensure sufficient color contrast ratios</li>
                <li>Don't rely solely on color to convey information</li>
                <li>Test all components in both light and dark mode</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Diagnostic Section */}
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <AlertTriangle className="h-5 w-5" />
              Quick Color Audit
            </CardTitle>
            <CardDescription>
              Common off-brand color classes that should be replaced with Finely brand equivalents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The following are examples of common Tailwind colors that should be replaced with brand-specific alternatives:
              </p>
              
              <div className="space-y-3">
                {potentialIssues.slice(0, 8).map((issue) => (
                  <div key={issue} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-3">
                      <code className="text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                        {issue}
                      </code>
                      <span className="text-sm text-muted-foreground">→</span>
                      <code className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                        {brandRecommendations[issue]}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tip:</strong> Use your browser's developer tools to search for these class names in your components. 
                  Replace them with the brand-appropriate alternatives shown above.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          This style guide ensures consistent brand experience across the Finely landing site.
          All colors and components follow the design system defined in{' '}
          <code className="bg-muted px-1 py-0.5 rounded">tailwind.config.ts</code> and{' '}
          <code className="bg-muted px-1 py-0.5 rounded">globals.css</code>.
        </p>
      </div>
    </div>
  )
}
