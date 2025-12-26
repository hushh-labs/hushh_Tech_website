# Claude Code Workflow Guide for hushhTech

This guide explains how to use Claude Code effectively in the hushhTech development workflow.

## Installation

### Step 1: Install Claude Code

Run the following command in your terminal:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### Step 2: Verify Installation

After installation, verify Claude Code is working:

```bash
claude --version
```

### Step 3: Authenticate

Claude Code will prompt you to authenticate with your Anthropic account on first use.

## Getting Started

### Launch Claude Code

Navigate to your project directory and start Claude Code:

```bash
cd /Users/ankitkumarsingh/hushhTech
claude
```

Claude Code will automatically read the `CLAUDE.md` file and understand your project context.

## IDE Integration

### VS Code Extension

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X)
3. Search for "Claude Code"
4. Click Install
5. Restart VS Code

### Access in VS Code

- **Command Palette**: `Cmd+Shift+P` → "Claude Code"
- **Keyboard Shortcut**: Configure in VS Code settings

## Common Workflows

### 1. Code Exploration

Ask Claude Code to explain parts of the codebase:

```
> Explain how the investor onboarding flow works
> What Supabase tables are used for KYC?
> How does authentication work in this app?
```

### 2. Feature Development

Describe what you want to build:

```
> Create a new page for displaying fund performance charts
> Add a dark mode toggle to the navbar
> Implement email notification when KYC is complete
```

### 3. Bug Fixing

Describe the bug and let Claude Code investigate:

```
> The login button doesn't work on mobile - can you investigate?
> Users are seeing a blank screen on the onboarding Step5 page
> The investor profile isn't saving to Supabase
```

### 4. Code Refactoring

Ask for improvements:

```
> Refactor the InvestorProfileForm component to be more modular
> Optimize the performance of the community posts list
> Add TypeScript types to the utils folder
```

### 5. Testing

Generate and run tests:

```
> Create test cases for the investor profile API
> What should I test before deploying the KYC feature?
```

## Best Practices

### Be Specific

❌ "Fix the bug"
✅ "The signup form throws an error when email contains a plus sign"

### Provide Context

❌ "Add a button"
✅ "Add a 'Download PDF' button to the investor profile page that exports the profile as a PDF"

### Iterate

Start with small changes, test, then expand. Claude Code works best with incremental development.

### Review Changes

Always review the changes Claude Code suggests before committing:

```bash
git diff
```

## Project-Specific Tips

### Working with Supabase Edge Functions

When creating or modifying Edge Functions:

```
> Create a new Edge Function called 'send-welcome-email' that:
> - Accepts userId in the request body
> - Fetches user email from auth.users
> - Sends a welcome email via EmailJS
> - Returns success/error status
```

### Mobile Development

For Capacitor mobile issues:

```
> The deep link for OAuth isn't working on iOS
> Help me debug the Android build failure
> Add haptic feedback to the primary CTA buttons
```

### Responsive Design

Always mention device testing:

```
> Add a new fund card component that works on mobile (320px), tablet (768px), and desktop (1024px+)
```

## Troubleshooting

### Claude Code Not Recognizing Project

Ensure you're in the correct directory:

```bash
pwd  # Should show /Users/.../hushhTech
```

### Slow Responses

For large codebases, Claude Code may take time to analyze. Be patient on first queries.

### Out of Date Context

If Claude Code seems confused about recent changes:

```
> /refresh  # Refresh project context
```

## Security Notes

- Never share your Claude Code authentication tokens
- Don't ask Claude Code to commit sensitive data
- Review all changes before pushing to remote
- Use `.env.local` for secrets (already in `.gitignore`)

## Quick Reference Commands

| Command | Description |
|---------|-------------|
| `claude` | Start Claude Code in terminal |
| `claude "query"` | Quick query without entering interactive mode |
| `claude --help` | Show help and available commands |

## Integration with GitHub

Claude Code can help with PR workflows:

```
> Review the changes in the current branch
> Write a PR description for the investor profile feature
> What files were changed and why?
```

## Team Collaboration

Share effective prompts with your team. Document prompts that work well for common tasks in this guide.

### Example Prompts Library

**Adding a New Page**:
```
> Create a new page at /about-us with:
> - Hero section with company mission
> - Team member cards (responsive grid)
> - Contact form at the bottom
> - Proper SEO metadata
```

**API Integration**:
```
> Connect the investor dashboard to the stock-quotes Edge Function
> Display real-time price updates with loading states
```

**Debugging**:
```
> The console shows "Cannot read property 'map' of undefined" 
> on the community posts page. Help me find and fix the issue.
```

## Support

- Claude Code Docs: https://docs.anthropic.com/claude-code
- Project-specific questions: Check `CLAUDE.md` in project root
- Report issues: Use `/reportbug` command
