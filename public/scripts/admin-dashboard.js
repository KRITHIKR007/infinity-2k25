import { supabase } from '../../supabase.js';

// Constants
const TABLES = {
    REGISTRATIONS: 'registrations',
    EVENTS: 'events',
    PAYMENTS: 'payments',
    USERS: 'users'
};

// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const userInitials = document.getElementById('userInitials');
const adminName = document.getElementById('adminName');
const notificationCount = document.getElementById('notificationCount');
const registrationsTableBody = document.getElementById('registrationsTableBody');
const tableLoading = document.getElementById('tableLoading');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const refreshBtn = document.getElementById('refreshBtn');

// Dashboard Statistics Elements
const totalEventsCount = document.querySelector('[data-count="total-events"]');
const registrationsCount = document.querySelector('[data-count="registrations"]');
const revenueAmount = document.querySelector('[data-count="revenue"]');
const pendingPaymentsCount = document.querySelector('[data-count="pending-payments"]');
const registrationsTrend = document.getElementById('registrations-trend');
const revenuePercentElem = document.getElementById('revenue-percent');

// Dashboard state
let userData = null;
let statsLoaded = false;
let registrationsLoaded = false;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }
        
        // Store user data
        userData = session.user;
        
        // Setup UI with user info
        setupUserInfo(userData);
        
        // Load dashboard data in parallel
        await Promise.all([
            loadDashboardStats(),
            loadRecentRegistrations()
        ]);
        
        // Setup event listeners
        setupEventListeners();
        
        // Remove loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        alert('Failed to load dashboard. Please try again.');
        
        // Redirect to login on critical error
        window.location.href = 'login.html';
    }
});

// Setup user information display
function setupUserInfo(user) {
    // Extract user info from metadata or email
    const metadata = user.user_metadata || {};
    const displayName = metadata.full_name || user.email.split('@')[0];
    
    // Update UI elements
    if (adminName) {
        adminName.textContent = displayName;
    }
    
    if (userInitials) {
        // Create initials from name (up to 2 characters)
        const initials = displayName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
            
        userInitials.textContent = initials;
    }
    
    // Update dropdown elements if present
    const dropdownUsername = document.getElementById('dropdownUsername');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    const adminUsername = document.getElementById('adminUsername');
    const avatarInitials = document.getElementById('avatarInitials');
    
    if (dropdownUsername) {
        dropdownUsername.textContent = displayName;
    }
    
    if (dropdownUserEmail) {
        dropdownUserEmail.textContent = user.email;
    }
    
    if (adminUsername) {
        adminUsername.textContent = displayName;
    }
    
    if (avatarInitials) {
        // Same initials logic as above
        const initials = displayName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
            
        avatarInitials.textContent = initials;
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Show loading state if available
        const loadingIndicator = document.getElementById('statsLoading');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }
        
        // Get event count with categorization
        const { data: events, error: eventsError } = await supabase
            .from(TABLES.EVENTS)
            .select('id, category, status');
            
        if (eventsError) throw eventsError;
        
        // Filter active events and count by category
        const activeEvents = events ? events.filter(event => event.status !== 'inactive') : [];
        const techEvents = activeEvents.filter(event => event.category === 'tech').length;
        const culturalEvents = activeEvents.filter(event => event.category === 'cultural').length;
        
        // Update events statistics
        if (totalEventsCount) {
            totalEventsCount.textContent = activeEvents.length;
            
            // Update category breakdown if container exists
            const eventsBreakdown = totalEventsCount.parentElement.nextElementSibling;
            if (eventsBreakdown) {
                eventsBreakdown.textContent = `${techEvents} Tech, ${culturalEvents} Cultural`;
            }
        }
        
        // Get registrations count
        const { count: totalRegistrations, error: regCountError } = await supabase
            .from(TABLES.REGISTRATIONS)
            .select('id', { count: 'exact', head: true });
            
        if (regCountError) throw regCountError;
        
        // Get recent registrations (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const { count: recentRegistrations, error: recentRegError } = await supabase
            .from(TABLES.REGISTRATIONS)
            .select('id', { count: 'exact', head: true })
            .gte('created_at', yesterday.toISOString());
            
        if (recentRegError) throw recentRegError;
        
        // Update registrations count
        if (registrationsCount) {
            registrationsCount.textContent = totalRegistrations || 0;
        }
        
        // Update recent registrations trend
        if (registrationsTrend) {
            registrationsTrend.textContent = `↑ ${recentRegistrations || 0} in the last 24h`;
        }
        
        // Get pending payments count
        const { count: pendingPayments, error: pendingError } = await supabase
            .from(TABLES.REGISTRATIONS)
            .select('id', { count: 'exact', head: true })
            .eq('payment_status', 'pending');
            
        if (pendingError) throw pendingError;
        
        // Update pending payments display
        if (pendingPaymentsCount) {
            pendingPaymentsCount.textContent = pendingPayments || 0;
        }
        
        // Update notification count
        if (notificationCount) {
            notificationCount.textContent = pendingPayments || 0;
            
            // Hide badge if no notifications
            if (pendingPayments === 0) {
                notificationCount.classList.add('hidden');
            } else {
                notificationCount.classList.remove('hidden');
            }
        }
        
        // Calculate total revenue
        const { data: payments, error: paymentsError } = await supabase
            .from(TABLES.REGISTRATIONS)
            .select('fee')
            .eq('payment_status', 'paid');
            
        if (paymentsError) throw paymentsError;
        
        const totalRevenue = payments ? payments.reduce((sum, reg) => sum + (parseFloat(reg.fee) || 0), 0) : 0;
        
        // Update revenue display
        if (revenueAmount) {
            revenueAmount.textContent = `₹${totalRevenue.toLocaleString()}`;
        }
        
        // Calculate percentage of target (fixed at 75,000 for demo)
        const targetRevenue = 75000;
        const percentage = Math.round((totalRevenue / targetRevenue) * 100);
        
        if (revenuePercentElem) {
            revenuePercentElem.textContent = `${percentage}% of target`;
        }
        
        // Mark stats as loaded
        statsLoaded = true;
        
    } catch (error) {
        console.error('Error loading dashboard statistics:', error);
        
        // Display error in UI if possible
        const statsErrorElem = document.getElementById('statsError');
        if (statsErrorElem) {
            statsErrorElem.textContent = 'Failed to load statistics';
            statsErrorElem.classList.remove('hidden');
        }
    } finally {
        // Hide loading indicator
        const loadingIndicator = document.getElementById('statsLoading');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }
}

// Load recent registrations
async function loadRecentRegistrations() {
    try {
        // Show loading state
        if (tableLoading) {
            tableLoading.classList.remove('hidden');
        }
        
        // Get filter values
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const statusValue = statusFilter ? statusFilter.value : 'all';
        
        // Build query
        let query = supabase
            .from(TABLES.REGISTRATIONS)
            .select(`
                id, 
                registration_id,
                name, 
                email, 
                university, 
                phone,
                events,
                event_name,
                team_name,
                team_members,
                fee,
                payment_status,
                payment_method,
                created_at
            `)
            .order('created_at', { ascending: false })
            .limit(10);
        
        // Apply status filter if not "all"
        if (statusValue !== 'all') {
            query = query.eq('payment_status', statusValue);
        }
        
        // Apply search filter if present
        if (searchTerm) {
            query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,university.ilike.%${searchTerm}%,registration_id.ilike.%${searchTerm}%`);
        }
        
        // Execute query
        const { data: registrations, error } = await query;
        
        if (error) throw error;
        
        // Render table with results
        renderRegistrationsTable(registrations);
        
        // Mark registrations as loaded
        registrationsLoaded = true;
        
    } catch (error) {
        console.error('Error loading registrations:', error);
        
        // Display error in table
        if (registrationsTableBody) {
            registrationsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-6 text-center text-red-400">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        Failed to load registrations. ${error.message || ''}
                    </td>
                </tr>
            `;
        }
    } finally {
        // Hide loading state
        if (tableLoading) {
            tableLoading.classList.add('hidden');
        }
    }
}

// Render registrations table
function renderRegistrationsTable(registrations) {
    registrationsTableBody.innerHTML = registrations.map(registration => `
        <tr class="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
            <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-gradient-to-r from-purple-700 to-purple-500 flex items-center justify-center text-white">
                        ${getInitials(registration.name)}
                    </div>
                    <div class="ml-3">
                        <div class="text-sm font-medium text-white">${registration.name}</div>
                        <div class="text-xs text-gray-400">${registration.email}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
                <span class="text-sm text-gray-300">${registration.event_name || 'N/A'}</span>
                <div class="text-xs text-gray-400">ID: ${registration.registration_id || registration.id.substring(0, 8)}</div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">${registration.university}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-300">₹${registration.fee || 0}</td>
            <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(registration.payment_status)}">
                    ${capitalizeFirstLetter(registration.payment_status || 'Unknown')}
                </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-right text-sm">
                <div class="flex justify-end space-x-2">
                    <button onclick="viewRegistration('${registration.id}')" class="text-purple-400 hover:text-purple-300 transition-colors" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${registration.payment_status === 'pending' ? `
                        <button onclick="updatePaymentStatus('${registration.id}', 'paid')" class="text-green-400 hover:text-green-300 transition-colors" title="Approve Payment">
                            <i class="fas fa-check"></i>
                        </button>
                        <button onclick="updatePaymentStatus('${registration.id}', 'rejected')" class="text-red-400 hover:text-red-300 transition-colors" title="Reject Payment">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button onclick="viewPaymentProof('${registration.id}')" class="text-blue-400 hover:text-blue-300 transition-colors" title="View Payment Proof">
                        <i class="fas fa-receipt"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Add a function to view payment proof in a modal
async function viewPaymentProof(registrationId) {
    try {
        const { data: registration, error } = await supabase
            .from(TABLES.REGISTRATIONS)
            .select('payment_proof_url, name')
            .eq('id', registrationId)
            .single();
            
        if (error) throw error;
        
        if (!registration.payment_proof_url) {
            alert('No payment proof available for this registration.');
            return;
        }
        
        // Show modal with payment proof
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white">Payment Proof - ${registration.name}</h3>
                    <button id="closeProofModal" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="relative">
                    <img src="${registration.payment_proof_url}" alt="Payment Proof" class="max-w-full h-auto rounded-lg">
                </div>
                <div class="mt-4 flex justify-end">
                    <button id="approveFromModal" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mr-2">
                        <i class="fas fa-check mr-2"></i>Approve
                    </button>
                    <button id="rejectFromModal" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 mr-2">
                        <i class="fas fa-times mr-2"></i>Reject
                    </button>
                    <button id="cancelModal" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners for modal buttons
        document.getElementById('closeProofModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancelModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('approveFromModal').addEventListener('click', () => {
            document.body.removeChild(modal);
            updatePaymentStatus(registrationId, 'paid');
        });
        
        document.getElementById('rejectFromModal').addEventListener('click', () => {
            document.body.removeChild(modal);
            updatePaymentStatus(registrationId, 'rejected');
        });
        
    } catch (error) {
        console.error('Error viewing payment proof:', error);
        alert('Failed to load payment proof. Please try again.');
    }
}

// Make the function available globally
window.viewPaymentProof = viewPaymentProof;

// Set up event listeners
function setupEventListeners() {
    // Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            refreshBtn.disabled = true;
            
            try {
                await Promise.all([
                    loadDashboardStats(),
                    loadRecentRegistrations()
                ]);
            } catch (error) {
                console.error('Refresh error:', error);
            } finally {
                refreshBtn.disabled = false;
            }
        });
    }
    
    // Search input with debounce
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            loadRecentRegistrations();
        }, 500));
    }
    
    // Status filter
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            loadRecentRegistrations();
        });
    }
    
    // Dropdowns toggle
    const userMenuButton = document.getElementById('userMenuButton');
    const userDropdown = document.getElementById('userDropdown');
    const notificationButton = document.getElementById('notificationButton');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    
    if (userMenuButton && userDropdown) {
        userMenuButton.addEventListener('click', () => {
            userDropdown.classList.toggle('hidden');
            
            if (notificationsDropdown) {
                notificationsDropdown.classList.add('hidden');
            }
        });
    }
    
    if (notificationButton && notificationsDropdown) {
        notificationButton.addEventListener('click', () => {
            notificationsDropdown.classList.toggle('hidden');
            
            if (userDropdown) {
                userDropdown.classList.add('hidden');
            }
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
        if (userMenuButton && userDropdown && !userMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
            userDropdown.classList.add('hidden');
        }
        
        if (notificationButton && notificationsDropdown && !notificationButton.contains(event.target) && !notificationsDropdown.contains(event.target)) {
            notificationsDropdown.classList.add('hidden');
        }
    });
    
    // Logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                await supabase.auth.signOut();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Failed to log out. Please try again.');
            }
        });
    }
}

// Helper function to update payment status
async function updatePaymentStatus(registrationId, status) {
    try {
        if (!confirm(`Are you sure you want to mark this payment as "${status}"?`)) {
            return;
        }
        
        if (tableLoading) {
            tableLoading.classList.remove('hidden');
        }
        
        const { error } = await supabase
            .from(TABLES.REGISTRATIONS)
            .update({ 
                payment_status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', registrationId);
        
        if (error) throw error;
        
        // Reload data to reflect changes
        await Promise.all([
            loadDashboardStats(),
            loadRecentRegistrations()
        ]);
        
        // Show success message
        alert(`Payment status updated to "${status}" successfully!`);
        
    } catch (error) {
        console.error('Error updating payment status:', error);
        alert(`Failed to update payment status: ${error.message || 'Unknown error'}`);
    } finally {
        if (tableLoading) {
            tableLoading.classList.add('hidden');
        }
    }
}

// Helper function to view registration details
async function viewRegistration(registrationId) {
    try {
        // Show loading state
        if (tableLoading) {
            tableLoading.classList.remove('hidden');
        }
        
        // Fetch registration details
        const { data, error } = await supabase
            .from(TABLES.REGISTRATIONS)
            .select('*')
            .eq('id', registrationId)
            .single();
            
        if (error) throw error;
        
        // Show modal with registration details
        // This is a placeholder - you would typically implement a modal UI here
        const modalContent = `
Registration ID: ${data.registration_id || data.id}
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
University: ${data.university}
Events: ${data.event_name || 'N/A'}
Team: ${data.team_name || 'Individual'}
Team Members: ${JSON.parse(data.team_members || '[]').join(', ') || 'None'}
Fee: ₹${data.fee || 0}
Payment Status: ${data.payment_status || 'Unknown'}
Created: ${new Date(data.created_at).toLocaleString()}
        `;
        
        alert('Registration Details:\n\n' + modalContent);
        
    } catch (error) {
        console.error('Error retrieving registration details:', error);
        alert('Failed to load registration details. Please try again.');
    } finally {
        if (tableLoading) {
            tableLoading.classList.add('hidden');
        }
    }
}

// Helper functions
function getInitials(name) {
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
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
            return 'bg-gray-900 bg-opacity-50 text-gray-300';
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).replace(/_/g, ' ');
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Expose functions to global scope for inline event handlers
window.updatePaymentStatus = updatePaymentStatus;
window.viewRegistration = viewRegistration;
window.viewPaymentProof = viewPaymentProof;
