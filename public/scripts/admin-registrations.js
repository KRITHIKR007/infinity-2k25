import { supabase } from '../../supabase.js';
import { formatDate, debounce } from './utils/ui-utils.js';

// Constants
const TABLES = {
    REGISTRATIONS: 'registrations',
    EVENTS: 'events',
    PAYMENTS: 'payments'
};
const ITEMS_PER_PAGE = 10;

// State
let currentPage = 0;
let totalRegistrations = 0;
let currentRegistrations = [];
let currentFilters = {
    search: '',
    status: 'all',
    category: 'all'
};
let loadingState = {
    table: false,
    modal: false,
    statusUpdate: false
};
let currentRegistrationId = null;

// DOM Elements
const registrationsTableBody = document.getElementById('registrationsTableBody');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const categoryFilter = document.getElementById('categoryFilter');
const refreshBtn = document.getElementById('refreshBtn');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const shownCount = document.getElementById('shownCount');
const totalCount = document.getElementById('totalCount');
const tableLoading = document.getElementById('tableLoading');
const loadingOverlay = document.getElementById('loadingOverlay');
const registrationModal = document.getElementById('registrationModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const approvePaymentBtn = document.getElementById('approvePaymentBtn');
const rejectPaymentBtn = document.getElementById('rejectPaymentBtn');

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
            window.location.href = '../login.html';
            return;
        }
        
        // Setup events
        setupEventListeners();
        await loadRegistrations();
        
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
        
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to load registrations. Please try again.');
    }
});

// Load registrations from database
async function loadRegistrations() {
    try {
        // Show loading state
        showTableLoading(true);
        
        // Build query
        let query = supabase
            .from(TABLES.REGISTRATIONS)
            .select('*', { count: 'exact' });
            
        // Apply filters
        if (currentFilters.search) {
            query = query.or(`name.ilike.%${currentFilters.search}%,email.ilike.%${currentFilters.search}%,university.ilike.%${currentFilters.search}%,registration_id.ilike.%${currentFilters.search}%`);
        }
        
        if (currentFilters.status !== 'all') {
            query = query.eq('payment_status', currentFilters.status);
        }
        
        if (currentFilters.category !== 'all') {
            query = query.eq('category', currentFilters.category);
        }
        
        // Apply pagination
        const from = currentPage * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        
        query = query
            .order('created_at', { ascending: false })
            .range(from, to);
        
        // Execute query
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        // Update state
        currentRegistrations = data || [];
        totalRegistrations = count || 0;
        
        // Update UI
        renderRegistrationsTable();
        updatePaginationControls();
        
    } catch (error) {
        console.error('Error loading registrations:', error);
        showError('Failed to load registrations. Please try again.');
    } finally {
        showTableLoading(false);
    }
}

// Render registrations table
function renderRegistrationsTable() {
    if (!registrationsTableBody) return;
    
    if (currentRegistrations.length === 0) {
        registrationsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-400">
                    <i class="fas fa-search mr-2"></i>
                    No registrations found matching your criteria
                </td>
            </tr>
        `;
        return;
    }
    
    registrationsTableBody.innerHTML = currentRegistrations.map(registration => `
        <tr class="border-b border-gray-700">
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                        ${getInitials(registration.name)}
                    </div>
                    <div class="ml-3">
                        <div class="text-sm font-medium text-white">${registration.name}</div>
                        <div class="text-xs text-gray-400">${registration.email}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="text-sm text-gray-300">${registration.event_name || 'N/A'}</span>
                <div class="text-xs text-gray-400">ID: ${registration.registration_id || registration.id.substring(0, 8)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">₹${registration.fee || 0}</td>
            <td class="px-6 py-4 text-sm text-gray-300">${registration.university}</td>
            <td class="px-6 py-4 text-sm text-gray-300">${formatDate(registration.created_at)}</td>
            <td class="px-6 py-4">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(registration.payment_status)}">
                    ${capitalizeFirstLetter(registration.payment_status || 'Unknown')}
                </span>
            </td>
            <td class="px-6 py-4 text-right text-sm">
                <div class="flex justify-end space-x-2">
                    <button data-id="${registration.id}" class="view-registration-btn text-purple-400 hover:text-purple-300 transition-colors" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <a href="mailto:${registration.email}" class="text-blue-400 hover:text-blue-300 transition-colors" title="Send Email">
                        <i class="fas fa-envelope"></i>
                    </a>
                    ${registration.payment_status === 'pending' ? `
                        <button data-id="${registration.id}" class="approve-payment-btn text-green-400 hover:text-green-300 transition-colors" title="Approve Payment">
                            <i class="fas fa-check"></i>
                        </button>
                        <button data-id="${registration.id}" class="reject-payment-btn text-red-400 hover:text-red-300 transition-colors" title="Reject Payment">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
    
    // Update counters
    if (shownCount) shownCount.textContent = currentRegistrations.length;
    if (totalCount) totalCount.textContent = totalRegistrations;
}

// Update pagination controls
function updatePaginationControls() {
    const totalPages = Math.ceil(totalRegistrations / ITEMS_PER_PAGE);
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage === 0;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages - 1 || totalPages === 0;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Search input with debounce
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentFilters.search = searchInput.value;
            currentPage = 0;
            loadRegistrations();
        }, 500));
    }
    
    // Filters
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            currentFilters.status = statusFilter.value;
            currentPage = 0;
            loadRegistrations();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            currentFilters.category = categoryFilter.value;
            currentPage = 0;
            loadRegistrations();
        });
    }
    
    // Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadRegistrations);
    }
    
    // Pagination buttons
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                loadRegistrations();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            currentPage++;
            loadRegistrations();
        });
    }
    
    // Table row action buttons (event delegation)
    if (registrationsTableBody) {
        registrationsTableBody.addEventListener('click', async (e) => {
            // View button
            const viewBtn = e.target.closest('.view-registration-btn');
            if (viewBtn) {
                const registrationId = viewBtn.dataset.id;
                await showRegistrationDetails(registrationId);
                return;
            }
            
            // Approve button
            const approveBtn = e.target.closest('.approve-payment-btn');
            if (approveBtn) {
                const registrationId = approveBtn.dataset.id;
                await updateRegistrationStatus(registrationId, 'paid');
                return;
            }
            
            // Reject button
            const rejectBtn = e.target.closest('.reject-payment-btn');
            if (rejectBtn) {
                const registrationId = rejectBtn.dataset.id;
                await updateRegistrationStatus(registrationId, 'rejected');
                return;
            }
        });
    }
    
    // Modal close buttons
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeRegistrationModal);
    }
    
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeRegistrationModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeRegistrationModal);
    }
    
    // Modal action buttons
    if (approvePaymentBtn) {
        approvePaymentBtn.addEventListener('click', async () => {
            if (currentRegistrationId) {
                await updateRegistrationStatus(currentRegistrationId, 'paid');
                closeRegistrationModal();
            }
        });
    }
    
    if (rejectPaymentBtn) {
        rejectPaymentBtn.addEventListener('click', async () => {
            if (currentRegistrationId) {
                await updateRegistrationStatus(currentRegistrationId, 'rejected');
                closeRegistrationModal();
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.href = '../login.html';
        });
    }
}

// Show registration details in modal
async function showRegistrationDetails(registrationId) {
    try {
        // Set current registration ID
        currentRegistrationId = registrationId;
        
        // Show loading state
        showModalLoading(true);
        
        // Get registration details
        const { data: registration, error } = await supabase
            .from(TABLES.REGISTRATIONS)
            .select('*')
            .eq('id', registrationId)
            .single();
            
        if (error) throw error;
        
        // Show modal first (to allow loading indicator)
        if (registrationModal) {
            registrationModal.classList.remove('hidden');
        }
        
        if (!registration) {
            throw new Error('Registration not found');
        }
        
        // Fetch related events if present
        let eventDetails = [];
        if (registration.events && registration.events.length > 0) {
            const { data: events } = await supabase
                .from(TABLES.EVENTS)
                .select('name, venue, category, fee')
                .in('id', registration.events);
                
            eventDetails = events || [];
        }
        
        // Update modal with registration details
        updateRegistrationModal(registration, eventDetails);
        
    } catch (error) {
        console.error('Error loading registration details:', error);
        alert('Failed to load registration details. Please try again.');
        closeRegistrationModal();
    } finally {
        showModalLoading(false);
    }
}

// Update modal with registration details
function updateRegistrationModal(registration, events) {
    // Basic info
    updateModalField('detailsRegistrationId', registration.registration_id || registration.id);
    updateModalField('detailsName', registration.name);
    updateModalField('detailsEmail', registration.email);
    updateModalField('detailsPhone', registration.phone || 'N/A');
    updateModalField('detailsUniversity', registration.university);
    updateModalField('detailsCategory', registration.category === 'tech' ? 'Technical' : 'Cultural');
    updateModalField('detailsDate', formatDate(registration.created_at));
    
    // Fee
    updateModalField('detailsFee', `₹${registration.fee || 0}`);
    
    // Payment method
    updateModalField('detailsPaymentMethod', registration.payment_method === 'qr' ? 'QR Payment' : 'Pay at Venue');
    
    // Status badge
    const statusBadge = document.getElementById('detailsStatusBadge');
    if (statusBadge) {
        statusBadge.className = `px-2 py-1 text-xs rounded-full ${getStatusClass(registration.payment_status)}`;
        statusBadge.textContent = capitalizeFirstLetter(registration.payment_status || 'Unknown');
    }
    
    // Team info
    updateModalField('detailsTeamName', registration.team_name || 'N/A');
    
    // Team members
    const teamMembers = document.getElementById('detailsTeamMembers');
    if (teamMembers) {
        let members = [];
        try {
            members = JSON.parse(registration.team_members || '[]');
        } catch (e) {
            members = [];
        }
        
        if (members.length > 0) {
            teamMembers.innerHTML = members.map((member, index) => `
                <div class="text-gray-300">
                    <span class="bg-gray-800 px-2 py-1 rounded-full text-xs mr-2">${index + 1}</span>
                    ${member}
                </div>
            `).join('');
        } else {
            teamMembers.innerHTML = '<p class="text-gray-400">No team members added</p>';
        }
        
        updateModalField('detailsTeamSize', members.length + 1); // +1 for the registrant
    }
    
    // Events
    const eventsContainer = document.getElementById('detailsEvents');
    if (eventsContainer) {
        if (events.length > 0) {
            eventsContainer.innerHTML = events.map(event => `
                <div class="bg-gray-800 bg-opacity-50 rounded-lg p-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <h5 class="text-white font-medium">${event.name}</h5>
                            <p class="text-sm text-gray-400">
                                <i class="fas fa-map-marker-alt mr-1"></i> ${event.venue || 'Venue TBD'}
                            </p>
                        </div>
                        <div>
                            <span class="px-2 py-1 text-xs rounded-full ${event.category === 'tech' ? 'bg-blue-900 bg-opacity-50 text-blue-300' : 'bg-purple-900 bg-opacity-50 text-purple-300'}">
                                ${event.category === 'tech' ? 'Technical' : 'Cultural'}
                            </span>
                            <p class="text-sm text-gray-300 mt-1 text-right">₹${event.fee || 0}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            eventsContainer.innerHTML = '<p class="text-gray-400">Event details not available</p>';
        }
    }
    
    // Payment proof
    const paymentProofImage = document.getElementById('paymentProofImage');
    const noProofMessage = document.getElementById('noProofMessage');
    const viewFullProofLink = document.getElementById('viewFullProofLink');
    
    if (paymentProofImage && noProofMessage && viewFullProofLink) {
        if (registration.payment_id) {
            // If there's a payment record, try to fetch it
            fetchPaymentProof(registration.payment_id);
        } else {
            // No payment record
            paymentProofImage.classList.add('hidden');
            noProofMessage.classList.remove('hidden');
            viewFullProofLink.classList.add('hidden');
        }
    }
    
    // Show/hide action buttons based on payment status
    const statusActionButtons = document.getElementById('statusActionButtons');
    if (statusActionButtons) {
        if (registration.payment_status === 'pending') {
            statusActionButtons.classList.remove('hidden');
        } else {
            statusActionButtons.classList.add('hidden');
        }
    }
}

// Fetch payment proof
async function fetchPaymentProof(paymentId) {
    try {
        const { data: payment, error } = await supabase
            .from(TABLES.PAYMENTS)
            .select('proof_url')
            .eq('id', paymentId)
            .single();
            
        if (error) throw error;
        
        const paymentProofImage = document.getElementById('paymentProofImage');
        const noProofMessage = document.getElementById('noProofMessage');
        const viewFullProofLink = document.getElementById('viewFullProofLink');
        
        if (payment && payment.proof_url) {
            paymentProofImage.src = payment.proof_url;
            paymentProofImage.classList.remove('hidden');
            noProofMessage.classList.add('hidden');
            
            viewFullProofLink.href = payment.proof_url;
            viewFullProofLink.classList.remove('hidden');
        } else {
            paymentProofImage.classList.add('hidden');
            noProofMessage.classList.remove('hidden');
            viewFullProofLink.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error fetching payment proof:', error);
        
        const paymentProofImage = document.getElementById('paymentProofImage');
        const noProofMessage = document.getElementById('noProofMessage');
        const viewFullProofLink = document.getElementById('viewFullProofLink');
        
        if (paymentProofImage) paymentProofImage.classList.add('hidden');
        if (noProofMessage) {
            noProofMessage.textContent = 'Failed to load payment proof';
            noProofMessage.classList.remove('hidden');
        }
        if (viewFullProofLink) viewFullProofLink.classList.add('hidden');
    }
}

// Update registration status
async function updateRegistrationStatus(registrationId, status) {
    try {
        // Confirm before updating
        if (!confirm(`Are you sure you want to mark this registration as "${capitalizeFirstLetter(status)}"?`)) {
            return;
        }
        
        // Show loading state
        showTableLoading(true);
        
        // Update registration status
        const { error } = await supabase
            .from(TABLES.REGISTRATIONS)
            .update({ 
                payment_status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', registrationId);
            
        if (error) throw error;
        
        // Success message
        alert(`Registration status updated to "${capitalizeFirstLetter(status)}"`);
        
        // Reload registrations
        await loadRegistrations();
        
    } catch (error) {
        console.error('Error updating registration status:', error);
        alert('Failed to update registration status. Please try again.');
    } finally {
        showTableLoading(false);
    }
}

// Close registration modal
function closeRegistrationModal() {
    if (registrationModal) {
        registrationModal.classList.add('hidden');
    }
    
    // Reset current registration ID
    currentRegistrationId = null;
}

// Update modal field helper
function updateModalField(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Show table loading state
function showTableLoading(isLoading) {
    loadingState.table = isLoading;
    
    if (tableLoading) {
        tableLoading.parentElement.parentElement.style.display = isLoading ? '' : 'none';
    }
}

// Show modal loading state
function showModalLoading(isLoading) {
    loadingState.modal = isLoading;
    
    const modalLoading = document.getElementById('modalLoading');
    const registrationDetails = document.getElementById('registrationDetails');
    
    if (modalLoading) {
        modalLoading.style.display = isLoading ? 'flex' : 'none';
    }
    
    if (registrationDetails) {
        registrationDetails.style.display = isLoading ? 'none' : '';
    }
}

// Show error message
function showError(message) {
    alert(message);
}

// Helper functions
function getInitials(name) {
    if (!name) return '';
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).replace(/_/g, ' ');
}

function getStatusClass(status) {
    switch (status) {
        case 'paid':
            return 'bg-green-900 bg-opacity-50 text-green-300';
        case 'pending':
            return 'bg-yellow-900 bg-opacity-50 text-yellow-300';
        case 'rejected':
            return 'bg-red-900 bg-opacity-50 text-red-300';
        case 'awaiting_payment':
            return 'bg-blue-900 bg-opacity-50 text-blue-300';
        default:
            return 'bg-gray-700 bg-opacity-50 text-gray-300';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
