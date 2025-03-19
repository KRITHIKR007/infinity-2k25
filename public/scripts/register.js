// Define Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
export const supabaseUrl = 'https://ceickbodqhwfhcpabfdq.supabase.co';
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWNrYm9kcWh3ZmhjcGFiZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2MTgsImV4cCI6MjA1NzkxMTYxOH0.ZyTG1FkQzjQ0CySlyvkQEYPHWBbZJd--vsB_IqILuo8';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Define database tables and constants
export const TABLES = {
    REGISTRATIONS: 'registrations',
    EVENTS: 'events',
    PAYMENTS: 'payments',
    PARTICIPANTS: 'participants',
    STORAGE: {
        PAYMENT_PROOFS: 'payment_proofs'
    }
};

// Form validation functions
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePhone(phone) {
    // Basic validation for Indian phone numbers
    const re = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
    return re.test(phone);
}

// Fetch events from Supabase
export async function getEvents() {
    try {
        const { data, error } = await supabase
            .from(TABLES.EVENTS)
            .select('*');
            
        if (error) throw error;

        // Group events by category
        const groupedEvents = data.reduce((acc, event) => {
            if (!acc[event.category]) {
                acc[event.category] = [];
            }
            acc[event.category].push(event);
            return acc;
        }, {});

        return groupedEvents;
    } catch (error) {
        console.error('Error fetching events:', error);
        return null;
    }
}

// Submit registration to Supabase
export async function submitRegistration(registrationData) {
    try {
        // Upload payment proof if QR payment
        let paymentId = null;
        
        if (registrationData.paymentMethod === 'qr' && registrationData.paymentProof) {
            // Upload payment proof to Supabase storage
            const filePath = `payment-proofs/${Date.now()}-${registrationData.paymentProof.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(TABLES.STORAGE.PAYMENT_PROOFS)
                .upload(filePath, registrationData.paymentProof);
                
            if (uploadError) throw uploadError;
            
            // Get public URL for the uploaded file
            const proofUrl = supabase.storage
                .from(TABLES.STORAGE.PAYMENT_PROOFS)
                .getPublicUrl(filePath).data.publicUrl;
                
            // Create payment record
            const { data: paymentData, error: paymentError } = await supabase
                .from(TABLES.PAYMENTS)
                .insert([
                    {
                        amount: registrationData.totalFee,
                        currency: 'INR',
                        status: 'pending',
                        payment_method: 'qr',
                        proof_url: proofUrl,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();
                
            if (paymentError) throw paymentError;
            
            paymentId = paymentData[0].id;
        }
        
        // Create registration record
        const { data: registrationResult, error: registrationError } = await supabase
            .from(TABLES.REGISTRATIONS)
            .insert([
                {
                    name: registrationData.name,
                    email: registrationData.email,
                    phone: registrationData.phone,
                    university: registrationData.university,
                    events: JSON.stringify(registrationData.selectedEvents),
                    event_name: registrationData.eventNames,
                    payment_status: registrationData.paymentMethod === 'qr' ? 'pending' : 'awaiting_payment',
                    payment_id: paymentId,
                    created_at: new Date().toISOString(),
                    team_name: registrationData.teamName || null,
                    team_members: JSON.stringify(registrationData.teamMembers || []),
                    category: registrationData.category,
                    fee: registrationData.totalFee
                }
            ])
            .select();
            
        if (registrationError) throw registrationError;
        
        // Insert participants for each selected event
        if (registrationResult && registrationResult.length > 0) {
            const registrationId = registrationResult[0].id;
            
            // Create participant records
            const participantPromises = registrationData.selectedEvents.map(async (eventId) => {
                return supabase
                    .from(TABLES.PARTICIPANTS)
                    .insert([
                        {
                            registration_id: registrationId,
                            event_id: eventId,
                            name: registrationData.name,
                            email: registrationData.email,
                            status: 'registered'
                        }
                    ]);
            });
            
            await Promise.all(participantPromises);
        }
        
        return {
            success: true,
            registrationId: registrationResult[0].id
        };
    } catch (error) {
        console.error('Error submitting registration:', error);
        return {
            success: false,
            error: error.message || 'Failed to submit registration'
        };
    }
}

// Event data
const events = {
    tech: [
        {
            id: 'innovathon',
            name: 'Innovathon',
            description: 'Hackathon for innovative solutions',
            fee: 500,
            teamSize: 4,
            date: 'March 18-19, 2025'
        },
        {
            id: 'model-blitz',
            name: 'Model Blitz',
            description: 'SolidWorks Design Challenge',
            fee: 200,
            teamSize: 1,
            date: 'March 20, 2025'
        },
        {
            id: 'drone-xtreme',
            name: 'DroneXtreme',
            description: 'Aerial Agility & Precision Challenge',
            fee: 600,
            teamSize: 3,
            date: 'March 21, 2025'
        },
        {
            id: 'phantom-hunt',
            name: 'Phantom Hunt',
            description: 'Cybersecurity investigation challenge',
            fee: 400,
            teamSize: 3,
            date: 'March 22, 2025'
        }
    ],
    cultural: [
        {
            id: 'nritya-vedika',
            name: 'Nritya Vedika',
            description: 'Group Dance Competition',
            fee: 1000,
            teamSize: 15,
            date: 'March 15, 2025'
        },
        {
            id: 'echoes-strings',
            name: 'Echoes & Strings',
            description: 'Live Music Competition',
            fee: 800,
            teamSize: 8,
            date: 'March 16, 2025'
        },
        {
            id: 'fashion-fusion',
            name: 'Fashion Fusion',
            description: 'Fashion Design Competition',
            fee: 1200,
            teamSize: 10,
            date: 'March 17, 2025'
        }
    ]
};

// Form state
let currentStep = 1;
let selectedCategory = null;
let selectedEvents = new Set();
let totalFee = 0;
let paymentMethod = '';
let userId = null;

// DOM Elements
const form = document.getElementById('registrationForm');
const steps = document.querySelectorAll('[id^="step"]');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const eventsContainer = document.getElementById('eventsContainer');
const eventsList = document.getElementById('eventsList');
const teamMembersContainer = document.getElementById('teamMembersContainer');
const qrPayment = document.getElementById('qrPayment');
const venuePayment = document.getElementById('venuePayment');

// Show message function
function showMessage(element, duration = 5000) {
    element.classList.remove('hidden')
    setTimeout(() => {
        element.classList.add('hidden')
    }, duration)
}

// Category Selection
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        selectedCategory = btn.dataset.category;
        document.querySelectorAll('.category-btn').forEach(b => {
            b.classList.remove('bg-purple-600');
            b.classList.add('bg-gray-700');
        });
        btn.classList.remove('bg-gray-700');
        btn.classList.add('bg-purple-600');
        showEvents(selectedCategory);
        eventsList.classList.remove('hidden');
        
        // Set the appropriate QR code based on category
        if (document.getElementById('techQrCode') && document.getElementById('culturalQrCode')) {
            document.getElementById('techQrCode').classList.toggle('hidden', selectedCategory !== 'tech');
            document.getElementById('culturalQrCode').classList.toggle('hidden', selectedCategory !== 'cultural');
        }
    });
});

// Show Events
function showEvents(category) {
    eventsContainer.innerHTML = '';
    totalFee = 0;
    selectedEvents.clear();
    
    events[category].forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'card p-4 mb-3';
        eventCard.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <h4 class="text-lg font-medium text-purple-400">${event.name}</h4>
                    <p class="text-gray-300 text-sm">${event.description}</p>
                    <p class="text-gray-400 text-sm mt-1">Fee: ₹${event.fee} | Team: ${event.teamSize > 1 ? event.teamSize + ' members' : 'Individual'} | Date: ${event.date}</p>
                </div>
                <div>
                    <label class="toggle-container">
                        <input type="checkbox" data-id="${event.id}" data-fee="${event.fee}" data-team-size="${event.teamSize}" class="event-checkbox sr-only">
                        <span class="toggle-switch"></span>
                    </label>
                </div>
            </div>
        `;
        eventsContainer.appendChild(eventCard);
    });
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.event-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const eventId = this.dataset.id;
            const fee = parseInt(this.dataset.fee);
            const teamSize = parseInt(this.dataset.teamSize);
            
            if (this.checked) {
                selectedEvents.add(eventId);
                totalFee += fee;
                // Update team members section based on team size
                updateTeamSection(teamSize);
            } else {
                selectedEvents.delete(eventId);
                totalFee -= fee;
            }
            
            // Toggle the toggle-switch style
            const toggleSwitch = this.nextElementSibling;
            if (this.checked) {
                toggleSwitch.classList.add('bg-purple-600');
                toggleSwitch.classList.remove('bg-gray-700');
            } else {
                toggleSwitch.classList.remove('bg-purple-600');
                toggleSwitch.classList.add('bg-gray-700');
            }
        });
    });
}

// Update team section based on team size
function updateTeamSection(teamSize) {
    // Will be used when navigating to team section
    const teamSection = document.getElementById('step3');
    const teamNameField = document.getElementById('teamName');
    
    if (teamSize > 1) {
        teamNameField.setAttribute('required', 'required');
        teamMembersContainer.innerHTML = '';
        
        // Add initial team member field
        const initialField = document.createElement('div');
        initialField.className = 'flex items-center space-x-4';
        initialField.innerHTML = `
            <input type="text" name="teamMembers[]" required
                class="form-input flex-1"
                placeholder="Enter team member name">
            <button type="button" class="btn btn-secondary" onclick="addTeamMember()">
                <i class="fas fa-plus"></i>
            </button>
        `;
        teamMembersContainer.appendChild(initialField);
    } else {
        teamNameField.removeAttribute('required');
        teamMembersContainer.innerHTML = '<p class="text-gray-400">This is an individual event. No team members required.</p>';
    }
}

// Add Team Member
function addTeamMember() {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'flex items-center space-x-4';
    memberDiv.innerHTML = `
        <input type="text" name="teamMembers[]" required
            class="form-input flex-1"
            placeholder="Enter team member name">
        <button type="button" class="btn btn-secondary" onclick="this.parentElement.remove()">
            <i class="fas fa-minus"></i>
        </button>
    `;
    teamMembersContainer.appendChild(memberDiv);
}

// Payment Method Selection
document.querySelectorAll('.payment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const method = btn.dataset.method;
        paymentMethod = method; // Store the selected payment method in the global variable
        
        // Reset all buttons
        document.querySelectorAll('.payment-btn').forEach(b => {
            b.classList.remove('bg-purple-600');
            b.classList.add('bg-gray-700');
        });
        
        // Highlight selected button
        btn.classList.remove('bg-gray-700');
        btn.classList.add('bg-purple-600');
        
        // Show appropriate payment section
        qrPayment.classList.toggle('hidden', method !== 'qr');
        venuePayment.classList.toggle('hidden', method !== 'venue');
        
        // Update required attribute for payment proof
        const paymentProof = document.getElementById('paymentProof');
        if (paymentProof) {
            if (method === 'qr') {
                paymentProof.setAttribute('required', 'required');
            } else {
                paymentProof.removeAttribute('required');
            }
        }
    });
});

// Form Navigation
function showStep(step) {
    // Update progress indicators
    document.querySelectorAll('div[class*="rounded-full"]').forEach((el, index) => {
        if (index + 1 < step) {
            el.classList.remove('bg-gray-700');
            el.classList.add('bg-green-600');
            el.innerHTML = '<i class="fas fa-check"></i>';
        } else if (index + 1 === step) {
            el.classList.remove('bg-gray-700', 'bg-green-600');
            el.classList.add('bg-purple-600');
            el.innerHTML = step;
        } else {
            el.classList.remove('bg-purple-600', 'bg-green-600');
            el.classList.add('bg-gray-700');
            el.innerHTML = index + 1;
        }
    });
    
    // Show the current step
    steps.forEach(s => s.classList.add('hidden'));
    document.getElementById(`step${step}`).classList.remove('hidden');
    
    // Handle navigation buttons
    prevBtn.classList.toggle('hidden', step === 1);
    nextBtn.classList.toggle('hidden', step === 4);
    submitBtn.classList.toggle('hidden', step !== 4);
}

function validateStep(step) {
    switch (step) {
        case 1:
            if (!selectedCategory || selectedEvents.size === 0) {
                showError('Please select a category and at least one event');
                return false;
            }
            break;
        case 2:
            const requiredFields = ['name', 'email', 'university', 'phone'];
            for (const field of requiredFields) {
                const input = document.getElementById(field);
                if (!input.value.trim()) {
                    showError(`Please fill in your ${field}`);
                    input.focus();
                    return false;
                }
            }
            break;
        case 3:
            const selectedEvent = events[selectedCategory].find(e => selectedEvents.has(e.id));
            if (selectedEvent && selectedEvent.teamSize > 1) {
                const teamMembers = teamMembersContainer.querySelectorAll('input[name="teamMembers[]"]');
                if (teamMembers.length < selectedEvent.teamSize - 1) {
                    showError(`Please add at least ${selectedEvent.teamSize - 1} team members`);
                    return false;
                }
            }
            break;
        case 4:
            const paymentMethodSelected = document.querySelector('.payment-btn.bg-purple-600');
            if (!paymentMethodSelected) {
                showError('Please select a payment method');
                return false;
            }
            
            const selectedMethod = paymentMethodSelected.dataset.method;
            if (selectedMethod === 'qr') {
                const paymentProof = document.getElementById('paymentProof');
                if (!paymentProof || !paymentProof.files.length) {
                    showError('Please upload your payment proof');
                    return false;
                }
                
                // Check file size (max 5MB)
                const maxSize = 5 * 1024 * 1024; // 5MB in bytes
                if (paymentProof.files[0].size > maxSize) {
                    showError('Payment proof file is too large (maximum 5MB)');
                    return false;
                }
                
                // Check file type (only images)
                const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
                if (!validTypes.includes(paymentProof.files[0].type)) {
                    showError('Please upload an image file (JPG, PNG, or GIF)');
                    return false;
                }
            }
            break;
    }
    return true;
}

// Navigation Event Listeners
nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
    }
});

prevBtn.addEventListener('click', () => {
    currentStep--;
    showStep(currentStep);
});

// Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';

    try {
        // Check if payment method is selected
        if (!document.querySelector('.payment-btn.bg-purple-600')) {
            throw new Error('Please select a payment method');
        }

        // Get form data
        const formData = new FormData(form);
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const university = document.getElementById('university').value;
        const teamName = document.getElementById('teamName').value || null;
        
        // Get selected events data and event names
        const selectedEventsArray = Array.from(selectedEvents);
        const eventNames = selectedEventsArray.map(eventId => {
            const event = events[selectedCategory].find(e => e.id === eventId);
            return event ? event.name : 'Unknown Event';
        }).join(', ');
        
        // Get payment method
        const paymentMethodElement = document.querySelector('.payment-btn.bg-purple-600');
        const paymentMethodValue = paymentMethodElement ? paymentMethodElement.dataset.method : null;
        
        // Get team members if applicable
        const teamMembersInputs = document.querySelectorAll('input[name="teamMembers[]"]');
        const teamMembers = Array.from(teamMembersInputs)
            .map(input => input.value.trim())
            .filter(value => value);
        
        // Create registration payload
        const registrationPayload = {
            name,
            email,
            phone,
            university,
            selectedEvents: selectedEventsArray,
            eventNames,
            paymentMethod: paymentMethodValue,
            teamName,
            teamMembers,
            category: selectedCategory,
            totalFee
        };
        
        // Process payment proof if QR payment selected
        if (paymentMethodValue === 'qr') {
            const paymentProofFile = document.getElementById('paymentProof').files[0];
            
            if (!paymentProofFile) {
                throw new Error('Please upload your payment proof');
            }
            
            registrationPayload.paymentProof = paymentProofFile;
        }
        
        // Submit registration
        const result = await submitRegistration(registrationPayload);
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to submit registration');
        }
        
        // Show success message and redirect
        showSuccess('Registration successful! Your registration ID is ' + result.registrationId);
        
        // Hide form and show success message
        form.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth' });
        
        // Redirect to confirmation page after 3 seconds
        setTimeout(() => {
            window.location.href = `confirmation.html?id=${result.registrationId}`;
        }, 3000);

    } catch (error) {
        console.error('Registration error:', error);
        showError('An error occurred: ' + (error.message || 'Please try again.'));
        
        // Reset submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Submit Registration';
    }
});

// Utility Functions
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.remove('hidden');
    errorMessage.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    successMessage.classList.add('hidden');
}

// Initialize form
showStep(1);