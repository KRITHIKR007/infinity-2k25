# Infinity 2025 Tech Fest Website

A dynamic website for the Infinity 2025 technical and cultural festival, built with modern web technologies and integrated with Supabase for backend functionality.

## Features

- **Event Management**: Create, update, and manage technical and cultural events
- **Registration System**: Online registration for participants with payment integration
- **Admin Dashboard**: Comprehensive dashboard for event organizers
- **Responsive Design**: Works seamlessly on all devices - mobile, tablet, and desktop
- **Dark Mode**: Modern dark theme with neon accents
- **Payment Integration**: Support for QR-based payments with verification system
- **Authentication**: Secure admin login system

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel/Netlify
- **Tools**: Node.js, npm

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/infinity-2025.git
   cd infinity-2025
   ```

2. Run the setup script:
   ```bash
   node setup.js
   ```
   
   The setup script will:
   - Create a `.env` file with your Supabase credentials
   - Install all dependencies
   - Optionally set up the database schema

3. Or install manually:
   ```bash
   npm install
   ```
   
   Then create a `.env` file in the project root with:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   EVENT_DATE=Mar 27, 2025 09:00:00
   REGISTRATION_DEADLINE=Mar 26, 2025 23:59:59
   NODE_ENV=development
   ```

### Development

Start the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:3000`.

### Building for Production

To build the site for production:

```bash
npm run build
```

The output will be in the `dist` directory, ready for deployment.

## Project Structure

```
/infinity-2025
│── public/
│   ├── images/   → Event images & assets
│   ├── styles/   → Tailwind CSS styles
│   ├── scripts/  → JavaScript logic
│── pages/
│   ├── register.html  
│   ├── admin.html  
│── index.html  → Main home page
│── app.js      → Handles form submission & Supabase connection
│── supabase.js → Backend logic for storing data
│── vercel.json → Vercel deployment config
│── README.md   → Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@infinity2025.com or create an issue in the repository.

## Acknowledgments

- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com)
- [Vercel](https://vercel.com)