# Infinity 2025 Event Registration Website

A modern, responsive website for managing event registrations for Infinity 2025. Built with HTML, Tailwind CSS, and Supabase for backend functionality.

## Features

- 🎯 Modern, responsive design
- 📝 User registration form with file upload
- 🔒 Secure admin dashboard
- 🔍 Real-time search and filtering
- 💳 Payment verification system
- 📱 Mobile-friendly interface

## Tech Stack

- HTML5
- Tailwind CSS
- JavaScript (ES6+)
- Supabase (Backend & Authentication)
- Vercel (Deployment)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/infinity2025.git
   cd infinity2025
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project and get your credentials:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

4. Set up environment variables:
   Create a `.env` file in the root directory:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Set up Supabase database:
   - Create a `registrations` table with the following columns:
     - id (uuid, primary key)
     - name (text)
     - university (text)
     - phone (text)
     - team_members (array)
     - payment_proof_url (text)
     - payment_status (text)
     - created_at (timestamp)

6. Set up Supabase storage:
   - Create a `payment-proofs` bucket
   - Set appropriate storage policies

7. Deploy to Vercel:
   ```bash
   vercel
   ```

## Project Structure

```
/infinity2025
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