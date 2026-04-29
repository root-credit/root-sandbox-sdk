# Roosterwise shadcn/ui Component Usage Guide

## Quick Reference

### Available Components in `components/ui/`

| Component | File | Usage | Status |
|-----------|------|-------|--------|
| Card | `card.tsx` | Dashboard stats, module tiles, containers | ✅ Active |
| Button | `button.tsx` | CTAs, form submissions, navigation | ✅ Active |
| Badge | `badge.tsx` | Status labels (Settled, Pending, etc.) | ✅ Active |
| Input | `input.tsx` | Form fields (email, password, etc.) | ✅ Active |
| Label | `label.tsx` | Form labels | ✅ Active |
| Table | `table.tsx` | Transaction ledgers, staff/payout lists | ✅ Active |
| Dialog | `dialog.tsx` | Modals, confirmations | ✅ Active |
| Separator | `separator.tsx` | Visual dividers | ✅ Active |

## Component Examples

### Card System
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Total Settled</CardTitle>
    <CardDescription>This month's settlements</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">$2,450.00</div>
  </CardContent>
</Card>
```

### Badge for Status
```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Settled</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Failed</Badge>
<Badge variant="outline">Processing</Badge>
```

### Button Variants
```tsx
import { Button } from '@/components/ui/button';

<Button>Process Settlements</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Learn More</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small Button</Button>
<Button size="lg">Large Button</Button>
<Button size="icon">🔔</Button>
```

### Table for Transactions
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Date</TableHead>
      <TableHead>Amount</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>2024-04-29</TableCell>
      <TableCell>$125.50</TableCell>
      <TableCell><Badge>Settled</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Form with Input & Label
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

<div className="space-y-4">
  <div>
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="you@restaurant.com" />
  </div>
  <Button type="submit">Sign In</Button>
</div>
```

### Dialog Modal
```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Settings</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Account Settings</DialogTitle>
      <DialogDescription>Update your profile information</DialogDescription>
    </DialogHeader>
    <div>{/* Form content */}</div>
    <DialogFooter>
      <Button>Save Changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Current Usage in Roosterwise

### Dashboard Page (`app/dashboard/page.tsx`)
- **StatTile Component**: Uses `Card`, `CardHeader`, `CardDescription`, `CardContent`
  - Displays: Active Locations, Total Settled, Transactions
  - Accent styling for primary metrics

- **ModuleTile Component**: Uses `Card`, `Badge`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
  - Four modules: Tip Settlements (primary), Service Staff, Settlement Ledger, Locations & Fund
  - Icons and descriptions for each section
  - Interactive hover states

### DashboardLayout (`components/DashboardLayout.tsx`)
- **DashboardSidebar**: Uses `Button`, `Separator`
  - Collapsible navigation with smooth transitions
  - Active state highlighting
  - Collapse/expand toggle

## Color Variants & Theming

### Semantic Classes
- `bg-background` / `bg-slate-950` (dark mode default)
- `text-foreground` / `text-slate-50` (dark mode text)
- `border-slate-200` / `border-slate-800` (dark mode borders)
- `bg-amber-50` / `bg-amber-950` (accent highlights)
- `text-amber-600` / `text-amber-400` (accent text)

### Button Variants
```tsx
// Primary action (dark slate background)
<Button>Default Action</Button>

// Outlined (transparent with border)
<Button variant="outline">Optional Action</Button>

// Ghost (minimal styling)
<Button variant="ghost">Tertiary Action</Button>

// Destructive (red/danger styling)
<Button variant="destructive">Delete Account</Button>

// Link styling (underlined text)
<Button variant="link">Learn More</Button>
```

### Badge Variants
```tsx
<Badge variant="default">Settled</Badge>          {/* Dark background */}
<Badge variant="secondary">Pending</Badge>       {/* Gray background */}
<Badge variant="destructive">Failed</Badge>      {/* Red background */}
<Badge variant="outline">Processing</Badge>      {/* Outline only */}
```

## Dark Mode Support

All components include built-in dark mode classes:
- `dark:bg-slate-950`
- `dark:text-slate-50`
- `dark:border-slate-800`
- `dark:focus-visible:ring-slate-300`

Dark mode is automatically applied via Tailwind CSS v4's `@media (prefers-color-scheme: dark)` support.

## Responsive Design

### Card-Based Layouts
```tsx
// Dashboard stats: 1 column on mobile, 3 on desktop
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <StatTile />
</div>

// Module tiles: 1 on mobile, 2 on tablet, 4 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <ModuleTile />
</div>
```

## Accessibility Features

- **Focus States**: All interactive elements have visible focus rings
- **Semantic HTML**: Proper heading hierarchy (h1, h2, h3)
- **Color Contrast**: WCAG AA compliant colors
- **ARIA Labels**: Dialog close buttons have `sr-only` text
- **Keyboard Navigation**: Tab support for all interactive elements

## Future Component Additions

Recommended next components to implement:

1. **Breadcrumb** (`breadcrumb.tsx`)
   - For dashboard page hierarchy
   - Usage: Dashboard > Payouts > Settlement #123

2. **Select** (`select.tsx`)
   - For dropdowns (location selection, date ranges)
   - Based on Radix UI `@radix-ui/react-select`

3. **Tabs** (`tabs.tsx`)
   - For multi-view layouts (Overview, Analytics, Settings)
   - Based on Radix UI `@radix-ui/react-tabs`

4. **Stepper** (`stepper.tsx`)
   - For onboarding workflows (bank linking, staff import)
   - Custom implementation

5. **Alert** (`alert.tsx`)
   - For system notifications
   - Warning, error, success, info variants

6. **Chart** (`chart.tsx`)
   - For settlements over time, location comparisons
   - Recharts integration with custom styling

7. **Tooltip** (`tooltip.tsx`)
   - For hover help text
   - Based on Radix UI `@radix-ui/react-tooltip`

## CSS Utilities

All components use the `cn()` utility function from `lib/utils.ts`:
```tsx
import { cn } from '@/lib/utils';

// Merge Tailwind classes intelligently
cn(
  "base classes",
  condition && "conditional classes",
  className // override from props
)
```

This ensures:
- No conflicting Tailwind utilities
- Proper class precedence
- Clean prop override patterns

---

**For detailed implementation examples, see the components in `components/ui/` and their usage in `app/dashboard/page.tsx`.**
