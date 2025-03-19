/**
 * Event Card Component
 * A reusable component for displaying event information
 */
export class EventCard {
    /**
     * Create a new EventCard instance
     * @param {Object} event - The event data
     * @param {Object} options - Configuration options
     */
    constructor(event, options = {}) {
        this.event = event;
        this.options = {
            showRegisterButton: true,
            showDescription: true,
            maxDescriptionLength: 150,
            showDetails: true,
            size: 'medium', // small, medium, large
            ...options
        };
    }
    
    /**
     * Render the event card as HTML
     * @returns {string} - HTML string
     */
    render() {
        const event = this.event;
        const options = this.options;
        
        // Format date
        const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Truncate description if needed
        let description = event.description || '';
        if (options.showDescription && description.length > options.maxDescriptionLength) {
            description = description.substring(0, options.maxDescriptionLength) + '...';
        }
        
        // Set card size classes
        let cardClasses = 'glass-effect rounded-xl overflow-hidden transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg';
        let headingClass = 'text-xl font-bold text-white';
        let paddingClass = 'p-6';
        
        if (options.size === 'small') {
            paddingClass = 'p-4';
            headingClass = 'text-lg font-bold text-white';
        } else if (options.size === 'large') {
            paddingClass = 'p-8';
            headingClass = 'text-2xl font-bold text-white';
        }
        
        // Build the HTML
        return `
            <div class="${cardClasses}">
                <div class="${paddingClass}">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="${headingClass}">${event.name}</h3>
                        <span class="px-2 py-1 text-xs rounded-full ${event.category === 'tech' ? 'bg-blue-900 bg-opacity-50 text-blue-300' : 'bg-purple-900 bg-opacity-50 text-purple-300'}">
                            ${event.category === 'tech' ? 'Technical' : 'Cultural'}
                        </span>
                    </div>
                    
                    ${options.showDescription ? `
                        <p class="text-gray-300 text-sm mb-4 line-clamp-3">${description}</p>
                    ` : ''}
                    
                    ${options.showDetails ? `
                        <div class="flex justify-between text-sm text-gray-400 mb-4">
                            <div><i class="fas fa-users mr-1"></i> Team: ${event.min_team_size}-${event.max_team_size}</div>
                            <div><i class="fas fa-calendar-day mr-1"></i> ${eventDate}</div>
                        </div>
                        <div class="flex justify-between items-center">
                            <div class="text-sm text-gray-400">
                                <i class="fas fa-map-marker-alt mr-1"></i> ${event.venue}
                            </div>
                            <div class="text-sm font-semibold text-purple-400">₹${event.fee}</div>
                        </div>
                    ` : ''}
                    
                    ${options.showRegisterButton ? `
                        <div class="flex justify-between items-center mt-4">
                            <a href="/pages/events/${event.id}.html" class="text-purple-400 hover:text-purple-300 text-sm">
                                <i class="fas fa-info-circle mr-1"></i> Details
                            </a>
                            <a href="/pages/register.html?event=${event.id}" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm">
                                Register Now
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Append the card to a container element
     * @param {HTMLElement} container - The container element
     */
    appendTo(container) {
        if (!container) return;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.render();
        container.appendChild(tempDiv.firstElementChild);
    }
    
    /**
     * Create and append multiple event cards to a container
     * @param {Array} events - Array of event objects
     * @param {HTMLElement} container - The container element
     * @param {Object} options - Configuration options
     */
    static renderMultiple(events, container, options = {}) {
        if (!container || !Array.isArray(events)) return;
        
        // Clear container
        container.innerHTML = '';
        
        if (events.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-calendar-times text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-300">No events available</p>
                </div>
            `;
            return;
        }
        
        // Render each event
        events.forEach(event => {
            const card = new EventCard(event, options);
            card.appendTo(container);
        });
    }
}
