// Define Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { submitRegistration as saveRegistration } from './database.js';
import { FileUpload } from './components/file-upload.js';
import { registrations } from './registrations.js';
import { events } from './events.js';
import { validators, validateForm } from './validation.js';
import { ui } from './ui.js';

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

// Submit registration to Supabase (now using database.js)
export async function submitRegistration(registrationData) {
    return await saveRegistration(registrationData);
}

// Event data
const eventsData = {
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

// Variable to store file uploader instance
let paymentProofUploader;

// Initialize the file uploader when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the file uploader if payment proof container exists
    const paymentProofContainer = document.getElementById('paymentProofContainer');
    const paymentProofInput = document.getElementById('paymentProof');
    
    if (paymentProofContainer && paymentProofInput) {
        paymentProofUploader = new FileUpload(paymentProofInput, paymentProofContainer, {
            maxFileSize: 5 * 1024 * 1024, // 5MB
            acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
            showFileName: true,
            showFileSize: true,
            showPreview: true,
            previewClass: 'w-full h-40 object-cover rounded-lg mt-2'
        });
    }
    
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
        
        eventsData[category].forEach(event => {
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
            
            // Update required attribute for payment proof (handled by FileUpload component now)
            if (paymentProofUploader) {
                const paymentProofInput = document.getElementById('paymentProof');
                if (method === 'qr') {
                    paymentProofInput.setAttribute('required', 'required');
                } else {
                    paymentProofInput.removeAttribute('required');
                    // Reset the file uploader if changing from QR to venue payment
                    if (paymentProofUploader) {
                        paymentProofUploader.clearPreview();
                    }
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
                const selectedEvent = eventsData[selectedCategory].find(e => selectedEvents.has(e.id));
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
                const event = eventsData[selectedCategory].find(e => e.id === eventId);
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
            let paymentId = null;
            if (paymentMethodValue === 'qr') {
                // Get file from the FileUpload component if available
                let paymentProofFile = null;
                
                if (paymentProofUploader) {
                    paymentProofFile = paymentProofUploader.getFile();
                } else {
                    paymentProofFile = document.getElementById('paymentProof').files[0];
                }
                
                if (!paymentProofFile) {
                    throw new Error('Please upload your payment proof');
                }
                
                // Upload payment proof to storage
                const uploadResult = await uploadPaymentProof(paymentProofFile);
                
                if (!uploadResult.success) {
                    throw new Error(uploadResult.error || 'Failed to upload payment proof');
                }
                
                // Create payment record
                const { data: paymentData, error: paymentError } = await supabase
                    .from(TABLES.PAYMENTS)
                    .insert([{
                        amount: totalFee,
                        currency: 'INR',
                        status: 'pending',
                        payment_method: 'qr',
                        proof_url: uploadResult.url,
                        proof_path: uploadResult.path,
                        created_at: new Date().toISOString()
                    }])
                    .select();
                    
                if (paymentError) throw paymentError;
                
                paymentId = paymentData[0].id;
            }
            
            // Create registration record in database
            const { data: registrationData, error: registrationError } = await supabase
                .from(TABLES.REGISTRATIONS)
                .insert([{
                    name,
                    email,
                    phone,
                    university,
                    events: selectedEventsArray,
                    event_name: eventNames,
                    payment_status: paymentMethodValue === 'qr' ? 'pending' : 'awaiting_payment',
                    payment_id: paymentId,
                    created_at: new Date().toISOString(),
                    team_name: teamName,
                    team_members: JSON.stringify(teamMembers),
                    category: selectedCategory,
                    fee: totalFee
                }])
                .select();
                
            if (registrationError) throw registrationError;
            
            // Show success message
            showSuccess('Registration successful! Your registration ID is ' + registrationData[0].id);
            
            // Hide form and show success message
            form.classList.add('hidden');
            successMessage.classList.remove('hidden');
            
            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth' });
            
            // Redirect to confirmation page after 3 seconds
            setTimeout(() => {
                window.location.href = `confirmation.html?id=${registrationData[0].id}`;
            }, 3000);

        } catch (error) {
            console.error('Registration error:', error);
            showError('An error occurred: ' + (error.message || 'Please try again.'));
            
            // Reset submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Submit Registration';
        }
    });

    // ... existing code ...
});

// Upload payment proof to Supabase storage
async function uploadPaymentProof(file) {
    try {
        if (!file) {
            throw new Error('No file selected');
        }
        
        // Create a unique file path
        const timestamp = new Date().getTime();
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const filePath = `payment-proofs/${timestamp}-${sanitizedFilename}`;
        
        // Show upload progress
        const uploadStatus = document.createElement('div');
        uploadStatus.className = 'text-sm text-gray-300 mt-2';
        uploadStatus.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Uploading payment proof...';
        document.getElementById('paymentProofContainer').appendChild(uploadStatus);
        
        // Upload file
        const { data, error } = await supabase.storage
            .from('payment_proofs')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
            
        if (error) {
            console.error('Upload error details:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from('payment_proofs')
            .getPublicUrl(filePath);
            
        // Update status
        uploadStatus.innerHTML = '<i class="fas fa-check-circle text-green-500 mr-1"></i> Upload successful';
        
        return {
            success: true,
            path: filePath,
            url: urlData.publicUrl
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload file'
        };
    }
}

// Show success message
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.remove('hidden');
    errorMessage.classList.add('hidden');
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    successMessage.classList.add('hidden');
}

// Registration page functionality
document.addEventListener('DOMContentLoaded', async function() {
  // DOM Elements
  const registrationForm = document.getElementById('registrationForm');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const step4 = document.getElementById('step4');
  const registrationSuccess = document.getElementById('registrationSuccess');
  
  const step1Indicator = document.getElementById('step1Indicator');
  const step2Indicator = document.getElementById('step2Indicator');
  const step3Indicator = document.getElementById('step3Indicator');
  const step4Indicator = document.getElementById('step4Indicator');
  
  const step1NextBtn = document.getElementById('step1NextBtn');
  const step2NextBtn = document.getElementById('step2NextBtn');
  const step2PrevBtn = document.getElementById('step2PrevBtn');
  const step3NextBtn = document.getElementById('step3NextBtn');
  const step3PrevBtn = document.getElementById('step3PrevBtn');
  const step4PrevBtn = document.getElementById('step4PrevBtn');
  const submitBtn = document.getElementById('submitBtn');
  
  const techEventsTab = document.getElementById('techEventsTab');
  const culturalEventsTab = document.getElementById('culturalEventsTab');
  const techEventsList = document.getElementById('techEventsList');
  const culturalEventsList = document.getElementById('culturalEventsList');
  
  const selectedEventsCount = document.getElementById('selectedEventsCount');
  const totalAmount = document.getElementById('totalAmount');
  const noTeamEventsMessage = document.getElementById('noTeamEventsMessage');
  const teamEventsContainer = document.getElementById('teamEventsContainer');
  
  // Load events data
  try {
    const { data: eventsData, error } = await events.getAll();
    if (error) throw error;
    
    // Process events data
    // ...existing code...
  } catch (error) {
    console.error('Error loading events:', error);
  }
  
  // Step 1: Personal Information
  step1NextBtn.addEventListener('click', () => {
    // Validate personal information
    const formData = {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      university: document.getElementById('university').value,
      department: document.getElementById('department').value,
      yearOfStudy: document.getElementById('yearOfStudy').value
    };
    
    const validationRules = {
      fullName: [validators.required],
      email: [validators.required, validators.email],
      phone: [validators.required, validators.phone],
      university: [validators.required],
      department: [validators.required],
      yearOfStudy: [validators.required]
    };
    
    const { isValid, errors } = validateForm(formData, validationRules);
    
    if (isValid) {
      // Move to Step 2
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
      
      // Update step indicators
      step1Indicator.classList.remove('bg-purple-600');
      step1Indicator.classList.add('bg-green-600');
      step2Indicator.classList.remove('bg-gray-700');
      step2Indicator.classList.add('bg-purple-600');
    } else {
      // Show validation errors
      ui.handleValidationErrors(errors);
    }
  });
  
  // Step 2: Event Selection
  // ...existing code...
  
  // Step 3: Team Details
  // ...existing code...
  
  // Step 4: Review and Submit
  // ...existing code...
  
  // Final form submission
  registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    ui.showLoading('submitBtn', 'submitBtnLoading', 'submitBtnText');
    
    try {
      // Get all form data and submit
      const registrationData = {
        // Collect all form data
        // ...existing code...
      };
      
      // Submit to Supabase
      const { data, error } = await registrations.create(registrationData);
      
      if (error) throw error;
      
      // Show success message
      step4.classList.add('hidden');
      registrationSuccess.classList.remove('hidden');
      
      // Set registration ID in success message
      document.getElementById('registrationId').textContent = data[0].registration_id;
      
      // Redirect to confirmation page after delay
      setTimeout(() => {
        window.location.href = `confirmation.html?registration_id=${data[0].registration_id}`;
      }, 5000);
      
    } catch (error) {
      console.error('Registration error:', error);
      ui.showError('submitError', 'Failed to submit registration. Please try again.');
    } finally {
      ui.hideLoading('submitBtn', 'submitBtnLoading', 'submitBtnText');
    }
  });
  
  // Helper functions
  // ...existing code...
});

// Use the global Supabase client if available, or import it
const supabase = window.supabase || (await import('../../supabase.js')).supabase;

// Constants
const QR_CODE_URL = 'public/images/qr-code.png';
const TECHNICAL_CATEGORY = 'tech';
const CULTURAL_CATEGORY = 'cultural';

// State management
const state = {
    category: null,
    selectedEvents: [],
    eventDetails: {},
    totalFee: 0,
    formStep: 1,
    paymentMethod: 'qr',
    teamMembers: [],
    isTeamEvent: false,
    maxTeamSize: 1,
    fileUploader: null
};

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Register page loaded');
    
    try {
        // Initialize UI elements
        initElements();
        
        // Setup event listeners
        setupEventListeners();
        
        // Show first step
        showFormStep(1);
        
        // Fetch events data from database
        await fetchEventsData();
        
        // Initialize file uploader
        initFileUploader();
        
    } catch (error) {
        console.error('Error initializing registration page:', error);
        showError('Failed to initialize registration form. Please refresh the page and try again.');
    } finally {
        // Hide loading screen
        hideLoadingScreen();
    }
});

// Initialize DOM elements
function initElements() {
    console.log('Initializing elements');
    // DOM elements initialization code...
}

// Hide loading screen with smoother transition
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('opacity-0');
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 500);
    }
}

// Show error message
function showError(message) {
    console.error('Error:', message);
    
    const errorContainer = document.createElement('div');
    errorContainer.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-md z-50';
    errorContainer.textContent = message;
    
    document.body.appendChild(errorContainer);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorContainer.classList.add('opacity-0');
        setTimeout(() => {
            document.body.removeChild(errorContainer);
        }, 500);
    }, 5000);
}

// Fetch events data from the database
async function fetchEventsData() {
    try {
        console.log('Fetching events data');
        
        // Basic query to get active events
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('status', 'active');
            
        if (error) throw error;
        
        console.log('Fetched events:', data);
        
        // Store events by category for quick access
        state.eventDetails = data.reduce((acc, event) => {
            acc[event.id] = event;
            return acc;
        }, {});
        
        return data;
    } catch (error) {
        console.error('Error fetching events:', error);
        showError('Failed to fetch events. Please refresh the page and try again.');
        return [];
    }
}

// Rest of the registration page code...
// ...existing code...