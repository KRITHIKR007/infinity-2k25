import { supabase, TABLES } from '../../../supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('loginSection')
    const dashboardSection = document.getElementById('dashboardSection')
    const loginForm = document.getElementById('loginForm')
    const logoutBtn = document.getElementById('logoutBtn')
    const searchInput = document.getElementById('searchInput')
    const paymentStatusFilter = document.getElementById('paymentStatusFilter')
    const registrationsTableBody = document.getElementById('registrationsTableBody')

    // Check if user is already logged in
    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            showDashboard()
            loadRegistrations()
        }
    }

    // Handle login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error

            showDashboard()
            loadRegistrations()
        } catch (error) {
            console.error('Login error:', error)
            alert('Invalid email or password')
        }
    })

    // Handle logout
    logoutBtn.addEventListener('click', async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            showLogin()
        } catch (error) {
            console.error('Logout error:', error)
        }
    })

    // Handle search and filter
    searchInput.addEventListener('input', debounce(loadRegistrations, 300))
    paymentStatusFilter.addEventListener('change', loadRegistrations)

    // Load registrations
    async function loadRegistrations() {
        try {
            let query = supabase
                .from(TABLES.REGISTRATIONS)
                .select('*')
                .order('created_at', { ascending: false })

            // Apply search filter
            const searchTerm = searchInput.value.toLowerCase()
            if (searchTerm) {
                query = query.or(`name.ilike.%${searchTerm}%,university.ilike.%${searchTerm}%`)
            }

            // Apply payment status filter
            const paymentStatus = paymentStatusFilter.value
            if (paymentStatus !== 'all') {
                query = query.eq('payment_status', paymentStatus)
            }

            const { data, error } = await query

            if (error) throw error

            renderRegistrations(data)
        } catch (error) {
            console.error('Error loading registrations:', error)
        }
    }

    // Render registrations table
    function renderRegistrations(registrations) {
        registrationsTableBody.innerHTML = registrations.map(registration => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${registration.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${registration.university}</td>
                <td class="px-6 py-4 whitespace-nowrap">${registration.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap">${registration.team_members.length}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${getPaymentStatusClass(registration.payment_status)}">
                        ${registration.payment_status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="updatePaymentStatus('${registration.id}', 'verified')"
                        class="text-green-600 hover:text-green-900 mr-3">
                        Verify
                    </button>
                    <button onclick="updatePaymentStatus('${registration.id}', 'rejected')"
                        class="text-red-600 hover:text-red-900">
                        Reject
                    </button>
                </td>
            </tr>
        `).join('')
    }

    // Update payment status
    window.updatePaymentStatus = async (id, status) => {
        try {
            const { error } = await supabase
                .from(TABLES.REGISTRATIONS)
                .update({ payment_status: status })
                .eq('id', id)

            if (error) throw error

            loadRegistrations()
        } catch (error) {
            console.error('Error updating payment status:', error)
            alert('Failed to update payment status')
        }
    }

    // Helper functions
    function showDashboard() {
        loginSection.classList.add('hidden')
        dashboardSection.classList.remove('hidden')
    }

    function showLogin() {
        loginSection.classList.remove('hidden')
        dashboardSection.classList.add('hidden')
    }

    function getPaymentStatusClass(status) {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-yellow-100 text-yellow-800'
        }
    }

    function debounce(func, wait) {
        let timeout
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout)
                func(...args)
            }
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
        }
    }

    // Initial auth check
    checkAuth()
})