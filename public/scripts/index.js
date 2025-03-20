/**
 * Main entry point for the Infinity 2025 website scripts
 * Loads appropriate modules based on current page
 */

import { supabase } from '../../supabase.js';
import * as constants from './constants.js';

// Determine which page we're on
const currentPage = getCurrentPage();

// Execute page-specific initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Common initialization for all pages
        initCommon();
        
        // Page-specific initialization
        switch (currentPage) {
            case 'home':
                await initHome();
                break;
            case 'register':
                await initRegister();
                break;
            case 'events-tech':
                await initEvents('tech');
                break;
            case 'events-cultural':
                await initEvents('cultural');
                break;
            case 'event-details':
                await initEventDetails();
                break;
            case 'confirmation':
                await initConfirmation();
                break;
            case 'contact':
                initContact();
                break;
            // Admin pages will use their own specific scripts
        }
        
        // Remove loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('page-loaded');
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
            }, 500);
        }
    } catch (error) {
        console.error('Initialization error:', error);
        
        // Show error message
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            errorContainer.textContent = 'Something went wrong. Please try refreshing the page.';
            errorContainer.classList.remove('hidden');
        }
        
        // Remove loading overlay on error
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }
});

// Initialize common elements across all pages
function initCommon() {
    // Initialize mobile menu toggle
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            
            // Toggle icon
            const menuIcon = mobileMenuButton.querySelector('.menu-icon');
            const closeIcon = mobileMenuButton.querySelector('.close-icon');
            
            if (menuIcon && closeIcon) {
                menuIcon.classList.toggle('hidden');
                closeIcon.classList.toggle('hidden');
            }
        });
    }
    
    // Initialize countdown timer if present
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        initCountdown(countdownElement, constants.ENV.EVENT_DATE);
    }
    
    // Initialize notification styles
    const notificationContainer = document.querySelector('.notifications-container');
    if (!notificationContainer && document.querySelector('[data-notifications]')) {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
}

// Home page initialization
async function initHome() {
    // Fetch featured events
    try {
        const { data: events, error } = await supabase
            .from(constants.TABLES.EVENTS)
            .select('id, name, description, category, venue, event_date, fee')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(6);
            
        if (error) throw error;
        
        // Populate featured events section
        const featuredEventsContainer = document.getElementById('featuredEvents');
        if (featuredEventsContainer && events?.length > 0) {
            renderFeaturedEvents(featuredEventsContainer, events);
        }
    } catch (error) {
        console.error('Error fetching featured events:', error);
    }
    
    // Initialize animations
    initAnimations();
}

// Registration page initialization
async function initRegister() {
    try {
        // Import required modules
        const { default: registerScript } = await import('./register.js');
        
        // Initialize registration form
        if (typeof registerScript.init === 'function') {
            registerScript.init();
        }
    } catch (error) {
        console.error('Error initializing registration page:', error);
    }
}

// Events listing page initialization
async function initEvents(category) {
    try {
        // Fetch events in this category
        const { data: events, error } = await supabase
            .from(constants.TABLES.EVENTS)
            .select('*')
            .eq('category', category)
            .eq('status', 'active')
            .order('name', { ascending: true });
            
        if (error) throw error;
        
        // Render events
        const eventsContainer = document.getElementById('eventsContainer');
        if (eventsContainer && events?.length > 0) {
            renderEventsList(eventsContainer, events);
        } else if (eventsContainer) {
            eventsContainer.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-calendar-times text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-300">No ${category === 'tech' ? 'technical' : 'cultural'} events are currently available.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error(`Error initializing ${category} events page:`, error);
    }
}

// Event details page initialization
async function initEventDetails() {
    try {
        // Get event ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('id');
        
        if (!eventId) {
            throw new Error('Event ID not provided');
        }
        
        // Fetch event details
        const { data: event, error } = await supabase
            .from(constants.TABLES.EVENTS)
            .select('*')
            .eq('id', eventId)
            .single();
            
        if (error) throw error;
        
        // Populate event details on the page
        if (event) {
            populateEventDetails(event);
        } else {
            throw new Error('Event not found');
        }
    } catch (error) {
        console.error('Error initializing event details page:', error);
        
        // Show error message
        document.getElementById('eventDetails').innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
                <p class="text-gray-300">Event not found or an error occurred. Please try again.</p>
                <a href="javascript:history.back()" class="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-md">
                    <i class="fas fa-arrow-left mr-2"></i>Go Back
                </a>
            </div>
        `;
    }
}

// Confirmation page initialization
async function initConfirmation() {
    try {
        await import('./confirmation.js');
    } catch (error) {
        console.error('Error initializing confirmation page:', error);
    }
}

// Contact page initialization
function initContact() {
    try {
        import('./contact.js');
    } catch (error) {
        console.error('Error initializing contact page:', error);
    }
}

// Helper functions

// Determine current page
function getCurrentPage() {
    const path = window.location.pathname.toLowerCase();
    
    if (path.endsWith('index.html') || path === '/' || path === '') {
        return 'home';
    } else if (path.includes('/register.html')) {
        return 'register';
    } else if (path.includes('/tech.html')) {
        return 'events-tech';
    } else if (path.includes('/cultural.html')) {
        return 'events-cultural';
    } else if (path.includes('/confirmation.html')) {
        return 'confirmation';
    } else if (path.includes('/contact.html')) {
        return 'contact';
    } else if (path.includes('/events/')) {
        return 'event-details';
    }
    
    return 'other';
}

// Initialize countdown timer
function initCountdown(element, targetDateString) {
    // Set the date we're counting down to
    const targetDate = new Date(targetDateString).getTime();
    
    // Update the countdown every 1 second
    const countdown = setInterval(function() {
        // Get current date and time
        const now = new Date().getTime();
        
        // Calculate the distance between now and the target date
        const distance = targetDate - now;
        
        // If the countdown is over, display a message
        if (distance < 0) {
            clearInterval(countdown);
            element.innerHTML = '<span class="text-purple-400">Event has started!</span>';
            return;
        }
        
        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update the element with the countdown
        element.innerHTML = `
            <div class="countdown-item">
                <span class="countdown-value">${days}</span>
                <span class="countdown-label">Days</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${hours}</span>
                <span class="countdown-label">Hours</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${minutes}</span>
                <span class="countdown-label">Minutes</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${seconds}</span>
                <span class="countdown-label">Seconds</span>
            </div>
        `;
    }, 1000);
}

// Initialize animations
function initAnimations() {
    const animatedElements = document.querySelectorAll('[data-animation]');
    
    if (animatedElements.length === 0) return;
    
    // Create an intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const animation = el.dataset.animation;
                const delay = el.dataset.delay || 0;
                
                setTimeout(() => {
                    el.classList.add(animation);
                    el.classList.add('animate-visible');
                }, delay);
                
                // Stop observing after animation is applied
                observer.unobserve(el);
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe all elements with data-animation
    animatedElements.forEach(el => {
        el.classList.add('animate-prepare');
        observer.observe(el);
    });
}

// Render featured events on home page
function renderFeaturedEvents(container, events) {
    container.innerHTML = events.map(event => `
        <div class="glass-effect overflow-hidden rounded-xl transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg hover:-translate-y-1">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-white">${event.name}</h3>
                    <span class="px-2 py-1 text-xs rounded-full ${event.category === 'tech' ? 'bg-blue-900 bg-opacity-50 text-blue-300' : 'bg-purple-900 bg-opacity-50 text-purple-300'}">
                        ${event.category === 'tech' ? 'Technical' : 'Cultural'}
                    </span>
                </div>
                <p class="text-gray-300 text-sm mb-4 line-clamp-2">${event.description}</p>
                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-400">
                        <i class="fas fa-map-marker-alt mr-1"></i> ${event.venue}
                    </div>
                    <div class="text-sm font-semibold text-purple-400">₹${event.fee}</div>
                </div>
                <a href="/pages/events/${event.id}.html" class="mt-4 block text-center py-2 bg-purple-600 bg-opacity-60 hover:bg-opacity-100 text-white rounded-md transition-colors">
                    View Details
                </a>
            </div>
        </div>
    `).join('');
}

// Render events list on category pages
function renderEventsList(container, events) {
    container.innerHTML = events.map(event => `
        <div class="glass-effect rounded-xl overflow-hidden">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-white">${event.name}</h3>
                    <span class="px-2 py-1 text-xs rounded-full bg-purple-900 bg-opacity-50 text-purple-300">
                        ₹${event.fee}
                    </span>
                </div>
                <p class="text-gray-300 text-sm mb-4 line-clamp-3">${event.description}</p>
                <div class="flex justify-between text-sm text-gray-400 mb-4">
                    <div><i class="fas fa-users mr-1"></i> Team: ${event.min_team_size}-${event.max_team_size} members</div>
                    <div><i class="fas fa-calendar-day mr-1"></i> ${formatDate(event.event_date)}</div>
                </div>
                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-400">
                        <i class="fas fa-map-marker-alt mr-1"></i> ${event.venue}
                    </div>
                    <a href="/pages/events/${event.id}.html" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
                        View Details
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Populate event details page
function populateEventDetails(event) {
    // Set page title
    document.title = `${event.name} | Infinity 2025`;
    
    // Update event name and category
    document.getElementById('eventName').textContent = event.name;
    document.getElementById('eventCategory').textContent = event.category === 'tech' ? 'Technical Event' : 'Cultural Event';
    document.getElementById('eventCategory').className = `px-3 py-1 text-xs font-medium rounded-full ${
        event.category === 'tech' ? 'bg-blue-900 bg-opacity-50 text-blue-300' : 'bg-purple-900 bg-opacity-50 text-purple-300'
    }`;
    
    // Update event details
    document.getElementById('eventDescription').textContent = event.description;
    document.getElementById('eventFee').textContent = `₹${event.fee}`;
    document.getElementById('eventTeamSize').textContent = `${event.min_team_size}-${event.max_team_size} members`;
    document.getElementById('eventDate').textContent = formatDate(event.event_date);
    document.getElementById('eventVenue').textContent = event.venue;
    
    // Update register button
    const registerButton = document.getElementById('registerButton');
    if (registerButton) {
        registerButton.href = `/pages/register.html?event=${event.id}`;
    }
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
