import { supabase, TABLES } from '../../supabase.js';
import { PhotoViewer } from '../../public/scripts/components/photo-viewer.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize elements
    const loadingState = document.getElementById('loadingState');
    const registrationDetails = document.getElementById('registrationDetails');
    const errorState = document.getElementById('errorState');
    const photoViewer = document.getElementById('paymentProofViewer');
    
    // Get registration ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const registrationId = urlParams.get('id');
    
    if (!registrationId) {
        showError('Registration ID is required');
        return;
    }
    
    try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = '../login.html?redirect=' + encodeURIComponent(window.location.href);
            return;
        }
        
        // Fetch registration details
        const { data: registration, error } = await supabase
            .from(TABLES.REGISTRATIONS)
            .select(`
                *,
                payments(*)
            `)
            .eq('id', registrationId)
            .single();
        
        if (error || !registration) {
            throw new Error(error?.message || 'Registration not found');
        }
        
        // Display registration details
        displayRegistrationDetails(registration);
        
        // Initialize photo viewer if payment proof exists
        if (registration.payments && registration.payments.proof_url) {
            new PhotoViewer('paymentProofViewer', {
                bucketName: TABLES.STORAGE.PAYMENT_PROOFS
            }).loadImage(registration.payments.proof_url);
        } else {
            photoViewer.innerHTML = '<p class="text-center text-gray-400 p-4">No payment proof provided</p>';
        }
        
        // Hide loading state
        loadingState.classList.add('hidden');
        registrationDetails.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to load registration details');
    }
});

function displayRegistrationDetails(registration) {
    // Populate registration information
    document.getElementById('regId').textContent = registration.id;
    document.getElementById('regName').textContent = registration.name;
    document.getElementById('regEmail').textContent = registration.email;
    document.getElementById('regPhone').textContent = registration.phone;
    document.getElementById('regUniversity').textContent = registration.university;
    document.getElementById('regDate').textContent = formatDate(registration.created_at);
    document.getElementById('regEvents').textContent = registration.event_name || 'None';
    document.getElementById('regFee').textContent = `₹${registration.fee || 0}`;
    
    // Set payment status
    const paymentStatus = registration.payment_status || 'pending';
    const statusBadge = document.getElementById('paymentStatusBadge');
    statusBadge.textContent = capitalizeFirstLetter(paymentStatus.replace('_', ' '));
    statusBadge.className = `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusClass(paymentStatus)}`;
    
    // Handle team info
    if (registration.team_name || (registration.team_members && registration.team_members.length)) {
        document.getElementById('teamSection').classList.remove('hidden');
        document.getElementById('teamName').textContent = registration.team_name || 'Not specified';
        
        // Parse and display team members
        try {
            let teamMembers = [];
            if (typeof registration.team_members === 'string') {
                teamMembers = JSON.parse(registration.team_members);
            } else if (Array.isArray(registration.team_members)) {
                teamMembers = registration.team_members;
            }
            
            const teamMembersList = document.getElementById('teamMembers');
            if (teamMembers && teamMembers.length > 0) {
                teamMembersList.innerHTML = teamMembers.map(member => 
                    `<li class="mb-1">${escapeHtml(member)}</li>`
                ).join('');
            } else {
                teamMembersList.innerHTML = '<li>No team members specified</li>';
            }
        } catch (e) {
            console.error('Error parsing team members:', e);
            document.getElementById('teamMembers').innerHTML = '<li>Error parsing team members</li>';
        }
    }
    
    // Set up action buttons
    setupActionButtons(registration);
}

function setupActionButtons(registration) {
    const actionButtons = document.getElementById('actionButtons');
    
    // Show different action buttons based on payment status
    if (registration.payment_status === 'pending') {
        actionButtons.innerHTML = `
            <button id="approvePaymentBtn" class="btn btn-success">
                <i class="fas fa-check mr-2"></i>Approve Payment
            </button>
            <button id="rejectPaymentBtn" class="btn btn-danger">
                <i class="fas fa-times mr-2"></i>Reject Payment
            </button>
        `;
        
        // Add event listeners
        document.getElementById('approvePaymentBtn').addEventListener('click', () => {
            updatePaymentStatus(registration.id, 'paid');
        });
        
        document.getElementById('rejectPaymentBtn').addEventListener('click', () => {
            updatePaymentStatus(registration.id, 'rejected');
        });
    } else if (registration.payment_status === 'awaiting_payment') {
        actionButtons.innerHTML = `
            <button id="markAsPaidBtn" class="btn btn-success">
                <i class="fas fa-check mr-2"></i>Mark as Paid
            </button>
        `;
        
        document.getElementById('markAsPaidBtn').addEventListener('click', () => {
            updatePaymentStatus(registration.id, 'paid');
        });
    }
}

async function updatePaymentStatus(registrationId, status) {
    try {
        // Show loading state
        document.getElementById('actionButtons').innerHTML = '<div class="loading mx-auto"></div>';
        
        const { data, error } = await supabase
            .from(TABLES.REGISTRATIONS)
            .update({ payment_status: status })
            .eq('id', registrationId);
            
        if (error) throw error;
        
        // Reload the page to show updated status
        window.location.reload();
        
    } catch (error) {
        console.error('Error updating payment status:', error);
        alert('Failed to update payment status: ' + error.message);
        // Restore action buttons
        setupActionButtons({id: registrationId, payment_status: 'pending'});
    }
}

function showError(message) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    errorMessage.textContent = message;
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getPaymentStatusClass(status) {
    switch (status) {
        case 'paid':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'awaiting_payment':
            return 'bg-blue-100 text-blue-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
