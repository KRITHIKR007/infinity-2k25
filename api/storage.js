import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://ceickbodqhwfhcpabfdq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWNrYm9kcWh3ZmhjcGFiZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2MTgsImV4cCI6MjA1NzkxMTYxOH0.ZyTG1FkQzjQ0CySlyvkQEYPHWBbZJd--vsB_IqILuo8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Storage buckets
const BUCKETS = {
    PAYMENT_PROOFS: 'payment_proofs',
};

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        // GET request to fetch files
        if (req.method === 'GET') {
            const { bucket = BUCKETS.PAYMENT_PROOFS, path = '' } = req.query;
            
            if (req.query.url) {
                // Get public URL for a file
                const { data } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(req.query.url);
                
                return res.status(200).json({
                    success: true,
                    url: data.publicUrl
                });
            } else {
                // List files in a bucket/folder
                const { data, error } = await supabase.storage
                    .from(bucket)
                    .list(path);
                
                if (error) throw error;
                
                return res.status(200).json({
                    success: true,
                    files: data
                });
            }
        }
        
        // POST request to upload a file
        else if (req.method === 'POST') {
            // This requires a multipart form parser which is not included in this example
            // In a real world scenario, you'd use formidable, multer, or a similar library
            // For this example, we'll just return instructions
            return res.status(200).json({
                success: false,
                message: 'File uploads should be handled directly via the Supabase client in the browser'
            });
        }
        
        // DELETE request to remove a file
        else if (req.method === 'DELETE') {
            const { bucket = BUCKETS.PAYMENT_PROOFS, path } = req.body;
            
            if (!path) {
                return res.status(400).json({
                    success: false,
                    message: 'File path is required'
                });
            }
            
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path]);
            
            if (error) throw error;
            
            return res.status(200).json({
                success: true,
                message: 'File deleted successfully'
            });
        }
        
        else {
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error('Storage API error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}
