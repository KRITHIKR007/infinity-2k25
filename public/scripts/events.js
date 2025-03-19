import { supabase, TABLES } from '../../supabase.js';

/**
 * Events module for handling event-related operations
 */
export const events = {
    /**
     * Get all events with optional filtering
     * @param {Object} options - Filter options
     * @returns {Promise<Object>} - Query result
     */
    getAll: async (options = {}) => {
        try {
            let query = supabase
                .from(TABLES.EVENTS)
                .select('*');
                
            // Apply filters if provided
            if (options.category) {
                query = query.eq('category', options.category);
            }
            
            if (options.status) {
                query = query.eq('status', options.status);
            }
            
            if (options.orderBy) {
                query = query.order(options.orderBy.column, { 
                    ascending: options.orderBy.ascending 
                });
            } else {
                // Default ordering by created_at (newest first)
                query = query.order('created_at', { ascending: false });
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching events:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Get an event by ID
     * @param {string} id - Event ID
     * @returns {Promise<Object>} - Query result
     */
    getById: async (id) => {
        try {
            const { data, error } = await supabase
                .from(TABLES.EVENTS)
                .select('*')
                .eq('id', id)
                .single();
                
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching event:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Create a new event
     * @param {Object} eventData - Event data
     * @returns {Promise<Object>} - Query result
     */
    create: async (eventData) => {
        try {
            // Ensure required fields
            if (!eventData.name || !eventData.category) {
                throw new Error('Event name and category are required');
            }
            
            const { data, error } = await supabase
                .from(TABLES.EVENTS)
                .insert([{
                    ...eventData,
                    created_at: new Date().toISOString(),
                    status: eventData.status || 'active'
                }])
                .select();
                
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error creating event:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Update an event
     * @param {string} id - Event ID
     * @param {Object} eventData - Updated event data
     * @returns {Promise<Object>} - Query result
     */
    update: async (id, eventData) => {
        try {
            const { data, error } = await supabase
                .from(TABLES.EVENTS)
                .update({
                    ...eventData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select();
                
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating event:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Delete an event
     * @param {string} id - Event ID
     * @returns {Promise<Object>} - Query result
     */
    delete: async (id) => {
        try {
            // First check if there are any registrations for this event
            const { count, error: countError } = await supabase
                .from(TABLES.REGISTRATIONS)
                .select('id', { count: 'exact', head: true })
                .filter('events', 'cs', `{"${id}"}`);
                
            if (countError) throw countError;
            
            // If there are registrations, don't allow deletion
            if (count > 0) {
                throw new Error(`Cannot delete event with ${count} existing registrations`);
            }
            
            // If no registrations, proceed with deletion
            const { error } = await supabase
                .from(TABLES.EVENTS)
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            return { success: true, error: null };
        } catch (error) {
            console.error('Error deleting event:', error);
            return { success: false, error };
        }
    },
    
    /**
     * Get events by category
     * @param {string} category - Event category (tech, cultural, etc.)
     * @returns {Promise<Object>} - Query result
     */
    getByCategory: async (category) => {
        return await events.getAll({ category });
    },
    
    /**
     * Get active events only
     * @returns {Promise<Object>} - Query result
     */
    getActive: async () => {
        return await events.getAll({ status: 'active' });
    }
};
