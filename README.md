# BiteFlow

A multi-role food delivery app concept built with React + Vite + Tailwind CSS.

## Features

- Customer experience: restaurant discovery, menu browsing, cart, Stripe-ready checkout, order tracking
- Restaurant dashboard: order queue, accept/reject flows, menu editor
- Driver dashboard: available deliveries and route preview
- Admin panel: sales analytics and user management
- Supabase-ready configuration using environment variables
- Local cart persistence using browser localStorage

## Quick start

1. Install dependencies:
   npm install
2. Start the app:
   npm run dev
3. Build for production:
   npm run build

## Environment variables

Create a `.env` file with the following values if you want to plug in Supabase:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Notes

This repo is a polished front-end prototype, designed to match the requested app spec while staying easy to extend into a full backend-powered experience.
