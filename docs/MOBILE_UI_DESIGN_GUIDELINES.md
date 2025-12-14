# 📱 HUSHH Mobile UI/UX Design Guidelines

> A comprehensive guide synthesized from Apple Human Interface Guidelines, industry best practices, and expert UI/UX design principles.

**Version:** 1.0  
**Last Updated:** December 2024  
**Applies to:** iOS, iPadOS, Web (Mobile-first)

---

## Table of Contents

1. [Foundation Principles](#1-foundation-principles)
2. [Human Interface Philosophy](#2-human-interface-philosophy)
3. [Core Design Principles](#3-core-design-principles)
4. [Information Architecture](#4-information-architecture)
5. [Tab Bar Guidelines](#5-tab-bar-guidelines)
6. [Hierarchical Navigation](#6-hierarchical-navigation)
7. [Spacing System](#7-spacing-system)
8. [Color System](#8-color-system)
9. [Typography](#9-typography)
10. [Visual Effects](#10-visual-effects)
11. [Content Organization](#11-content-organization)
12. [Component Specifications](#12-component-specifications)
13. [Modal Components Guide](#13-modal-components-guide)
14. [Animation Principles](#14-animation-principles)
15. [Live Activities & Dynamic Island](#15-live-activities--dynamic-island)
16. [Spatial Interactions](#16-spatial-interactions)
17. [iOS Design Fundamentals](#17-ios-design-fundamentals)
18. [Accessibility](#18-accessibility)
19. [React/Chakra UI Implementation](#19-reactchakra-ui-implementation)
20. [Design Checklist](#20-design-checklist)
21. [Atomic Design Methodology](#21-atomic-design-methodology)

---

## 1. Foundation Principles

### The Three Core Questions

Every screen in your app must clearly answer these questions:

| Question | What It Means | How to Achieve |
|----------|---------------|----------------|
| **"Where am I?"** | Clear context and orientation | Title/header, breadcrumbs, highlighted tab |
| **"What can I do?"** | Actions should be obvious | Visible buttons, clear CTAs, discoverable gestures |
| **"Where can I go?"** | Clear navigation paths | Navigation bars, back buttons, link styling |

### Timeless Design Principles (Apple HIG since 1987)

1. **Metaphors of the Real World**
   - Use concrete, familiar metaphors
   - Apply real-world expectations to digital interfaces
   - Make abstract concepts tangible

2. **Direct Manipulation**
   - Users feel in charge of the app
   - Immediate feedback on actions
   - Reversible operations where possible

3. **Recognition Over Recall**
   - Show options rather than requiring memory
   - Use familiar icons and patterns
   - Provide visual hints and suggestions

4. **Consistency**
   - Internal consistency within your app
   - External consistency with platform conventions
   - Predictable behavior across all screens

---

## 2. Human Interface Philosophy

> "The goal isn't to make a beautiful app, or a well-organized app, or a simple app. Those things are all really important, but they're not the real goal. The real goal is about serving the human beings or positively affecting the lives of the people who use your apps." — Mike Stern, Apple Design Evangelism

### Why "Human Interface"

Apple uses "Human Interface" rather than "User Interface" deliberately:

| Term | Connotation | Focus |
|------|-------------|-------|
| **User** | Clinical, anonymous | Defines people narrowly in relation to interface |
| **Human** | Nuanced, complete | Acknowledges imperfections, compassion, kindness |

When we design, we're serving other **human beings**. The only thing that really matters is how well your app satisfies the emotional and practical needs of the people you're designing for.

### Core Human Needs Design Should Fulfill

| Need | Description | How Design Fulfills It |
|------|-------------|------------------------|
| **Safety & Predictability** | Feeling secure, knowing what to expect | Clear feedback, consistent behavior, reversible actions |
| **Knowledge & Understanding** | Making informed choices | Clear information, helpful guidance |
| **Accomplishment** | Achieving personal/professional goals | Streamlined workflows, efficient task completion |
| **Beauty & Joy** | Experiencing delight | Aesthetically pleasing, enjoyable experience |

### Signs of Human-Centered Design

When an app makes people feel this way, they sense the **humanity** of the designers:

- Everything is there for a purpose
- Everything is understandable
- It just feels so **human**
- You can tell the people who made it fully considered your needs
- You sense all the time and effort that went into helping you succeed

### The 80/20 Rule in Design

This principle says roughly 80% of effects come from 20% of causes:

- **80% of benefit** comes from **20% of actions**
- **80% of users** only use **20% of features**

**Application:**
- Use progressive disclosure to hide the less important 80%
- Make the most useful 20% of functions easier to find
- Reduce clutter and simplify decision-making for novices
- Advanced users can reveal additional options when needed

---

## 3. Core Design Principles

Design principles express core truths about human perception, cognition, and communication. They are universal and timeless.

### Wayfinding

Your app is a wayfinding system. Every screen must answer:

| Question | Purpose | Examples |
|----------|---------|----------|
| **Where am I?** | Orientation | Nav bar title, selected tab, breadcrumbs |
| **Where can I go?** | Options | Tab bar, menu items, visible links |
| **What will I find there?** | Expectation | Labels, icons, preview text |
| **What's nearby?** | Context | Related items, nearby sections |
| **How do I get out?** | Exit path | Back button, close button, home |

Without answers to these questions, people will feel lost.

### Feedback

Cars provide a model for understanding feedback importance—both must be clear, immediate, and understandable:

| Feedback Type | Purpose | App Example |
|---------------|---------|-------------|
| **Status** | Current state | Unread badges, recording indicator, sync status |
| **Completion** | Action succeeded | Sound, animation, checkmark |
| **Warning** | Potential problem | Low battery, weak password, expiring session |
| **Error** | Something failed | Form validation, network error, permission denied |

**The Conversation Test:**
1. Have someone use your app who's never seen it
2. Have them tell you what's confusing
3. Explain to them how it works
4. Compare your explanation to what the app communicates
5. Your words fill gaps in your design—capture that experience

### Visibility

> "The usability of a design is greatly improved when controls and information are clearly visible."

**Critical information must be visible without moving:**
- Badges provide status at a glance
- Navigation should be visible, not hidden in hamburger menus
- Surface key information at higher levels

**Trade-off:** Balance visibility against overwhelming density. Dense interfaces slow decision-making for new users.

### Consistency

**External Consistency:**
- Match platform conventions (icons, terminology, navigation)
- Be consistent with what users already know from iOS

**Internal Consistency:**
- Glyphs share consistent visual style
- Limited font faces, sizes, colors
- Deliberate, thoroughly considered choices

```tsx
// ✅ Use platform-standard icons
const shareIcon = "square.and.arrow.up"; // iOS "sharrow"

// ❌ Don't use unfamiliar alternatives
const shareIcon = "share-alt"; // Confusing for iOS users
```

**Rule:** Be consistent unless you have a very strong justification to do otherwise.

### Mental Models

People have mental models of every system they've used:

| Model Type | What It Represents |
|------------|-------------------|
| **System Model** | How a system works internally |
| **Interaction Model** | How to interact with the system |

**When system matches mental model → "Intuitive"**
**When system doesn't match → "Unintuitive"**

**Warning:** Changing a well-established mental model is risky. Even if your new design is objectively better, users will struggle with changes to long-lived products.

### Proximity & Grouping

**Proximity Principle:**
The closer a control is to an object, the more we assume a connection.

```
✅ Good: Light switch in the room it controls
❌ Bad: Light switch in another room
```

**Grouping Principle:**
Related controls should be grouped together. Unrelated controls should be separated.

```tsx
// Group related tools
<ToolGroup>
  <BoldButton />
  <ItalicButton />
  <UnderlineButton />
</ToolGroup>

// Separate unrelated tools
<Separator />

<ToolGroup>
  <AlignLeftButton />
  <AlignCenterButton />
  <AlignRightButton />
</ToolGroup>
```

### Mapping

Controls should resemble the objects they affect:

| Control | Object | Mapping |
|---------|--------|---------|
| Horizontal slider | Horizontal property | Matches direction |
| Dial | Rotation | Matches circular motion |
| Up/down arrows | Volume | Matches more/less concept |

**Best mapping = Direct manipulation** (drag the object itself).

### Affordances

Physical characteristics provide cues about possible interactions:

```tsx
// Button looks tappable
<Button 
  bg="blue.500"
  borderRadius="lg"
  boxShadow="md"  // Lifted appearance = tappable
/>

// Slider knob looks draggable
<SliderTrack>
  <SliderThumb boxShadow="md" />  // Separated = movable
</SliderTrack>
```

**Signs of weak affordance:**
- People interact in unsupported ways
- People confuse controls for non-interactive elements
- You need labels to explain what's clickable

### Progressive Disclosure

Gradually ease people from simple to complex:

```
Level 1: Basic options (what 80% need)
├── Print
├── Number of copies
└── Page range

Level 2: Advanced options (click to expand)
├── Paper size
├── Quality
├── Two-sided printing
└── Color management
```

**Benefits:**
- Novices aren't overwhelmed
- Advanced users can find what they need
- Less chance of accidental misconfiguration

### Symmetry

Humans perceive symmetry as aesthetically pleasing, stable, and orderly:

| Type | Description | Example |
|------|-------------|---------|
| **Reflectional** | Mirror across axis | Centered layouts |
| **Rotational** | Same when rotated | Dial controls |
| **Translational** | Repeated patterns | Grid of cards |

**In UI:**
- Center key elements along median line
- Counter-balance elements visually
- Use even repetition for structure

---

## 4. Information Architecture

### The IA Process

```
Step 1: List Everything
└── Features, workflows, nice-to-haves, edge cases

Step 2: Understand User Context
├── When will they use it?
├── Where will they be?
├── What's their mental state?
└── What helps vs. hinders them?

Step 3: Clean Up
├── Remove non-essential features
├── Rename unclear items
└── Group related functionality

Step 4: Simplify
└── Sharpen the app's core purpose
```

### Grouping Strategies

| Strategy | Use Case | Example |
|----------|----------|---------|
| **By Time** | Recent activity, history | "Continue Watching", "Recent Files" |
| **By Seasonality** | Current events, trending | "Summer Collection", "Holiday Picks" |
| **By Progress** | Incomplete tasks | "Drafts", "In Progress", "Almost Done" |
| **By Patterns** | Related content | "Similar Items", "Recommended For You" |

---

## 5. Tab Bar Guidelines

> Tab bars are a global navigation control that sit at the bottom of the screen, categorizing an app's content into different sections.

### Purpose of Tab Bars

Think of tabs as a control to reflect your **information hierarchy**. They represent your **top-level content**.

### Good Tab Bar Design

Without seeing content, tabs should hint at functionality and tell a story:

| App | Tab Labels | What It Communicates |
|-----|------------|----------------------|
| Music | Listen Now, Radio, Library | Auditory media, content-rich |
| Photos | Library, For You, Albums | Visual content, personalization |
| Slopes | Record, Logbook, Resorts, Friends | Focused sports app functionality |

**Great Example: Slopes App (Apple Design Award Winner)**
- Lands on middle tab (Logbook) with season stats
- Each tab is specific and easy to understand
- Labels are representative of content

### Tab Bar Rules

✅ **DO:**
- Use for navigation between **major sections only**
- Maximum **5 tabs** (ideally 3-4)
- Use **SF Symbols** for familiar icons
- Label with **explicit, descriptive text**
- Create **balance** — distribute functionality across tabs
- Keep tab bar **persistently anchored** at bottom

❌ **DON'T:**
- Put actions (like "Add" or "Create") in tab bar
- Use vague labels like "More" or "Menu"
- Mix navigation and actions
- Force automatic tab changes
- Hide the tab bar during navigation
- Duplicate functionality across tabs

### The "Home Tab" Anti-Pattern

**Avoid creating a "Home" tab** that consolidates features from other tabs:

```
❌ Anti-Pattern:
┌─ Home Tab ──────────────────────────┐
│  - Quick itinerary (from Itineraries)│
│  - Recent routes (from Places)       │
│  - Friend activity (from Friends)    │
└─────────────────────────────────────┘

Problems:
- Duplicates functionality
- Creates confusion about where things belong
- Features fight for real estate
- Disrupts information hierarchy
```

**Instead, distribute features across dedicated tabs:**

```tsx
// ✅ Good: Balanced, purposeful tabs
const cyclingAppTabs = [
  { label: "Places", icon: "map" },      // Routes by location
  { label: "Itineraries", icon: "list" }, // Trip planning
  { label: "Activity", icon: "chart" },   // Stats and history
  { label: "Friends", icon: "person.2" }, // Social features
];
```

### Never Auto-Switch Tabs

Tapping an element within a view should **never** transport someone to another tab. This is:
- Jarring and disorienting
- Breaks mental model of where content belongs
- Loses context from current tab

### Tab Bar Persistence

The tab bar **must remain visible** during hierarchical navigation:

```
Home → Category → Item Detail
  ↓       ↓           ↓
[Tab bar visible at all levels]
```

**Benefits:**
- Access to multiple top-level hierarchies
- Context preservation across tabs
- Easy comparison between different areas

---

## 6. Hierarchical Navigation

Hierarchical navigation moves people through an app's content levels using **push transitions**.

### Push Transitions

When drilling into content, the next screen **slides in from right to left**:

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│ List     │ → │ Detail   │ → │ SubDetail│
│          │    │  ← Back  │    │  ← Detail│
└──────────┘    └──────────┘    └──────────┘
```

**Characteristics:**
- Reflects information hierarchy literally
- Content becomes more specific as you drill in
- Fewer options at each level
- Back button shows previous screen title

### When to Use Push Transitions

1. **Traversing hierarchy levels** (list → detail)
2. **Disclosure indicators present** (chevrons)
3. **Frequent navigation** between content
4. **App-switching context** (users may leave and return)

### Navigation Bar Orientation

The navigation bar orients people in your hierarchy:

```
┌───────────────────────────────────────┐
│  ← Places  │    San Francisco    │ ⋯ │
└───────────────────────────────────────┘
     ↑                ↑                ↑
 Back label     Current title    Actions
 (previous)
```

**The back button changes** to reflect where you came from:

- `← Places` → at city level
- `← San Francisco` → at route level
- `← Route Details` → at sub-detail level

### Disclosure Indicators (Chevrons)

Chevrons **must** use push transitions:

```tsx
// ✅ Chevron = Push transition
<ListItem 
  rightIcon={<ChevronRight />}
  onClick={() => navigate.push("/detail")}
/>

// ❌ Don't: Chevron with modal
<ListItem 
  rightIcon={<ChevronRight />}
  onClick={() => openModal()}  // Misleading!
/>
```

### RTL Language Support

In right-to-left languages (Arabic, Hebrew), the push direction is **flipped**:

```
LTR: Screen slides LEFT (→ direction indicates progress)
RTL: Screen slides RIGHT (← direction indicates progress)
```

### Push vs Modal: Decision Guide

| Scenario | Use |
|----------|-----|
| Drilling into hierarchy | **Push** |
| Frequent back-and-forth | **Push** |
| Significant time in view | **Push** |
| App-switching during task | **Push** |
| Self-contained task | Modal |
| Focused workflow | Modal |
| Confirmation needed | Modal |

**Example: Messages App**
Even with flat hierarchy, pushing allows fluid movement between chats. Modals would feel overcomplicated.

---

## 7. Spacing System

### The 8-Pixel Grid

All spacing values should be divisible by 8:

```
4px   - Micro spacing (icons to text)
8px   - Small spacing (between elements)
16px  - Medium spacing (within cards)
24px  - Large spacing (between sections)
32px  - XL spacing (major sections)
48px  - XXL spacing (page margins)
```

### The Outside-In Method

Design spacing from the outside in, with each layer getting smaller:

```
┌──────────────────────────────────────────────┐
│  Outer Wrapper (24-30px padding)             │
│  ┌────────────────────────────────────────┐  │
│  │  Container/Section (32px gap)          │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │  Group (24px gap)                │  │  │
│  │  │  ┌────────────────────────────┐  │  │  │
│  │  │  │  Card (16px padding)       │  │  │  │
│  │  │  │  ┌──────────────────────┐  │  │  │  │
│  │  │  │  │  Elements (8px gap)  │  │  │  │  │
│  │  │  │  └──────────────────────┘  │  │  │  │
│  │  │  └────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────┘  │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Spacing Quick Reference

| Level | Element | Spacing | CSS Example |
|-------|---------|---------|-------------|
| 1 | Outer Wrapper | 24-30px | `px: "24px"` |
| 2 | Between Sections | 32px | `gap: "32px"` |
| 3 | Title to Content | 24px | `mb: "24px"` |
| 4 | Inside Cards | 16px | `p: "16px"` |
| 5 | Between Elements | 8px | `gap: "8px"` |
| 6 | Micro (icon-text) | 4-6px | `gap: "4px"` |

### Hard & Fast Rules

- **Minimum 6px** between any two elements
- **Tappable areas**: Minimum 44×44px
- **Button spacing**: 12-42px apart (based on size)
- **Embrace whitespace** — but don't disconnect related items

---

## 8. Color System

### The Three Color Categories

#### 1. Brand Colors (1-2 colors)
Used on: Buttons, links, navigation, icons, key UI elements

```tsx
// Hushh Brand Colors
const brand = {
  primary: "#00A9E0",    // Hushh Teal/Cyan
  secondary: "#6DD3EF",  // Light Teal
  gradient: "linear(135deg, #00A9E0 0%, #6DD3EF 100%)",
};
```

#### 2. Supporting Colors (4 Essential)

| Color | Purpose | Hex | Usage |
|-------|---------|-----|-------|
| 🟢 Green | Success | `#34C759` | Confirmations, completed states |
| 🟠 Orange | Warning | `#FF9500` | Caution states, pending |
| 🔴 Red | Error/Danger | `#FF3B30` | Errors, destructive actions |
| 🔵 Blue | Info | `#007AFF` | Informational messages |

#### 3. Neutrals (Most of your UI)
Used on: Text, backgrounds, borders, secondary buttons

```tsx
const neutrals = {
  background: "#F5F5F7",      // Apple light gray
  surface: "#FFFFFF",          // Cards, sheets
  textPrimary: "#1D1D1F",      // Main text
  textSecondary: "#515154",    // Secondary text
  textMuted: "#8E8E93",        // Muted/disabled text
  separator: "#E5E5EA",        // Borders, dividers
};
```

### Creating a Color Scale (9 Shades)

Use the **Arc Method** in the color picker:

1. Start with your base color at **500**
2. Imagine a diagonal line from top-left to bottom-right
3. Pick shades along this arc

```tsx
// Example: Primary Color Scale
const primaryScale = {
  100: "#E6F7FB",  // Lightest (backgrounds)
  200: "#B3E8F5",
  300: "#80D9EF",
  400: "#4DCAE9",
  500: "#00A9E0",  // Base (buttons)
  600: "#0097CB",
  700: "#0085B6",
  800: "#0073A1",
  900: "#00618C",  // Darkest (text)
};
```

### HSB Color System

Use **HSB** (Hue, Saturation, Brightness) instead of Hex when creating palettes:

- **H** (Hue): 0-360° around color wheel
- **S** (Saturation): 0-100% intensity
- **B** (Brightness): 0-100% light/dark

**Rule**: Keep S and B within ±5-10 of your base for cohesive palettes.

---

## 9. Typography

### Apple System Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", 
             "SF Pro Text", Inter, system-ui, sans-serif;
```

### Text Style Hierarchy

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Large Title | 34px | Bold | 1.2 | Page headers |
| Title 1 | 28px | Bold | 1.2 | Section headers |
| Title 2 | 22px | Bold | 1.25 | Card titles |
| Title 3 | 20px | Semibold | 1.25 | Subsections |
| Headline | 17px | Semibold | 1.3 | Important labels |
| Body | 17px | Regular | 1.5 | Main content |
| Callout | 16px | Regular | 1.4 | Supporting text |
| Subhead | 15px | Regular | 1.4 | Descriptions |
| Footnote | 13px | Regular | 1.4 | Captions |
| Caption | 12px | Regular | 1.3 | Small labels |

### Eyebrow Text Style

For section labels above headings:

```tsx
<Text
  fontSize="12px"
  fontWeight="500"
  letterSpacing="0.12em"
  textTransform="uppercase"
  color="#8E8E93"
>
  ABOUT US
</Text>
```

### Text Color Opacity

| Type | Color | Opacity |
|------|-------|---------|
| Primary | White/Black | 100% |
| Secondary | White/Black | 60% |
| Muted/Disabled | White/Black | 40% |

---

## 10. Visual Effects

### Background Blur (Glassmorphism)

```tsx
// Light blur (subtle depth)
backdropFilter: "blur(10px)"

// Heavy blur (modal backgrounds)
backdropFilter: "blur(40px)"

// Combine with opacity
bg="rgba(255, 255, 255, 0.45)"
backdropFilter="blur(40px)"
```

### Inner Shadow (3D Effect)

Creates depth and "pressed" feeling:

```tsx
boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.5)"
// Y: 1, Blur: 0-1, Color: White, Blend: Overlay
```

### Gradient Overlays

```tsx
// Linear gradient for buttons
bgGradient="linear(135deg, #00A9E0 0%, #6DD3EF 100%)"

// Radial gradient for lighting effects
bgGradient="radial(circle, rgba(255,255,255,0.1) 0%, transparent 70%)"

// Stroke gradient (for glass effect)
borderImage: "linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0)) 1"
```

### Neon Glow Effect

```tsx
// Glow behind element
<Box
  position="absolute"
  w="60px"
  h="20px"
  bg="#FF3B30"
  filter="blur(16px)"
  opacity={0.3}
/>
```

---

## 11. Content Organization

### Progressive Disclosure

Show only what's necessary upfront, reveal more as needed:

```tsx
// Example: Collapsed section with "See All"
<HStack justify="space-between">
  <Text fontWeight="600">My Crates</Text>
  <Button variant="link" rightIcon={<ChevronRight />}>
    See All
  </Button>
</HStack>
<SimpleGrid columns={2} gap={4}>
  {items.slice(0, 4).map(item => <Card key={item.id} />)}
</SimpleGrid>
```

### Layout Components

| Component | Best For | Characteristics |
|-----------|----------|-----------------|
| **List** | Structured info | Quick scanning, less space |
| **Grid/Collection** | Visual content | Images, products, thumbnails |
| **Cards** | Grouped actions | Self-contained, tappable |

### Content Prioritization

```
┌─────────────────────────────────┐
│  1. Primary Content             │  Most important, largest
│  ────────────────────────────   │
│  2. Supporting Info             │  Medium emphasis
│  ────────────────────────────   │
│  3. Metadata/Actions            │  Smallest, secondary
└─────────────────────────────────┘
```

---

## 12. Component Specifications

### Buttons

```tsx
// Primary Button
<Button
  h="54px"              // Tappable height
  borderRadius="14px"   // Rounded corners (or "full" for pill)
  bgGradient="linear(135deg, #00A9E0 0%, #6DD3EF 100%)"
  color="white"
  fontSize="17px"
  fontWeight="500"
  boxShadow="0 4px 14px rgba(0, 169, 224, 0.35)"
/>

// Secondary Button
<Button
  h="54px"
  borderRadius="14px"
  bg="white"
  borderWidth="1px"
  borderColor="#E5E7EB"
  color="#1D1D1F"
  fontSize="17px"
  fontWeight="500"
/>
```

### Icon Buttons

```tsx
// Standard icon button frame
<Box
  w="44px"
  h="44px"
  borderRadius="full"
  bg="rgba(255, 255, 255, 0.08)"
  backdropFilter="blur(10px)"
  display="flex"
  alignItems="center"
  justifyContent="center"
>
  <Icon as={FaSearch} w="24px" h="24px" color="white" />
</Box>
```

### Cards

```tsx
<Box
  bg="white"
  borderRadius="24px"
  p={6}                              // 24px padding
  boxShadow="0 2px 20px rgba(0,0,0,0.06)"
>
  {/* Card content */}
</Box>
```

### Separators

```tsx
<Box h="1px" bg="#E5E5EA" w="100%" />

// With accent marker
<Box position="relative" w="100%" h="1px" bg="#E5E5EA">
  <Box
    position="absolute"
    left="50%"
    top="50%"
    transform="translate(-50%, -50%)"
    w="16px"
    h="2px"
    bg="#00A9E0"
  />
</Box>
```

### Bottom Sheet

```tsx
<Box
  position="fixed"
  bottom={0}
  left={0}
  right={0}
  bg="rgba(255, 255, 255, 0.45)"
  backdropFilter="blur(40px)"
  borderTopRadius="40px"
  px={6}
  py={8}
  pb="30px"  // Safe area
>
  {/* Drag handle */}
  <Box w="36px" h="5px" bg="#8E8E93" borderRadius="full" mx="auto" mb={4} />
  {/* Content */}
</Box>
```

---

## 13. Modal Components Guide

Choosing the right modal component is crucial. Different apps use different patterns, but there are clear guidelines for when to use each.

### Component Comparison

| Component | Platform | When to Use | Appearance |
|-----------|----------|-------------|------------|
| **Alert** | iOS (Native) | Unexpected critical info, problems, warnings | Center of screen |
| **Action Sheet** | iOS (Native) | Choices related to an intentional action | Bottom sheet with buttons |
| **Dialog** | Material (Android) | Require action, communicate info, decisions | Center of screen |
| **Bottom Sheet** | Both | Custom content, complex forms | Slides from bottom |
| **Modal Sheet** | Both | Full content screens | Slides up, covers screen |

### Alert (iOS HIG)

**Use Alerts When:**
- Giving people **critical information** they need right away
- Warning about an action that might **destroy data**
- Confirming a **purchase** or important action
- The message is **unexpected** (user didn't initiate it)

**Alert Rules:**
- Use sparingly — interrupts current task
- Avoid for mere information — only when action required
- Keep it brief and actionable

```tsx
// Alert Example - Unexpected critical info
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>Delete Account?</AlertDialogHeader>
    <AlertDialogBody>
      This action cannot be undone. All your data will be permanently removed.
    </AlertDialogBody>
    <AlertDialogFooter>
      <Button variant="ghost">Cancel</Button>
      <Button colorScheme="red">Delete</Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Action Sheet (iOS HIG)

**Use Action Sheets When:**
- User initiated an action and needs to **choose between options**
- Presenting **multiple choices** related to the action
- The action is **expected** (user tapped cancel, save, etc.)

**Example Use Cases:**
- Cancel editing → Save Draft / Discard / Keep Editing
- Share content → Multiple share destinations
- File options → Copy / Move / Delete

```tsx
// Action Sheet Example - Cancel editing flow
<ActionSheet isOpen={isOpen} onClose={onClose}>
  <ActionSheetContent>
    <ActionSheetHeader>Save changes?</ActionSheetHeader>
    <ActionSheetBody>
      <Button w="full" mb={2}>Save Draft</Button>
      <Button w="full" mb={2} colorScheme="red" variant="ghost">
        Discard Changes
      </Button>
      <Button w="full" variant="ghost">Keep Editing</Button>
    </ActionSheetBody>
  </ActionSheetContent>
</ActionSheet>
```

### Dialog (Material Design)

**Use Dialogs When:**
- Blocking an app's normal operation for **critical decisions**
- Requiring a **specific task** or acknowledgment
- On Android/Material Design apps

**Dialog Types:**
- **Basic Dialog** - Simple confirmations
- **Full-screen Dialog** - Complex forms or content

```tsx
// Material-style Dialog
<Modal isOpen={isOpen} onClose={onClose} isCentered>
  <ModalOverlay />
  <ModalContent borderRadius="24px" mx={4}>
    <ModalHeader>Discard draft?</ModalHeader>
    <ModalBody>
      Your changes will not be saved.
    </ModalBody>
    <ModalFooter>
      <Button variant="ghost" mr={3}>Cancel</Button>
      <Button colorScheme="red">Discard</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Bottom Sheet (Custom)

**Use Bottom Sheets When:**
- Need more control over styling and content
- Presenting complex information or forms
- Want consistent experience across iOS/Android

**Types:**
- **Standard** - Supplementary content, doesn't block UI
- **Modal** - Must be dismissed, blocks interaction

```tsx
// Modal Bottom Sheet
<Drawer placement="bottom" isOpen={isOpen} onClose={onClose}>
  <DrawerOverlay />
  <DrawerContent borderTopRadius="24px">
    <DrawerHeader borderBottomWidth="1px">
      <Box w="36px" h="5px" bg="#8E8E93" borderRadius="full" mx="auto" mb={4} />
      Choose an option
    </DrawerHeader>
    <DrawerBody>
      {/* Content */}
    </DrawerBody>
  </DrawerContent>
</Drawer>
```

### Decision Flowchart

```
User tapped something?
├── YES → Was it Cancel/Delete/Save type action?
│         ├── YES → Use ACTION SHEET (choices for intentional action)
│         └── NO → Does it need choices?
│                  ├── YES → Use BOTTOM SHEET (custom content)
│                  └── NO → Use in-page feedback
└── NO → System needs to interrupt?
         ├── YES → Is it critical/destructive?
         │         ├── YES → Use ALERT (unexpected, needs attention)
         │         └── NO → Use Toast/Snackbar
         └── NO → Don't interrupt
```

### Platform Differences

| Behavior | iOS | Android |
|----------|-----|---------|
| Cancel editing | Action Sheet | Dialog |
| Confirm delete | Alert | Dialog |
| Share options | Activity Sheet | Bottom Sheet |
| Permission request | Native Alert | Native Dialog |

### Native vs Custom Components

**Native Components** (Alert, Action Sheet):
- ✅ Consistent with OS
- ✅ Automatically handles accessibility
- ✅ Always up-to-date with OS changes
- ❌ Limited customization

**Custom Components** (Bottom Sheet):
- ✅ Full styling control
- ✅ Cross-platform consistency
- ❌ Must handle accessibility manually
- ❌ May feel inconsistent with OS

---

## 14. Animation Principles

Apple's animations feel so smooth because of deliberate engineering choices. Understanding these principles helps create polished experiences.

### Why Apple Animations Feel Better

| Factor | Description |
|--------|-------------|
| **Frame Rate** | 120Hz ProMotion = 120 frames/second |
| **Frame Pacing** | Frames delivered consistently, evenly spaced |
| **Hardware-Software Integration** | Apple controls both, optimized perfectly |
| **Physics-Based Motion** | Animations follow real-world physics |
| **Contextual Awareness** | Animations respond to user actions |

### Frame Rate & Pacing

Even at 60Hz, Apple devices feel smoother than 120Hz competitors because of **frame pacing**:

```
❌ Bad Frame Pacing (jittery):
Frame 1 ──── Frame 2 ─ Frame 3 ────── Frame 4 ─ Frame 5

✅ Good Frame Pacing (smooth):
Frame 1 ── Frame 2 ── Frame 3 ── Frame 4 ── Frame 5
```

### Physics-Based Animations

#### Inertia
Objects in motion stay in motion until friction stops them:

```tsx
// Scroll behavior with inertia
const scrollConfig = {
  deceleration: 0.998, // Gradual slowdown
  bounceStiffness: 200,
  bounceDamping: 30,
};
```

#### Easing Curves

| Curve | Use Case | Feeling |
|-------|----------|---------|
| **Linear** | Progress indicators | Robotic, mechanical |
| **Ease-In** | Elements entering | Accelerating |
| **Ease-Out** | Elements exiting | Decelerating |
| **Ease-In-Out** | General transitions | Natural, human |

```tsx
// Apple's signature easing curve
const appleEase = [0.25, 0.46, 0.45, 0.94];

// Framer Motion example
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: appleEase 
    }
  }
};
```

### Contextual Animations

Animations should respond dynamically to user context:

```tsx
// iPad multitasking - windows respond to drag
const windowVariants = {
  dragging: { 
    scale: 0.95, 
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)" 
  },
  idle: { 
    scale: 1, 
    boxShadow: "0 2px 20px rgba(0,0,0,0.1)" 
  }
};
```

### Transition Types

| Transition | Best For | Example |
|------------|----------|---------|
| **Numeric Content** | Counting up/down | Score, distance, time |
| **Content Replace** | Swapping elements | Text changes, icon swaps |
| **Position** | Moving elements | Map pins, list reordering |
| **Scale** | Emphasis/de-emphasis | App icons, cards |

```tsx
// Numeric content transition
<MotionText
  animate={{ scale: [1, 1.1, 1] }}
  transition={{ duration: 0.3 }}
>
  {count}
</MotionText>

// Position transition (avoid overlapping)
<AnimatePresence mode="popLayout">
  {items.map(item => (
    <MotionBox key={item.id} layout exit={{ opacity: 0 }}>
      {item.content}
    </MotionBox>
  ))}
</AnimatePresence>
```

### Animation Duration Guidelines

| Action | Duration | Notes |
|--------|----------|-------|
| Micro-interactions | 100-200ms | Button press, toggle |
| Standard transitions | 200-400ms | Page transitions, modals |
| Complex animations | 400-600ms | Onboarding, celebrations |
| Attention-grabbing | 600-1000ms | Loading states, errors |

### Spring Animations

More natural than timed animations:

```tsx
// Spring animation config
const spring = {
  type: "spring",
  stiffness: 300,  // How tight the spring
  damping: 30,     // How quickly it settles
  mass: 1,         // Weight of the object
};

// Usage
<MotionBox
  animate={{ x: 100 }}
  transition={spring}
/>
```

---

## 15. Live Activities & Dynamic Island

Live Activities display ongoing information on the lock screen and Dynamic Island. They require special design considerations.

### Lock Screen Live Activities

**Design Principles:**
- Share 14px margins with notifications
- Create **unique graphical layouts** (not notification replicas)
- Prioritize most useful info at a glance
- Keep layouts **as compact as possible**

```
┌──────────────────────────────────────────────┐
│  🎵  Now Playing                    ▶ ⏸ ✕   │
│      Song Title - Artist Name               │
│      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│      2:34 ─────────────────────────── 4:12  │
└──────────────────────────────────────────────┘
```

**Best Practices:**
- Draw inspiration from your **app icon colors**
- Incorporate brand colors for distinct personality
- Use **buttons sparingly** — only for essential actions
- Change colors dynamically based on content
- Check dismiss button color matches your design

### Dynamic Height

Change Live Activity height based on information available:

```tsx
// Compact when searching
<LiveActivity height={60}>
  <Text>Searching for driver...</Text>
</LiveActivity>

// Expanded when ride confirmed
<LiveActivity height={120}>
  <DriverInfo />
  <ETA />
  <MapPreview />
</LiveActivity>
```

### Transitions

```tsx
// Numeric content (scores, distance)
<AnimatedNumber value={score} />

// Content replacement (text, icons)
<AnimatePresence mode="wait">
  <MotionText key={status} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    {status}
  </MotionText>
</AnimatePresence>
```

### StandBy Mode

When iPhone is in StandBy (landscape charging), Live Activities scale to **200%**:

**Considerations:**
- Use high-resolution assets
- Consider removing background to blend with bezel
- Check contrast in **Night Mode** (red tint)

### Dynamic Island

The Dynamic Island is a unified home for alerts and background activities.

#### Design Philosophy
- Feels like a **living organism** with elasticity
- Each experience should have **unique identity**
- Use biological-inspired motion

#### Three Size Classes

```
┌──────────────────────────┐
│ Minimal (background)     │  ●──●
│                          │
│ Compact (most common)    │  ●━━━━━━━━━━━●
│                          │
│ Expanded (detail view)   │  ┌───────────┐
│                          │  │           │
│                          │  └───────────┘
└──────────────────────────┘
```

#### Compact View Rules

**Must-dos:**
- Keep encapsulation **as narrow as possible**
- Fill view with content (no wasted space)
- Content should be **snug against sensor region**
- Clearly reflect your app's identity

**Don'ts:**
- Don't leave empty space
- Don't make it too wide
- Don't use it as just a link back to app

```tsx
// Compact view layout
<DynamicIslandCompact>
  <HStack spacing={2}>
    <Icon />
    <Text fontWeight="bold">12:34</Text>
  </HStack>
</DynamicIslandCompact>
```

#### Expanded View

Triggered when user presses into the Dynamic Island:

**Design Tips:**
- Get to the **essence** of your activity
- Maintain relative placement from compact view
- Hug the sensor region tightly (avoid "forehead")
- Use rounded, thick shapes
- Liberal use of color for identity

```
       ╭──────────────────────────────────╮
       │    ╭─────╮                       │
       │    │  ●  │   Activity Title      │
       │    ╰─────╯   Subtitle here       │
       │──────────────────────────────────│
       │   Main Content Area              │
       │   Progress: ━━━━━━━━━━━━━ 75%    │
       │                                  │
       │   [ Button ]    [ Button ]       │
       ╰──────────────────────────────────╯
```

#### Concentric Fit

Elements must be **concentric** with the Dynamic Island's shape:

```
✅ Good: Concentric margins
╭─────────────────────────╮
│   ╭──────────────────╮  │
│   │  Nested nicely   │  │
│   ╰──────────────────╯  │
╰─────────────────────────╯

❌ Bad: Poking into corners
╭─────────────────────────╮
│ Content touching edges! │
╰─────────────────────────╯
```

**Blur Test**: Blur the content — the resulting shape should be concentric to the outer border.

#### Minimal View

Shown when juggling multiple activities:

- **Don't** revert to just a logo
- **Do** convey information even in tiny state

---

## 16. Spatial Interactions

Spatial interactions use device awareness (U1 chip, Bluetooth, Wi-Fi) to create human-scale interactions.

### Core Principles

1. **Consider distance and ability**
2. **Provide continuous feedback**
3. **Embrace the physical action**

### Distance Adaptation

Design should adapt based on physical distance:

| Distance | Interaction Type | Feedback Type |
|----------|------------------|---------------|
| Far (meters) | Map/directions | Visual |
| Medium (arm's length) | Pointing/facing | Visual + Audio |
| Close (touch) | Fine control | Haptic |

```tsx
// AirTag finding example
const FeedbackByDistance = ({ distance }) => {
  if (distance > 10) return <MapDirections />;
  if (distance > 2) return <ArrowPointing />;
  return <HapticPulse intensity={1 - distance/2} />;
};
```

### Facing Direction Forgiveness

At greater distances, be **more forgiving** with angles:

```
Far away: Accept ±60° as "facing"
├────────────────────────────────────────────┤
         \                    /
           \    ✓ Valid    /
             \            /
               \        /
                 \    /
                   \/  Target

Close up: Require ±15° precision
        │        │
        │   ✓    │
        │        │
           Target
```

### Continuous Feedback

Feedback should be **responsive** to every movement:

```tsx
// Distance-responsive feedback
<MotionBox
  animate={{
    scale: 1 + (1 - distance/10) * 0.2,
    opacity: Math.min(1, 2 - distance/5),
  }}
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
>
  <DistanceIndicator />
</MotionBox>
```

### Multi-Sensory Feedback

Combine visual, audio, and haptic for complete experience:

| Moment | Visual | Audio | Haptic |
|--------|--------|-------|--------|
| Connection established | Arrow forms | Soft chime | Light tap |
| On right path | Screen lights up | Confirmation tone | Pulse |
| Very close | Zoom in on target | Continuous tone | Vibration |
| Found | Celebration animation | Success sound | Strong tap |

### HomePod Mini Transfer Example

Two zones with progressive feedback:

```
Zone 1 (First threshold):
├── Banner appears
├── Light haptic acknowledgment
├── HomePod light modulates

Zone 2 (Transfer zone):
├── Banner scales up with blur
├── Stronger haptics encourage approach
├── HomePod animation intensifies
├── Transfer completes
```

### Design for Peripheral Vision

When interacting with physical world, users aren't looking at screen:

```tsx
// Large, high-contrast UI for peripheral viewing
<Box>
  <Text fontSize="64px" fontWeight="bold">
    12.3 m
  </Text>
  <Arrow size="xl" animate={true} />
</Box>
```

**Similar Patterns:**
- Turn-by-turn navigation (big, bold)
- TV Remote (large tap targets)
- Calculator (high contrast buttons)

### Natural Cancellation

Allow **body movement** to cancel/confirm:

- Move closer → Confirm
- Move away → Cancel
- No on-screen cancel button needed

```tsx
// Distance-based confirmation
useEffect(() => {
  if (distance < THRESHOLD) {
    confirmTransfer();
  } else if (distance > CANCEL_DISTANCE) {
    cancelTransfer();
  }
}, [distance]);
```

---

## 17. iOS Design Fundamentals

This section covers practical iOS design concepts from first principles.

### App Categories

All apps fall into three primary categories:

| Category | Focus | Balance |
|----------|-------|---------|
| **Content-Based** | Displaying media/information | 90% functional, 10% aesthetic |
| **Tool-Based** | Productivity/utility tasks | 80% functional, 20% aesthetic |
| **Games** | Entertainment/engagement | Varies widely |

### The 80/90 Rule

Most apps should be **80-90% functional** and only **10-20% aesthetic**:

```
Content Apps (Photos, News, Social Media):
┌────────────────────────────────────────────────────┐
│██████████████████████████████████████████████████░░│ 90% Functional
└────────────────────────────────────────────────────┘

Tool Apps (Productivity, Utilities):
┌────────────────────────────────────────────────────┐
│████████████████████████████████████████░░░░░░░░░░░░│ 80% Functional
└────────────────────────────────────────────────────┘
```

**Why this matters:**
- Users come to accomplish tasks, not admire design
- Beautiful apps that are hard to use fail
- Function enables the aesthetic, not the other way around

### Real Apps vs Dribbble Concepts

> "80% of Dribbble concepts never see the light of day"

**Why concept designs often fail in production:**
- Missing edge cases (empty states, errors, loading)
- No consideration for real data variations
- Prioritize "wow factor" over usability
- Ignore platform conventions

**Design for reality:**
```tsx
// ✅ Consider all states
<ContentArea>
  {isLoading && <LoadingState />}
  {error && <ErrorState message={error} />}
  {data?.length === 0 && <EmptyState />}
  {data?.length > 0 && <ContentList items={data} />}
</ContentArea>

// ❌ Dribbble-style (happy path only)
<ContentArea>
  <ContentList items={perfectData} />
</ContentArea>
```

### iOS Design Spacing Standards

From practical iOS design, these are the core spacing values:

| Spacing | Value | Usage |
|---------|-------|-------|
| Page margins | 20px | Left/right edge spacing |
| Section gap | 32px | Between major sections |
| Element gap | 8px | Between list items |
| Card padding | 16px | Inside card components |
| Icon-text gap | 8px | Between icon and label |

### Card Design Patterns

Cards are fundamental to iOS design. Key patterns:

```tsx
// Standard Card
<Box
  bg="white"
  borderRadius="16px"
  p="16px"
  boxShadow="0 2px 8px rgba(0,0,0,0.08)"
>
  <VStack spacing="8px" align="start">
    <Text fontSize="17px" fontWeight="600">Card Title</Text>
    <Text fontSize="15px" color="gray.600">Description text</Text>
  </VStack>
</Box>

// Gradient Card (for featured content)
<Box
  bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
  borderRadius="24px"
  p="24px"
  color="white"
>
  <VStack spacing="12px">
    <Heading>Featured</Heading>
    <Text>Highlighted content here</Text>
  </VStack>
</Box>
```

### Background Blur Techniques

iOS uses blur extensively for depth:

```tsx
// Light blur (navigation bars)
<Box
  bg="rgba(255, 255, 255, 0.72)"
  backdropFilter="blur(20px)"
  borderBottom="1px solid rgba(0,0,0,0.1)"
/>

// Heavy blur (modal backgrounds)
<Box
  bg="rgba(255, 255, 255, 0.45)"
  backdropFilter="blur(40px)"
  borderRadius="40px"
/>

// Dark blur (dark mode)
<Box
  bg="rgba(0, 0, 0, 0.65)"
  backdropFilter="blur(30px)"
/>
```

### Design Resources

**Essential Resources:**
- Apple UI Kit (Figma) - Official components
- SF Symbols - 5000+ icons, free
- Apple Design Resources - Templates and guidelines

**Community Resources:**
- Figma Community iOS kits
- Mobbin - Real app screenshots
- Pttrns - Mobile UI patterns

---

## 18. Accessibility

### Must-Have Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Dynamic Type** | Use relative font sizes, test at all scales |
| **Color Contrast** | Minimum 4.5:1 for text, 3:1 for large text |
| **Touch Targets** | Minimum 44×44px tappable area |
| **Keyboard Navigation** | All interactive elements reachable |
| **Screen Reader** | Proper ARIA labels on all elements |
| **Reduced Motion** | Respect `prefers-reduced-motion` |

### Semantic Colors

Use system semantic colors for automatic light/dark mode support:

```tsx
// These adapt automatically
const semanticColors = {
  label: "var(--chakra-colors-gray-900)",        // Primary text
  secondaryLabel: "var(--chakra-colors-gray-600)", // Secondary text
  tertiaryLabel: "var(--chakra-colors-gray-400)",  // Tertiary text
  systemBackground: "var(--chakra-colors-gray-50)", // Page background
  secondarySystemBackground: "var(--chakra-colors-white)", // Card background
};
```

---

## 19. React/Chakra UI Implementation

### Design Tokens Setup

```tsx
// src/theme/tokens.ts
export const tokens = {
  // Backgrounds
  bg: "#F5F5F7",
  surface: "#FFFFFF",
  
  // Text
  textPrimary: "#1D1D1F",
  textSecondary: "#515154",
  textMuted: "#8E8E93",
  
  // Brand
  accent: "#00A9E0",
  accentLight: "#6DD3EF",
  gradientStart: "#00A9E0",
  gradientEnd: "#6DD3EF",
  
  // Separators
  separator: "#E5E5EA",
  border: "#E5E7EB",
  
  // Semantic
  success: "#34C759",
  warning: "#FF9500",
  error: "#FF3B30",
  info: "#007AFF",
};
```

### Font Stack in Theme

```tsx
// src/theme/index.ts
export const theme = extendTheme({
  fonts: {
    heading: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif`,
    body: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif`,
  },
  // ... rest of theme
});
```

### Motion Components

```tsx
import { motion } from "framer-motion";
import { Box, Button } from "@chakra-ui/react";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 }
  }
};
```

### Standard Page Layout

```tsx
<Box
  bg={tokens.bg}
  minH="100vh"
  px={{ base: "24px", sm: "32px" }}
  py={{ base: "48px", md: "64px" }}
  style={{ 
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
  }}
>
  <Container maxW="480px">
    {/* Content */}
  </Container>
</Box>
```

---

## 20. Design Checklist

### Before Development

- [ ] Define 8px grid system
- [ ] Establish brand color + 9 shades
- [ ] Create supporting color palettes (success, warning, error, info)
- [ ] Set up neutral color scale
- [ ] Define typography scale
- [ ] Create component library with consistent spacing

### During Development

- [ ] All spacing follows 8px grid
- [ ] All text uses defined text styles
- [ ] All colors come from design tokens
- [ ] Tab bar contains only navigation (no actions)
- [ ] All screens answer: Where am I? What can I do? Where can I go?
- [ ] Progressive disclosure applied where appropriate
- [ ] Tappable areas are minimum 44×44px

### Before Launch

- [ ] Test on light AND dark modes
- [ ] Test with Dynamic Type (accessibility settings)
- [ ] Validate color contrast (WCAG AA minimum)
- [ ] Test keyboard navigation
- [ ] Add ARIA labels to all interactive elements
- [ ] Verify `prefers-reduced-motion` is respected
- [ ] Cross-device testing (iPhone SE → iPhone Pro Max)

---

## 21. Atomic Design Methodology

> Atomic Design is a methodology for creating design systems based on chemistry's concept of atomic structures. Introduced by Brad Frost, it provides a systematic approach to building UI components from smallest to largest.

### What is Atomic Design?

Atomic Design breaks down interfaces into **five distinct hierarchical levels**:

```
┌─────────────────────────────────────────────────────────────────┐
│                         PAGES                                    │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │                    TEMPLATES                             │  │
│    │    ┌───────────────────────────────────────────────┐    │  │
│    │    │                ORGANISMS                       │    │  │
│    │    │    ┌─────────────────────────────────────┐    │    │  │
│    │    │    │           MOLECULES                  │    │    │  │
│    │    │    │    ┌─────────────────────────┐      │    │    │  │
│    │    │    │    │        ATOMS             │      │    │    │  │
│    │    │    │    └─────────────────────────┘      │    │    │  │
│    │    │    └─────────────────────────────────────┘    │    │  │
│    │    └───────────────────────────────────────────────┘    │  │
│    └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### The Five Levels of Atomic Design

#### Level 1: Atoms ⚛️

**Atoms** are the smallest, most basic UI elements that cannot be broken down further.

| Element Type | Examples |
|--------------|----------|
| **Form Elements** | Input fields, buttons, toggles, checkboxes |
| **Typography** | Labels, headings, paragraphs, links |
| **Visual** | Icons, images, avatars, dividers |
| **Interactive** | Chips, badges, tags |

```tsx
// Examples of Atoms
<Button>Submit</Button>
<Input placeholder="Enter email" />
<Icon name="search" />
<Label>Username</Label>
<Avatar src="/user.jpg" />
<Badge>New</Badge>
```

**Key Characteristics:**
- Cannot be broken down further while still being functional
- Serve as fundamental building blocks
- Highly reusable across the entire application
- Should have variants (size, color, state)

#### Level 2: Molecules 🧬

**Molecules** are groups of atoms bonded together that function as a single unit.

| Molecule | Atoms Combined |
|----------|----------------|
| **Search Bar** | Input + Button + Icon |
| **Form Field** | Label + Input + Error Text |
| **Nav Item** | Icon + Text + Badge |
| **Media Object** | Image + Title + Description |

```tsx
// Search Bar Molecule
const SearchBar = () => (
  <HStack>
    <Icon as={FaSearch} />            {/* Atom */}
    <Input placeholder="Search..." />  {/* Atom */}
    <Button>Go</Button>                {/* Atom */}
  </HStack>
);

// Form Field Molecule
const FormField = ({ label, error, ...props }) => (
  <VStack align="start" spacing={1}>
    <Label>{label}</Label>             {/* Atom */}
    <Input {...props} />               {/* Atom */}
    {error && <ErrorText>{error}</ErrorText>}  {/* Atom */}
  </VStack>
);
```

**Key Characteristics:**
- Combine 2-5 atoms together
- Have a single, focused purpose
- Do one thing well
- Reusable in different contexts

#### Level 3: Organisms 🦠

**Organisms** are complex UI sections composed of molecules and/or atoms working together.

| Organism | Components |
|----------|------------|
| **Navigation Header** | Logo + Nav Items + Search Bar + User Menu |
| **Post Card** | User Info + Content + Action Bar + Comments |
| **Product Card** | Image + Title + Price + Add to Cart |
| **Form Section** | Title + Multiple Form Fields + Submit Button |

```tsx
// Header Organism
const Header = () => (
  <Box as="header">
    <Logo />                              {/* Atom */}
    <NavItems>                            {/* Molecule */}
      <NavItem icon="home" label="Home" />
      <NavItem icon="explore" label="Explore" />
    </NavItems>
    <SearchBar />                         {/* Molecule */}
    <UserMenu />                          {/* Molecule */}
  </Box>
);

// Post Card Organism
const PostCard = ({ post }) => (
  <Card>
    <UserInfo user={post.author} />       {/* Molecule */}
    <PostContent content={post.content} /> {/* Molecule */}
    <MediaGallery images={post.images} /> {/* Molecule */}
    <ActionBar likes={post.likes} />      {/* Molecule */}
  </Card>
);
```

**Key Characteristics:**
- Form distinct sections of an interface
- Can function independently
- May be context-specific or reusable
- Represent meaningful UI patterns

#### Level 4: Templates 📐

**Templates** are page-level layouts that combine organisms into complete page structures. They define the **content structure** without real data.

```tsx
// Profile Page Template
const ProfilePageTemplate = () => (
  <Box>
    <Header />                            {/* Organism */}
    
    <Container>
      <Sidebar>
        <ProfileCard />                   {/* Organism */}
        <StatsCard />                     {/* Organism */}
      </Sidebar>
      
      <MainContent>
        <TabNavigation />                 {/* Organism */}
        <ContentArea>
          {/* Placeholder for dynamic content */}
        </ContentArea>
      </MainContent>
    </Container>
    
    <Footer />                            {/* Organism */}
  </Box>
);
```

**Key Characteristics:**
- Focus on layout and structure
- Show how organisms fit together
- Use placeholder content
- Define the skeleton of pages

#### Level 5: Pages 📱

**Pages** are specific instances of templates with **real content and data**. They represent what users actually see.

```tsx
// Actual Profile Page with Real Data
const ProfilePage = ({ user }) => (
  <ProfilePageTemplate>
    <ProfileCard 
      name={user.name}
      avatar={user.avatar}
      bio={user.bio}
    />
    <StatsCard 
      followers={user.followers}
      following={user.following}
      posts={user.postCount}
    />
    <TabNavigation active="posts" />
    <ContentArea>
      {user.posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </ContentArea>
  </ProfilePageTemplate>
);
```

**Key Characteristics:**
- Templates with real content
- Show the final user experience
- Reveal edge cases and content variations
- Used for testing and validation

### Why Atomic Design Matters

| Benefit | Description |
|---------|-------------|
| **Consistency** | Reusing atoms ensures visual consistency across the app |
| **Efficiency** | Build once, reuse everywhere — speeds up development |
| **Scalability** | Easy to add new features by combining existing components |
| **Maintainability** | Changes to atoms propagate throughout the design system |
| **Collaboration** | Shared vocabulary between designers and developers |
| **Testing** | Smaller components are easier to test in isolation |

### Component Sets & Variants

In Figma and code, create **component sets** with multiple variants:

```tsx
// Button Component with Variants
interface ButtonProps {
  variant: "primary" | "secondary" | "ghost" | "danger";
  size: "sm" | "md" | "lg";
  state: "default" | "hover" | "active" | "disabled";
}

const Button = ({ variant, size, state, children }) => {
  const styles = getButtonStyles(variant, size, state);
  return <button style={styles}>{children}</button>;
};

// Usage
<Button variant="primary" size="md" state="default">
  Submit
</Button>
```

**State Variants to Consider:**
- Default
- Hover
- Active/Pressed
- Focused
- Disabled
- Loading
- Error
- Success

### Nested Components (Composition)

Build complex UIs by **nesting components** inside each other:

```
Page
└── Template
    └── Organisms
        └── Molecules
            └── Atoms
```

```tsx
// Example: Building a Complex Card
<Card>                                    {/* Organism */}
  <CardHeader>                            {/* Molecule */}
    <Avatar src="..." />                  {/* Atom */}
    <VStack>
      <Text fontWeight="bold">Title</Text> {/* Atom */}
      <Text color="gray">Subtitle</Text>   {/* Atom */}
    </VStack>
    <IconButton icon={<FaMore />} />       {/* Atom */}
  </CardHeader>
  
  <CardBody>                              {/* Molecule */}
    <Image src="..." />                   {/* Atom */}
    <Text>Description text...</Text>      {/* Atom */}
  </CardBody>
  
  <CardFooter>                            {/* Molecule */}
    <Button leftIcon={<FaHeart />}>Like</Button>  {/* Atom */}
    <Button leftIcon={<FaShare />}>Share</Button> {/* Atom */}
  </CardFooter>
</Card>
```

### Figma Implementation

#### Creating Atoms in Figma

1. **Create base components** for each atom
2. Use **Auto Layout** for flexible sizing
3. Apply **Constraints** for responsive behavior
4. Create **variants** using Component Properties

```
Button Component Set:
├── Primary / Default
├── Primary / Hover
├── Primary / Disabled
├── Secondary / Default
├── Secondary / Hover
├── Secondary / Disabled
└── Ghost / Default
    ...
```

#### Building Molecules

1. **Instance atoms** inside a new frame
2. Apply **Auto Layout** for grouping
3. Set **spacing** and **padding**
4. Create as a new component

#### Organizing the Component Library

```
📁 Design System
├── 📁 Atoms
│   ├── Buttons
│   ├── Inputs
│   ├── Icons
│   ├── Typography
│   └── Colors (styles)
├── 📁 Molecules
│   ├── Form Fields
│   ├── Search Bars
│   ├── Nav Items
│   └── Media Objects
├── 📁 Organisms
│   ├── Headers
│   ├── Cards
│   ├── Forms
│   └── Navigation
├── 📁 Templates
│   ├── Auth Pages
│   ├── Dashboard
│   └── Profile
└── 📁 Pages
    └── (Actual designs)
```

### Practical Workflow

#### Step 1: Audit Existing Designs
Identify repeated elements and patterns:
- What buttons exist?
- What form patterns are used?
- What card layouts appear?

#### Step 2: Extract Atoms
Create a library of foundational elements:
- Standardize colors, typography, spacing
- Build reusable buttons, inputs, icons

#### Step 3: Combine into Molecules
Group atoms that appear together:
- Form fields (label + input + helper)
- List items (icon + text + action)

#### Step 4: Assemble Organisms
Build complete UI sections:
- Navigation bars
- Card components
- Form sections

#### Step 5: Create Templates
Define page structures:
- Layout grids
- Component placement
- Responsive behavior

#### Step 6: Build Pages
Apply real content:
- Test edge cases
- Validate with actual data
- Iterate based on findings

### Atomic Design Decision Guide

```
Is it a single, indivisible element?
├── YES → It's an ATOM
│         (button, input, icon, label)
└── NO → Does it combine a few atoms?
         ├── YES → It's a MOLECULE
         │         (search bar, form field)
         └── NO → Is it a complete UI section?
                  ├── YES → It's an ORGANISM
                  │         (header, footer, card)
                  └── NO → Is it a page structure?
                           ├── YES → It's a TEMPLATE
                           │         (page layout)
                           └── It's a PAGE
                                     (final design)
```

### Common Mistakes to Avoid

| Mistake | Why It's Wrong | Better Approach |
|---------|---------------|-----------------|
| Skipping atoms | Leads to inconsistency | Build atoms first, always |
| Too many variants | Creates confusion | Limit to essential states |
| Hardcoding content | Reduces reusability | Use props and placeholders |
| Ignoring states | Incomplete component | Define all interaction states |
| Mixing levels | Breaks hierarchy | Keep atoms in atoms, molecules in molecules |

### React Component Structure

```tsx
// src/components/atoms/Button.tsx
export const Button = ({ variant, size, children, ...props }) => (
  <ChakraButton variant={variant} size={size} {...props}>
    {children}
  </ChakraButton>
);

// src/components/molecules/SearchBar.tsx
import { Button, Input, Icon } from '../atoms';

export const SearchBar = ({ onSearch }) => (
  <HStack>
    <Icon as={FaSearch} />
    <Input placeholder="Search..." />
    <Button onClick={onSearch}>Search</Button>
  </HStack>
);

// src/components/organisms/Header.tsx
import { Logo, NavItems, SearchBar, UserMenu } from '../molecules';

export const Header = () => (
  <Flex as="header" justify="space-between" align="center">
    <Logo />
    <NavItems />
    <SearchBar />
    <UserMenu />
  </Flex>
);
```

### File Structure Recommendation

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Icon/
│   │   └── index.ts
│   ├── molecules/
│   │   ├── SearchBar/
│   │   ├── FormField/
│   │   └── index.ts
│   ├── organisms/
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── index.ts
│   └── templates/
│       ├── DashboardLayout/
│       ├── AuthLayout/
│       └── index.ts
└── pages/
    ├── Home.tsx
    ├── Profile.tsx
    └── Settings.tsx
```

---

## Resources

### Apple Design Resources
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SF Symbols](https://developer.apple.com/sf-symbols/)
- [Apple Design Resources for Figma](https://developer.apple.com/design/resources/)

### Inspiration
- [Mobbin](https://mobbin.com) - UI/UX patterns and flows
- [Color Hunt](https://colorhunt.co) - Color palette inspiration
- [Humint](https://humint.com) - Design inspiration

### Tools
- [Figma](https://figma.com) - Design tool
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - Accessibility
- [SF Symbols App](https://developer.apple.com/sf-symbols/) - Icon library

---

*This document is a living guide. Update as the Hushh design system evolves.*
