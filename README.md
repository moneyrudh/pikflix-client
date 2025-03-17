# PikFlix: Natural Language Movie Discovery Platform

![PikFlix Banner](https://api.placeholder.com/1200x300)

PikFlix is an innovative web application that transforms how users discover movies through natural language processing. Instead of rigid filters and categories, users can describe what they're looking for in everyday language—whether it's a specific mood, theme, plot element, or cinematic style—and receive personalized movie recommendations.

## 🎬 Features

- **Natural Language Search**: Describe what you want to watch in plain English
- **Smart Recommendations**: Powered by AI to understand complex search queries
- **Customizable Themes**: Choose from six visually striking color schemes
- **Visual Presentation**: Attractive movie cards with posters and key information
- **Streaming Links**: Direct links to where each movie can be watched
- **Responsive Design**: Seamless experience across desktop and mobile

## 🛠️ Tech Stack

- **Next.js (App Router)**: For server-side rendering and optimal performance
- **TypeScript**: For type safety and improved developer experience
- **Tailwind CSS 3.3**: For responsive, utility-first styling
- **React 18**: For building interactive UI components
- **TMDB API**: For comprehensive movie data

## TMDB Movie JSON structure

```
{
  "adult": false,
  "backdrop_path": "/path/to/backdrop.jpg",
  "belongs_to_collection": null,
  "budget": 150000000,
  "genres": [
    {
      "id": 28,
      "name": "Action"
    },
    {
      "id": 12,
      "name": "Adventure"
    },
    {
      "id": 878,
      "name": "Science Fiction"
    }
  ],
  "homepage": "https://www.movie-website.com",
  "id": 550,
  "imdb_id": "tt1234567",
  "original_language": "en",
  "original_title": "Movie Title",
  "overview": "A brief description of the movie plot and storyline.",
  "popularity": 123.456,
  "poster_path": "/path/to/poster.jpg",
  "production_companies": [
    {
      "id": 1,
      "logo_path": "/path/to/company_logo.png",
      "name": "Production Company Name",
      "origin_country": "US"
    }
  ],
  "production_countries": [
    {
      "iso_3166_1": "US",
      "name": "United States of America"
    }
  ],
  "release_date": "2023-03-15",
  "revenue": 750000000,
  "runtime": 120,
  "spoken_languages": [
    {
      "english_name": "English",
      "iso_639_1": "en",
      "name": "English"
    },
    {
      "english_name": "Spanish",
      "iso_639_1": "es",
      "name": "Español"
    }
  ],
  "status": "Released",
  "tagline": "A catchy tagline for the movie.",
  "title": "Movie Title",
  "video": false,
  "vote_average": 7.8,
  "vote_count": 12345
}
```

## 🎨 Color Themes

PikFlix uses a theme-based styling approach that allows users to select from six distinct color palettes. Each theme has standardized color roles that must be consistently applied throughout the application. This document serves as a comprehensive reference for implementing these themes in your code.

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

## 🏗️ Project Structure

```
pikflix/
├── public/            # Static assets
├── src/
│   ├── app/           # App Router pages
│   │   ├── page.tsx   # Homepage with search interface
│   │   └── layout.tsx # Main layout component
│   ├── components/    # Reusable UI components
│   │   ├── MovieCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── MovieDetail.tsx
│   │   └── ThemeSelector.tsx
│   ├── lib/           # Utility functions
│   │   ├── api.ts     # TMDB API functions
│   │   └── themes.ts  # Theme management
│   ├── hooks/         # Custom React hooks
│   └── types/         # TypeScript type definitions
├── tailwind.config.js # Tailwind configuration with themes
└── next.config.js     # Next.js configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or newer
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pikflix.git
   cd pikflix
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your TMDB API key:
   ```
   TMDB_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Usage

1. Select your preferred theme from the theme selector
2. Enter a natural language query in the search bar (e.g., "dystopian sci-fi with female protagonists")
3. Browse the recommended movies that match your criteria
4. Click on a movie card to view more details
5. Follow streaming links to watch the movie on available platforms

## 📱 Responsive Design

PikFlix is designed to work beautifully on devices of all sizes:
- **Desktop**: Full-featured interface with grid layout
- **Tablet**: Adaptive grid with optimized spacing
- **Mobile**: Stack layout with touch-friendly controls

## 🧠 AI-Powered Recommendations

The recommendation engine uses natural language processing to understand:
- Genre preferences
- Mood and tone
- Plot elements and themes
- Character archetypes
- Cinematic styles

## 🔜 Roadmap

- User accounts and favorites
- Social sharing features
- Personalized recommendations based on viewing history
- Advanced filtering options
- Dark/light mode toggles for each theme

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for their comprehensive API
- [Next.js](https://nextjs.org/) for the fantastic React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) for the type safety