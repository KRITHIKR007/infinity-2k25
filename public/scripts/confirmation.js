import { supabase } from '../../supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Create confetti animation
    createConfetti();
    
    // Get registration details from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const registrationId = urlParams.get('id') || urlParams.get('registration_id');
    
    if (registrationId) {
        await fetchRegistrationDetails(registrationId);
    } else {
        // If no ID provided, use demo data
        populateWithDemoData();
    }
    
    // Handle download ticket button
    const downloadBtn = document.getElementById('downloadTicket');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            generatePDF();
        });
    }
});

// Create confetti animation
function createConfetti() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;
    
    const colors = ['#9333ea', '#a855f7', '#c084fc', '#e879f9', '#f0abfc'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        
        container.appendChild(confetti);
    }
}

// Fetch registration details from Supabase
async function fetchRegistrationDetails(id) {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) throw error;
        
        if (data) {
            // Fetch associated event details
            const eventIds = Array.isArray(data.events) ? data.events : [];
            const { data: eventDetails, error: eventsError } = await supabase
                .from('events')
                .select('*')
                .in('id', eventIds);
                
            if (eventsError) console.error('Error fetching event details:', eventsError);
            
            // Combine registration data with event details
            const registrationData = {
                ...data,
                event_details: eventDetails || []
            };
            
            // Populate the UI with the fetched data
            populateUI(registrationData);
        } else {
            throw new Error('Registration not found');
        }
    } catch (error) {
        console.error("Error fetching registration details:", error);
        alert("Failed to load registration details. Using demo data instead.");
        
        // Fall back to demo data
        populateWithDemoData();
    }
}

// Populate UI with dummy data
function populateWithDemoData() {
    const demoData = {
        id: "INF-2025-12345",
        name: "John Doe",
        email: "john.doe@example.com",
        events: ["drone-xtreme", "innovathon"],
        event_name: "Drone Xtreme, Innovathon",
        fee: 750,
        payment_status: "pending",
        created_at: new Date().toISOString(),
        event_details: [
            {
                name: "Drone Xtreme",
                date: "March 27, 2025",
                venue: "Open Ground",
                time: "11:00 AM - 3:00 PM"
            },
            {
                name: "Innovathon",
                date: "March 28, 2025",
                venue: "Computer Lab 2",
                time: "9:00 AM - 1:00 PM"
            }
        ]
    };
    
    populateUI(demoData);
}

// Populate UI with registration data
function populateUI(data) {
    // Update basic registration info
    updateElementText('registrationId', data.registration_id || data.id);
    updateElementText('userName', data.name);
    updateElementText('userEmail', data.email);
    updateElementText('registeredEvents', data.event_name);
    updateElementText('registrationFee', `₹${data.fee}`);
    updateElementText('registrationDate', formatDate(data.created_at));
    
    // Set payment status with appropriate icon and color
    updatePaymentStatus(data.payment_status);
    
    // Populate event details
    populateEventDetails(data.event_details);
    
    // Show payment proof if available
    displayPaymentProof(data.payment_proof_url);
}

// Update element text if element exists
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

// Update payment status display
function updatePaymentStatus(status) {
    const statusElement = document.getElementById('paymentStatus');
    const statusIconElement = document.getElementById('paymentStatusIcon');
    
    if (!statusElement || !statusIconElement) return;
    
    let statusText, statusClass, iconClass;
    
    switch(status) {
        case 'paid':
            statusText = 'Payment Confirmed';
            statusClass = 'bg-green-900 text-green-300';
            iconClass = 'fas fa-check-circle text-green-400';
            break;
        case 'pending':
            statusText = 'Payment Verification Pending';
            statusClass = 'bg-yellow-900 text-yellow-300';
            iconClass = 'fas fa-clock text-yellow-400';
            break;
        case 'rejected':
            statusText = 'Payment Rejected';
            statusClass = 'bg-red-900 text-red-300';
            iconClass = 'fas fa-times-circle text-red-400';
            break;
        default:
            statusText = 'Payment Status Unknown';
            statusClass = 'bg-gray-800 text-gray-300';
            iconClass = 'fas fa-question-circle text-gray-400';
    }
    
    statusElement.textContent = statusText;
    statusElement.className = `px-4 py-2 rounded-full text-sm font-medium ${statusClass}`;
    statusIconElement.className = iconClass;
}

// Display payment proof if available
function displayPaymentProof(proofUrl) {
    const proofContainer = document.getElementById('paymentProofContainer');
    if (!proofContainer) return;
    
    if (proofUrl) {
        proofContainer.innerHTML = `
            <div class="mt-4">
                <h4 class="text-lg font-medium text-purple-400 mb-2">Payment Proof</h4>
                <img src="${proofUrl}" alt="Payment Proof" class="max-w-full h-auto rounded-lg border border-gray-700">
            </div>
        `;
    } else {
        proofContainer.innerHTML = `
            <div class="mt-4 p-4 bg-gray-800 rounded-lg text-center">
                <p class="text-gray-400">No payment proof available</p>
            </div>
        `;
    }
}

// Populate event details
function populateEventDetails(events) {
    const eventDetailsContainer = document.querySelector('#eventDetails .grid');
    if (!eventDetailsContainer || !events || !events.length) return;
    
    eventDetailsContainer.innerHTML = '';
    
    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'bg-gray-800 bg-opacity-50 rounded-lg p-4';
        eventCard.innerHTML = `
            <h4 class="text-purple-400 font-semibold mb-2">${event.name || 'Unknown Event'}</h4>
            <div class="text-sm text-gray-300">
                <p><i class="fas fa-calendar-alt text-purple-400 mr-2"></i>${event.date || 'March 27, 2025'}</p>
                <p><i class="fas fa-map-marker-alt text-purple-400 mr-2"></i>${event.venue || 'Main Campus'}</p>
                <p><i class="fas fa-clock text-purple-400 mr-2"></i>${event.time || '10:00 AM - 2:00 PM'}</p>
            </div>
        `;
        eventDetailsContainer.appendChild(eventCard);
    });
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Generate PDF ticket (placeholder function)
function generatePDF() {
    alert('This feature will be available soon! Your ticket details have been emailed to you.');
    // In a real implementation, this would use a library like jsPDF to generate a PDF
}
