import { supabase } from '../../supabase.js';
import { formatDate } from './utils/ui-utils.js';

// Constants
const TABLES = {
    REGISTRATIONS: 'registrations',
    EVENTS: 'events',
    PAYMENTS: 'payments'
};

// DOM Elements
const exportForm = document.getElementById('exportForm');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');
const startDateFilter = document.getElementById('startDate');
const endDateFilter = document.getElementById('endDate');
const exportBtn = document.getElementById('exportBtn');
const exportBtnText = document.getElementById('exportBtnText');
const exportBtnLoading = document.getElementById('exportBtnLoading');
const previewTableBody = document.getElementById('previewTableBody');
const recordCount = document.getElementById('recordCount');
const loadingOverlay = document.getElementById('loadingOverlay');

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
        
        // Set default date range (last 30 days to today)
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        if (startDateFilter) {
            startDateFilter.value = thirtyDaysAgo.toISOString().split('T')[0];
        }
        
        if (endDateFilter) {
            endDateFilter.value = today.toISOString().split('T')[0];
        }
        
        // Update preview on filter change
        const filterInputs = [categoryFilter, statusFilter, startDateFilter, endDateFilter];
        filterInputs.forEach(input => {
            if (input) {
                input.addEventListener('change', generatePreview);
            }
        });
        
        // Handle form submission
        if (exportForm) {
            exportForm.addEventListener('submit', handleExport);
        }
        
        // Generate initial preview
        await generatePreview();
        
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
        
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to load export page. Please try again.');
    }
});

// Generate preview of data to be exported
async function generatePreview() {
    try {
        // Show loading state
        if (previewTableBody) {
            previewTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-4 text-center text-gray-400">
                        <div class="flex justify-center items-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mr-3"></div>
                            <span>Loading preview...</span>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        // Get filter values
        const filters = getFilters();
        
        // Query data with filters
        const { data, error, count } = await queryRegistrations(filters, true);
        
        if (error) throw error;
        
        // Update preview table
        renderPreviewTable(data || []);
        
        // Update record count
        if (recordCount) {
            recordCount.textContent = count;
        }
        
    } catch (error) {
        console.error('Error generating preview:', error);
        if (previewTableBody) {
            previewTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-4 text-center text-red-400">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        Failed to generate preview. ${error.message || ''}
                    </td>
                </tr>
            `;
        }
    }
}

// Handle export button click
async function handleExport(e) {
    e.preventDefault();
    
    try {
        // Show loading state
        if (exportBtn) exportBtn.disabled = true;
        if (exportBtnText) exportBtnText.classList.add('hidden');
        if (exportBtnLoading) exportBtnLoading.classList.remove('hidden');
        
        // Get filters
        const filters = getFilters();
        
        // Get export format
        const exportFormat = document.querySelector('input[name="exportFormat"]:checked')?.value || 'csv';
        
        // Get selected fields
        const selectedFields = Array.from(document.querySelectorAll('input[name="fields"]:checked')).map(input => input.value);
        
        // Query all data (no limit)
        const { data, error } = await queryRegistrations(filters, false);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            throw new Error('No data to export');
        }
        
        // Process data based on selected fields
        const processedData = processDataForExport(data, selectedFields);
        
        // Export data in selected format
        if (exportFormat === 'csv') {
            exportToCSV(processedData);
        } else if (exportFormat === 'json') {
            exportToJSON(processedData);
        } else if (exportFormat === 'excel') {
            alert('Excel export will be available soon!');
        }
        
    } catch (error) {
        console.error('Export error:', error);
        alert(`Export failed: ${error.message || 'Unknown error'}`);
    } finally {
        // Reset button state
        if (exportBtn) exportBtn.disabled = false;
        if (exportBtnText) exportBtnText.classList.remove('hidden');
        if (exportBtnLoading) exportBtnLoading.classList.add('hidden');
    }
}

// Query registrations with filters
async function queryRegistrations(filters, paginated = true) {
    // Build query
    let query = supabase
        .from(TABLES.REGISTRATIONS)
        .select('*', { count: 'exact' });
        
    // Apply filters
    if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
    }
    
    if (filters.status !== 'all') {
        query = query.eq('payment_status', filters.status);
    }
    
    if (filters.startDate) {
        query = query.gte('created_at', `${filters.startDate}T00:00:00`);
    }
    
    if (filters.endDate) {
        query = query.lte('created_at', `${filters.endDate}T23:59:59`);
    }
    
    // Apply pagination for preview only
    if (paginated) {
        query = query.range(0, 4); // Show 5 records (0-4)
    }
    
    query = query.order('created_at', { ascending: false });
    
    // Execute query
    return await query;
}

// Get filter values from form
function getFilters() {
    return {
        category: categoryFilter ? categoryFilter.value : 'all',
        status: statusFilter ? statusFilter.value : 'all',
        startDate: startDateFilter ? startDateFilter.value : null,
        endDate: endDateFilter ? endDateFilter.value : null
    };
}

// Render preview table
function renderPreviewTable(data) {
    if (!previewTableBody) return;
    
    if (data.length === 0) {
        previewTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-4 py-4 text-center text-gray-400">
                    <i class="fas fa-search mr-2"></i>
                    No records found matching your filters
                </td>
            </tr>
        `;
        return;
    }
    
    previewTableBody.innerHTML = data.map(registration => `
        <tr class="border-b border-gray-700">
            <td class="px-4 py-3 text-white">${registration.name}</td>
            <td class="px-4 py-3 text-gray-300">${registration.email}</td>
            <td class="px-4 py-3 text-gray-300">${registration.university}</td>
            <td class="px-4 py-3 text-gray-300">${registration.event_name || 'N/A'}</td>
            <td class="px-4 py-3 text-gray-300">₹${registration.fee || 0}</td>
            <td class="px-4 py-3">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(registration.payment_status)}">
                    ${capitalizeFirstLetter(registration.payment_status || 'Unknown')}
                </span>
            </td>
        </tr>
    `).join('');
}

// Process data for export based on selected fields
function processDataForExport(data, selectedFields) {
    return data.map(registration => {
        const result = {};
        
        // Always include these base fields
        result['Registration ID'] = registration.registration_id || registration.id;
        result['Created At'] = formatDate(registration.created_at);
        
        // Personal Info
        if (selectedFields.includes('personal')) {
            result['Name'] = registration.name;
            result['Email'] = registration.email;
            result['Phone'] = registration.phone;
            result['University'] = registration.university;
        }
        
        // Event Info
        if (selectedFields.includes('events')) {
            result['Events'] = registration.event_name;
            result['Category'] = registration.category === 'tech' ? 'Technical' : 'Cultural';
        }
        
        // Payment Info
        if (selectedFields.includes('payment')) {
            result['Fee'] = registration.fee;
            result['Payment Status'] = capitalizeFirstLetter(registration.payment_status);
            result['Payment Method'] = registration.payment_method === 'qr' ? 'QR Payment' : 'Pay at Venue';
        }
        
        // Team Info
        if (selectedFields.includes('team')) {
            result['Team Name'] = registration.team_name || 'N/A';
            
            try {
                const teamMembers = JSON.parse(registration.team_members || '[]');
                result['Team Members'] = teamMembers.join(', ');
                result['Team Size'] = teamMembers.length + 1; // +1 for the registrant
            } catch (e) {
                result['Team Members'] = '';
                result['Team Size'] = 1;
            }
        }
        
        return result;
    });
}

// Export data to CSV
function exportToCSV(data) {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }
    
    // Get headers from first data object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    csvContent += data.map(row => {
        return headers.map(header => {
            // Escape special characters in CSV
            let value = row[header] !== undefined ? row[header] : '';
            
            // Convert to string and handle commas by wrapping in quotes
            value = String(value);
            
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            
            return value;
        }).join(',');
    }).join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations_export_${formatDateForFilename(new Date())}.csv`);
    link.style.visibility = 'hidden';
    
    // Add to DOM, trigger download and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Export data to JSON
function exportToJSON(data) {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }
    
    // Create JSON content
    const jsonContent = JSON.stringify(data, null, 2);
    
    // Create download link
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations_export_${formatDateForFilename(new Date())}.json`);
    link.style.visibility = 'hidden';
    
    // Add to DOM, trigger download and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Format date for filename (YYYY-MM-DD)
function formatDateForFilename(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// Get status class for UI rendering
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

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Capitalize first letter of string
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).replace(/_/g, ' ');
}
