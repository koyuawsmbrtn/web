# koyu's personal website

A modern, performant website built with SvelteKit, Tailwind CSS v4, and Sanity CMS in an Nx monorepo.

## Features

- ⚡ SvelteKit for server-side rendering and static site generation
- 🎨 Custom UI components with Bits UI and Tailwind CSS v4
- 🌊 Tailwind CSS v4 for modern utility-first styling
- 📝 Sanity CMS for content management
- 🎭 Light/Dark mode support with mode-watcher
- 📱 Responsive design
- 🔍 SEO optimized
- 🚀 Fast page loads with SvelteKit's optimizations
- 🛠️ Nx monorepo for efficient development and build processes
- ☁️ Cloudflare Workers deployment

## Getting Started

### Prerequisites

- Bun (>= 1.2.12)
- Git
- Node.js (for Sanity Studio)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/koyuspace/web.git
cd web
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update the `.env.local` file with your Sanity credentials:
```env
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_API_VERSION=2024-03-16
```

### Development

Run the development server for all applications:
```bash
bun run dev
```

Or run specific applications:
```bash
# SvelteKit client only
nx run client:dev

# Sanity Studio only
nx run studio:dev
```

The SvelteKit app will be available at [http://localhost:5173](http://localhost:5173)
The Sanity Studio will be available at [http://localhost:3333](http://localhost:3333)

### Building for Production

Build all applications:
```bash
bun run build
```

Or build specific applications:
```bash
# Build client for production
nx run client:build

# Build and deploy Sanity Studio
nx run studio:deploy
```

## Project Structure

```
web/
├── apps/
│   ├── client/        # SvelteKit frontend application
│   └── studio/        # Sanity Studio CMS
├── packages/          # Shared packages and utilities
│   ├── sanity-connection/  # Sanity client configuration
│   ├── typescript-config/  # Shared TypeScript configurations
│   └── ui/            # Shared UI components and design tokens
└── static/           # Static assets
```

## Content Management

The site uses Sanity CMS for content management. To access the Sanity Studio:

1. Start the studio in development mode:
```bash
nx run studio:dev
```

Or access the deployed studio at your configured URL.

Open [http://localhost:3333](http://localhost:3333) to access Sanity Studio locally.

## Available Scripts

- `bun run dev` - Start all applications in development mode
- `bun run build` - Build all applications for production
- `bun run lint` - Run linting across all packages
- `bun run format` - Format code with Prettier
- `bun run check` - Run type checking
- `bun run deploy` - Deploy applications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

- koyu - [https://web.koyu.space](https://web.koyu.space)
