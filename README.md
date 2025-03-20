# INFINITY-2K25 Event Website

The official website for INFINITY-2K25, the annual technical and cultural fest organized by the Faculty of Engineering and Technology, Jain (Deemed-to-be University), Bangalore.

## Features

- Event showcase and registration
- Seamless payment integration with QR code
- Admin dashboard for registration management
- Responsive design for all devices

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Database: Supabase
- Authentication: Supabase Auth
- Storage: Supabase Storage
- Hosting: Vercel

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Supabase:
   - Create a .env file based on .env.example
   - Add your Supabase URL and API key
4. Run the development server: `npm run dev`

## Deployment

This site is set up for deployment on Vercel. Simply connect your GitHub repository to Vercel and it will automatically deploy when changes are pushed to the main branch.

## Environment Variables

Create a `.env` file with the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Database Setup

Run the database setup scripts to create the necessary tables and storage buckets:

```
node migrations/create_tables.js
node migrations/create_storage.js
```

## Contributors

- Krithik R (Lead Developer)
- Dhrub Kumar Jha (Technical Events Coordinator)
- Rohan (Cultural Events Coordinator)

## License

MIT License