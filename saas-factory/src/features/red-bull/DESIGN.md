# 🏎️ DESIGN.md - Red Bull Experiences

> **Status**: Draft V1
> **Design System**: Red Bull Racing (Stich Optimized)

## 1. Design Tokens

### Colors
- **Core-Red**: `#DB0A40` (Primary Action)
- **Deep-Blue**: `#001E36` (Primary Background)
- **Signal-Yellow**: `#FFCC00` (Accents / Highlights)
- **Pure-White**: `#FFFFFF` (Typography / High Contrast)
- **Dark-Navy**: `#001122` (Section Backgrounds)

### Typography
- **Headings**: `Inter` (Extra Bold / Italicized for speed feel)
- **Body**: `Inter` (Medium / Regular)
- **Monospace**: `JetBrains Mono` (For technical specs / prices)

### UI Components (0px Radius Policy)
- **Buttons**: Square edges, high-contrast hover (Red -> Dark Red), thick borders.
- **Cards**: `glass-premium` with `0px` border-radius. Backdrop blur 20px.
- **Inputs**: Solid borders, no shadows, focus state with Red/Yellow glow.

## 2. Layout Patterns (Stitch Responsive)

### Mobile (375px)
- **Navigation**: Full-screen burger menu.
- **Hero**: Vertical stack, video background filling 80vh.
- **Grids**: Single column.

### Tablet (768px)
- **Hero**: Centered text with floating CTAs.
- **Grids**: 2 columns.
- **Navigation**: Compact top bar.

### Desktop (1440px+)
- **Hero**: Immersive 100vh video background with split content (Text Left / Form Right).
- **Grids**: 3-4 columns.
- **Conversion Pane**: Sticky summary for checkout.

## 3. Interaction Design
- **Micro-interactions**: Subtle tilt effect on cards (`framer-motion`).
- **Loading State**: Rotating "Charging Bull" spinner.
- **Transitions**: Slide-fade with high velocity (300ms duration).

## 4. Feature Mapping
- `auth`: `src/features/red-bull/auth`
- `plans`: `src/features/red-bull/plans`
- `checkout`: `src/features/red-bull/checkout`
