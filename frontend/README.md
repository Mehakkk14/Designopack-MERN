# DesignOPack Frontend

The modern React + TypeScript frontend for the DesignOPack luxury showcase website, powered by a dedicated Express.js & MongoDB backend.

## Features

- **Product Catalog**: Browse luxury packaging products organized by categories
- **Product Details**: High-resolution image galleries and responsive modals
- **Quote Request System**: Seamless online quote requests with immediate admin tracking
- **Direct Messaging**: WhatsApp business contact integration
- **Admin Dashboard**: Secure management of products, categories, banners, and incoming quote inquiries
- **Performance Optimized**: Lazy-loaded routes, lightweight bundle, and responsive layouts

## Tech Stack

- **Framework**: React 18 + Vite (TypeScript)
- **Styling**: Tailwind CSS + Shadcn UI primitives
- **Icons & Animation**: Lucide React + Framer Motion
- **API Client**: REST API with JWT bearer authentication
- **Notifications**: Sonner & Radix Toast

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Copy `.env.example` to `.env` and configure `VITE_API_BASE_URL` (default: `http://localhost:5000/api`).

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```
