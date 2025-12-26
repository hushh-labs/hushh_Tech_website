 n\h8]7[6-0987654321`\io][=p-1`";kiuh# CLAUDE.md - Claude Code Configuration for hushhTech

## Project Overview

**hushh.ai** is the main marketing website for Hushh Technologies - a data privacy and AI company focused on user empowerment, data control, and ethical data monetization. The platform enables users to manage their digital identity and invest in AI-powered funds.

### Core Values
- Privacy-first technology with user consent
- Trust, security, and transparency
- Ethical data monetization
- User empowerment and data control

## Quick Start Commands

```bash
# Development
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build

# iOS Development
npm run ios:build        # Build and sync iOS
npm run ios:testflight   # Deploy to TestFlight

# Android Development
npm run android:build    # Build and sync Android
npm run android:playstore # Build for Play Store

# Supabase
npx supabase start       # Start local Supabase
npx supabase db push     # Push migrations
npx supabase functions serve  # Serve Edge Functions locally
```

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite (NOT Next.js App Router - uses react-router-dom)
- **UI**: Chakra UI + Tailwind CSS
- **Animations**: Framer Motion, Lottie
- **Forms**: React Hook Form
- **State**: React Context (avoid prop drilling)
- **i18n**: i18next with en, ar, fr, zh locales

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Edge Functions**: Deno-based Supabase Edge Functions
- **API**: Vercel Serverless Functions (in `/api` folder)

### Mobile
- **Framework**: Capacitor 8
- **Platforms**: iOS and Android
- **OAuth**: Custom deep link handling

## Project Structure

```
hushhTech/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components (react-router-dom routes)
│   ├── services/       # API services and business logic
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── theme/          # Chakra UI theme configuration
│   ├── i18n/           # Internationalization
│   │   └── locales/    # Translation files (en.json, ar.json, etc.)
│   └── content/        # MDX content and blog posts
├── supabase/
│   ├── functions/      # Deno Edge Functions
│   │   └── _shared/    # Shared utilities (CORS, etc.)
│   └── migrations/     # Database migrations
├── api/                # Vercel serverless functions
├── ios/                # iOS Capacitor project
├── android/            # Android Capacitor project
├── scripts/            # Build and deployment scripts
├── public/             # Static assets
└── docs/               # Documentation
```

## Code Conventions

### React Components
```tsx
// Use 'use client' sparingly - only for client-side interactions
// Prefer functional components with TypeScript

// Component naming: PascalCase
const InvestorProfile = () => {
  // Event handlers: prefix with 'handle'
  const handleSubmit = () => { };
  const handleClick = () => { };
  
  // State: use descriptive names with auxiliary verbs
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  return <div>...</div>;
};
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `InvestorProfileForm.tsx`)
- Utilities: `camelCase.ts` (e.g., `maskSensitiveData.ts`)
- Pages: `index.tsx` in folder (e.g., `pages/investor-profile/index.tsx`)
- Types: `camelCase.ts` (e.g., `investorProfile.ts`)

### Styling Priority
1. Chakra UI props (responsive arrays: `['sm', 'md', 'lg']`)
2. Tailwind CSS classes
3. Avoid inline styles

### Supabase Edge Functions
```typescript
// Located in: supabase/functions/{function-name}/index.ts
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // Function logic here
  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
```

## Important Guidelines

### DO ✅
- Keep files under 200 lines
- Write simple, modular, readable code
- Test on all device sizes (mobile-first)
- Use TypeScript types
- Implement proper error handling
- Add loading states for async operations
- Use semantic HTML for accessibility
- Optimize images and performance
- Write comments for complex logic

### DON'T ❌
- Use Next.js App Router patterns (this is Vite + React)
- Write overly complex code
- Skip responsive design testing
- Ignore TypeScript errors
- Leave TODO comments in production
- Use inline styles
- Commit without testing

## Key Integrations

### Supabase Tables
- `investor_profiles` - User investment profiles
- `onboarding_data` - Multi-step onboarding progress
- `kyc_sessions` - KYC verification data
- `chat_messages` - AI chat history

### Environment Variables
```bash
# Required in .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_OPENAI_API_KEY=xxx
VITE_EMAILJS_PUBLIC_KEY=xxx
```

### API Endpoints
- Vercel Functions: `/api/{function}.js`
- Supabase Edge: `https://{project}.supabase.co/functions/v1/{function}`

## Common Tasks

### Adding a New Page
1. Create folder: `src/pages/{page-name}/index.tsx`
2. Add route in `src/App.tsx`
3. Implement SEO with `react-helmet`
4. Test responsive design

### Adding a Supabase Function
1. Create folder: `supabase/functions/{function-name}/`
2. Add `index.ts` and `deno.json`
3. Import shared CORS headers
4. Deploy: `npx supabase functions deploy {function-name}`

### Mobile Build
```bash
# iOS
npm run ios:build
npm run ios:testflight

# Android
npm run android:build
npm run android:playstore
```

## Testing Checklist

Before submitting changes:
- [ ] Works on mobile (320px - 768px)
- [ ] Works on tablet (768px - 1024px)
- [ ] Works on desktop (1024px+)
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Loading states implemented
- [ ] Error handling in place
- [ ] Accessibility (keyboard nav, ARIA labels)

## Git Workflow

```bash
git add .
git commit -m "feat: brief description of changes"
git push
```

Commit message prefixes:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Styling changes
- `refactor:` - Code refactoring
- `test:` - Testing
- `chore:` - Maintenance

## Useful Documentation

- `IOS_BUILD_GUIDE.md` - iOS deployment
- `ANDROID_BUILD_GUIDE.md` - Android deployment
- `SUPABASE_ARCHITECTURE_OVERVIEW.md` - Database architecture
- `docs/MOBILE_UI_DESIGN_GUIDELINES.md` - Mobile UI patterns
- `APPLE_UI_GUIDELINES.md` - Apple design compliance

## Getting Help

When stuck:
1. Check existing documentation in project root
2. Search codebase for similar patterns
3. Review Supabase dashboard for database issues
4. Check Vercel dashboard for deployment issues

---

## 🧠 Hushh Intelligence Module (Clean Architecture + MVVM)

When working in `src/hushh-intelligence/`, follow these strict architectural rules:

### Directory Structure
```
src/hushh-intelligence/
├── core/           # ⚙️ NO external deps - pure TypeScript
│   ├── config/     # Environment & API config
│   ├── constants/  # App constants
│   ├── errors/     # Custom error classes
│   ├── types/      # Common TypeScript types
│   └── utils/      # Logger & utilities
├── domain/         # 📊 Business logic (NO React, NO libs)
│   ├── entities/   # Business objects
│   ├── repositories/ # Interface definitions
│   └── usecases/   # One class = One action
├── data/           # 💾 External data sources
│   ├── datasources/# API clients, local storage
│   ├── models/     # DTOs and mappers
│   └── repositories/ # Interface implementations
├── presentation/   # 🎨 React UI layer
│   ├── viewmodels/ # React hooks (state + logic)
│   ├── views/      # DUMB components (render only)
│   ├── pages/      # Route-level components
│   └── hooks/      # Custom React hooks
├── di/             # 💉 Dependency Injection
│   └── modules/    # Factories & providers
└── state/          # 🌐 Global State
    ├── stores/     # Zustand stores
    └── context/    # React contexts
```

### Layer Dependency Rule (CRITICAL!)
```
✅ Allowed: Presentation → Data → Domain → Core
❌ NEVER:   Core → Domain → Data → Presentation
```

### MVVM Pattern

**Views (Dumb Components)**
```tsx
// ✅ GOOD - View only renders what it receives
const AgentCard = ({ agent, onEdit }: Props) => (
  <div>
    <h1>{agent.name}</h1>
    <button onClick={onEdit}>Edit</button>
  </div>
);

// ❌ BAD - View has business logic
const AgentCard = () => {
  const [agent, setAgent] = useState();
  useEffect(() => { fetch('/api/agent')... }, []); // NO!
};
```

**ViewModels (React Hooks)**
```tsx
// ✅ GOOD - ViewModel handles state + logic
export const useAgentViewModel = () => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgent = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await getAgentUseCase.execute(id);
      setAgent(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { agent, isLoading, error, fetchAgent };
};
```

**Use Cases (Single Responsibility)**
```tsx
// ✅ GOOD - One class, one action
export class GetAgentUseCase {
  constructor(private repository: IAgentRepository) {}
  
  async execute(id: string): Promise<Agent> {
    return this.repository.getById(id);
  }
}

// ❌ BAD - Multiple responsibilities
export class AgentUseCase {
  getAgent() {}
  updateAgent() {}
  deleteAgent() {}
}
```

### File Naming Conventions
| Type | Pattern | Example |
|------|---------|---------|
| Entity | `PascalCase.ts` | `Agent.ts` |
| Use Case | `VerbNounUseCase.ts` | `GetAgentUseCase.ts` |
| Repository Interface | `INounRepository.ts` | `IAgentRepository.ts` |
| Repository Impl | `NounRepositoryImpl.ts` | `AgentRepositoryImpl.ts` |
| ViewModel | `useNounViewModel.ts` | `useAgentViewModel.ts` |
| View | `NounComponent.tsx` | `AgentCard.tsx` |

### Import Rules
```tsx
// ✅ GOOD - Layer-appropriate imports
import { Agent } from '../domain/entities/Agent';
import { GetAgentUseCase } from '../domain/usecases/agent/GetAgentUseCase';

// ❌ BAD - Crossing layer boundaries
// In domain layer:
import { useState } from 'react'; // NO REACT IN DOMAIN!
import { supabase } from '@/lib/supabase'; // NO SUPABASE IN DOMAIN!
```

### Code Quality Checklist for hushh-intelligence
- [ ] Domain layer has NO React imports
- [ ] Views don't call APIs directly
- [ ] Use Cases have single responsibility
- [ ] Repository interfaces are in `domain/repositories/`
- [ ] DTOs have mappers to domain entities
- [ ] ViewModels use hooks, not class components
- [ ] All async operations have error handling

### Documentation
- `src/hushh-intelligence/README.md` - Full architecture guide
- `.cursor/rules/clean-architecture-rules.mdc` - Auto-enforced rules
