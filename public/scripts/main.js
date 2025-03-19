// Main JavaScript file for INFINITY-2K25 website
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Initialize Supabase client
    initializeSupabase();
});

// Supabase configuration
const SUPABASE_URL = 'https://ceickbodqhwfhcpabfdq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWNrYm9kcWh3ZmhjcGFiZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2MTgsImV4cCI6MjA1NzkxMTYxOH0.ZyTG1FkQzjQ0CySlyvkQEYPHWBbZJd--vsB_IqILuo8';
let supabase;

async function initializeSupabase() {
    try {
        // Dynamically import Supabase client
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        
        // Initialize the client
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        
        // Check if user is already logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            console.log('User is logged in:', user.email);
            updateUIForLoggedInUser(user);
        }
    } catch (error) {
        console.error('Error initializing Supabase:', error);
    }
}

// Registration form handling
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const college = document.getElementById('college').value;
        const events = document.getElementById('events').value;
        
        try {
            // Insert registration data into Supabase
            const { data, error } = await supabase
                .from('registrations')
                .insert([
                    { 
                        name, 
                        email, 
                        phone, 
                        college, 
                        events,
                        status: 'pending',
                        created_at: new Date()
                    }
                ]);
                
            if (error) throw error;
            
            alert('Registration successful! You will receive a confirmation email shortly.');
            registerForm.reset();
            
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Registration failed. Please try again.');
        }
    });
}

// Contact form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        try {
            // Insert contact message into Supabase
            const { data, error } = await supabase
                .from('contact_messages')
                .insert([
                    { 
                        name, 
                        email, 
                        message,
                        status: 'unread',
                        created_at: new Date()
                    }
                ]);
                
            if (error) throw error;
            
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
            
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    });
}

// Login form handling
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Redirect to admin dashboard or profile page
            if (data.user.user_metadata.role === 'admin') {
                window.location.href = '/admin/dashboard.html';
            } else {
                window.location.href = '/profile.html';
            }
            
        } catch (error) {
            console.error('Error during login:', error);
            alert('Login failed. Please check your credentials.');
        }
    });
}

// UI update for logged-in users
function updateUIForLoggedInUser(user) {
    const loginButtons = document.querySelectorAll('.login-button');
    const profileButtons = document.querySelectorAll('.profile-button');
    
    if (loginButtons.length) {
        loginButtons.forEach(button => {
            button.classList.add('hidden');
        });
    }
    
    if (profileButtons.length) {
        profileButtons.forEach(button => {
            button.classList.remove('hidden');
            button.textContent = `Hello, ${user.user_metadata.name || user.email}`;
        });
    }
}

// Logout functionality
const logoutButtons = document.querySelectorAll('.logout-button');
if (logoutButtons.length) {
    logoutButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                
                window.location.href = '/index.html';
            } catch (error) {
                console.error('Error during logout:', error);
                alert('Failed to logout. Please try again.');
            }
        });
    });
}

// Event fetch functionality for event pages
async function fetchEvents(category) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('category', category);
            
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error(`Error fetching ${category} events:`, error);
        return [];
    }
}

// Function to display events on the page
function displayEvents(events, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'glass-effect rounded-lg overflow-hidden';
        
        eventCard.innerHTML = `
            <div class="relative">
                <img src="${event.poster_url}" alt="${event.name}" class="w-full h-48 object-cover">
                <div class="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                    ${event.date}
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-xl font-semibold text-white mb-2">${event.name}</h3>
                <p class="text-gray-300 text-sm mb-3">${event.short_description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-purple-400">${event.time}</span>
                    <a href="events/${event.slug}.html" class="bg-purple-600 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-700 transition-colors">
                        View Details
                    </a>
                </div>
            </div>
        `;
        
        container.appendChild(eventCard);
    });
}

// Load tech events if on tech page
const techEventsContainer = document.getElementById('tech-events-container');
if (techEventsContainer) {
    (async function() {
        const events = await fetchEvents('technical');
        displayEvents(events, 'tech-events-container');
    })();
}

// Load cultural events if on cultural page
const culturalEventsContainer = document.getElementById('cultural-events-container');
if (culturalEventsContainer) {
    (async function() {
        const events = await fetchEvents('cultural');
        displayEvents(events, 'cultural-events-container');
    })();
} 