# PikFlix Theme Implementation Guide

## Overview

PikFlix uses a theme-based styling approach that allows users to select from six distinct color palettes. Each theme has standardized color roles that must be consistently applied throughout the application. This document serves as a comprehensive reference for implementing these themes in your code.

## Color Role Standardization

All themes use the following standardized color roles:

| Role | Purpose |
|------|---------|
| `primary` | Main brand color used for primary buttons, active states, and important UI elements |
| `secondary` | Complementary color for secondary actions and supporting UI elements |
| `accent` | Highlight color for emphasis, focus states, and decorative elements |
| `background` | Main background color for pages and large sections |
| `surface` | Secondary background color for cards, containers, and UI components |
| `text` | Primary text color for most content |
| `text-muted` | Secondary text color for less emphasized content (captions, helper text) |

## Theme Palettes

### 1. Vintage Prometheus
A warm, earthy palette with deep blue backgrounds and terracotta accents, evoking retro futurism.

```
vintage: {
  primary: '#E64833',     // Terracotta
  secondary: '#90AEAD',   // Sage
  accent: '#874F41',      // Brown
  background: '#244855',  // Deep blue
  surface: '#355865',     // Lighter blue
  text: '#FBE9D0',        // Cream
  'text-muted': '#D0C0A8' // Muted cream
}
```

### 2. Electric Minimalist
A high-contrast dark theme with vibrant electric blue accents that create a futuristic, tech-forward feel.

```
electric: {
  primary: '#66FCF1',     // Electric blue
  secondary: '#45A29E',   // Teal
  accent: '#66FCF1',      // Electric blue
  background: '#0B0C10',  // Dark smoky black
  surface: '#1F2833',     // Dark blue-gray
  text: '#C5C6C7',        // Light gray
  'text-muted': '#9A9B9C' // Darker gray
}
```

### 3. Sapphire Earth
A balanced palette combining cool blue-greens with warm earthy tones, creating a grounded yet sophisticated feel.

```
sapphire: {
  primary: '#116466',     // Blue sapphire
  secondary: '#FFCB9A',   // Peach-orange
  accent: '#D9B08C',      // Tan
  background: '#2C3531',  // Gunmetal gray
  surface: '#3C4541',     // Lighter gunmetal
  text: '#D1E8E2',        // Light cyan
  'text-muted': '#A0B5B0' // Muted cyan
}
```

### 4. Keppel Breeze
A bright, clean theme dominated by fresh green-blues with white accents, ideal for a modern, energetic interface.

```
keppel: {
  primary: '#2B7A78',     // Myrtle green
  secondary: '#DEF2F1',   // Azureish white
  accent: '#17252A',      // Dark green
  background: '#3AAFA9',  // Keppel
  surface: '#4ABFB9',     // Lighter keppel
  text: '#17252A',        // Dark green
  'text-muted': '#2A3A40' // Lighter text
}
```

### 5. Viridian Magenta
A bold combination of deep teals and vibrant magentas, creating a dramatic, attention-grabbing interface.

```
viridian: {
  primary: '#CB2D6F',     // Telemagenta
  secondary: '#14A098',   // Viridian green
  accent: '#501F3A',      // Dark purple
  background: '#0F292F',  // Dark teal
  surface: '#1F393F',     // Lighter teal
  text: '#CCCCCC',        // Light gray
  'text-muted': '#999999' // Darker gray
}
```

### 6. Polish Scarlet
A light theme with passionate pink and red accents, creating a warm, inviting, and emotionally engaging interface.

```
polish: {
  primary: '#9A1750',     // Dark pink
  secondary: '#E3AFBC',   // Light pink
  accent: '#EE4C7C',      // Vibrant pink
  background: '#E3E2DF',  // Light gray
  surface: '#F5F4F1',     // Lighter gray
  text: '#171717',        // Near black
  'text-muted': '#444444' // Dark gray
}
```

## Background Textures

Each theme has a unique background texture or pattern to add depth and visual interest:

| Theme | Texture | Usage |
|-------|---------|-------|
| Vintage | `bg-grain-vintage` | Subtle grain texture that adds a retro film-like quality |
| Electric | `bg-grain-electric` | Fine grain with electric blue tint for a digital feel |
| Sapphire | `bg-noise-sapphire` | Noise texture that adds depth and dimension |
| Keppel | `bg-gradient-keppel` | Smooth gradient background that transitions between shades |
| Viridian | `bg-dots-viridian` | Subtle dot pattern for visual texture |
| Polish | `bg-subtle-polish` | Geometric pattern for light visual structure |

## Animation Classes

Available animations for enhancing the UI:

- `animate-gradient-x`: Smooth horizontal gradient transition (15s cycle)
- `animate-pulse-slow`: Subtle pulsing effect (4s cycle)

## Implementation Guidelines

### Dynamic Theme Implementation

When implementing components, use theme-agnostic class patterns:

```tsx
// Component example with theme-aware styling
const Button = ({ children, theme = 'vintage' }) => {
  return (
    <button 
      className={`
        bg-${theme}-primary 
        hover:bg-${theme}-accent 
        text-${theme}-text 
        px-4 py-2 rounded-md 
        transition-colors duration-200
      `}
    >
      {children}
    </button>
  );
};
```
<!-- 
### Layout Examples

**Page Layout:**
```tsx
<div className={`min-h-screen bg-${theme}-background bg-${pattern}`}>
  <header className={`bg-${theme}-surface py-4`}>
    <h1 className={`text-${theme}-primary font-bold text-2xl`}>PikFlix</h1>
  </header>
  <main className="container mx-auto p-4">
    {/* Content */}
  </main>
</div>
```

**Movie Card:**
```tsx
<div className={`
  bg-${theme}-surface 
  rounded-lg overflow-hidden 
  shadow-lg hover:shadow-xl
  transition-shadow duration-300
`}>
  <img src={poster} alt={title} className="w-full h-auto" />
  <div className="p-4">
    <h3 className={`text-${theme}-text font-bold text-lg`}>{title}</h3>
    <p className={`text-${theme}-text-muted text-sm`}>{year}</p>
    <div className={`mt-2 flex items-center`}>
      <span className={`
        bg-${theme}-accent 
        text-${theme}-text 
        text-xs font-bold 
        px-2 py-1 rounded
      `}>
        {rating}
      </span>
    </div>
  </div>
</div>
```

**Search Bar:**
```tsx
<div className={`
  bg-${theme}-surface 
  rounded-full 
  flex items-center 
  p-2 shadow-md
`}>
  <input
    type="text"
    placeholder="Describe your perfect movie..."
    className={`
      bg-transparent 
      text-${theme}-text 
      placeholder-${theme}-text-muted 
      flex-grow px-4 py-2 
      focus:outline-none
    `}
  />
  <button className={`
    bg-${theme}-primary 
    text-${theme}-text 
    px-6 py-2 rounded-full
    hover:bg-${theme}-accent transition-colors
  `}>
    Search
  </button>
</div>
``` -->

## Important Considerations

1. **Accessibility**: Ensure text has sufficient contrast against its background for all themes (particularly important for Keppel and Polish themes).

2. **Responsive Design**: Test all themes across different screen sizes to ensure color transitions and patterns scale appropriately.

3. **Performance**: When switching themes, try to minimize DOM updates by isolating theme-specific styles to container components when possible.

4. **Testing**: Include visual regression testing for each theme to catch any styling issues during development.

5. **Consistency**: Always use the standardized color roles rather than directly referencing hex values to maintain theme switchability.

By following these guidelines, all UI elements in PikFlix will maintain consistent styling across different themes while preserving the unique character of each color palette.