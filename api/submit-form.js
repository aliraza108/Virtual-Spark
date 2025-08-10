const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        console.error('Invalid method:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { fullname, lastname, email, phone, topic, message } = req.body;

    // Log received data for debugging
    console.log('Received form data:', { fullname, lastname, email, phone, topic, message });

    // Validate required fields
    if (!email || !phone) {
        console.error('Validation failed: Email and phone are required', { email, phone });
        return res.status(400).json({ error: 'Email and phone are required' });
    }

    // Clean and validate phone number
    let cleanedPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanedPhone || isNaN(cleanedPhone)) {
        console.error('Invalid phone number:', phone);
        return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Hardcoded Supabase credentials
    const supabaseUrl = 'https://capovlpsazabvijplgqh.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcG92bHBzYXphYnZpanBsZ3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc3NzY1MywiZXhwIjoyMDcwMzUzNjUzfQ.Qh7S5U0pV9p97gI9fCCbb2V21n7_8-lg-VqgWvVfjBk';

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { data, error } = await supabase
            .from('contactform')
            .insert([
                {
                    name: fullname || null,
                    surname: lastname || null,
                    mail: email,
                    number: parseFloat(cleanedPhone), // Ensure numeric type
                    subject: topic || null,
                    message: message || null
                }
            ])
            .select();

        if (error) {
            console.error('Supabase insert error:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return res.status(500).json({ error: 'Failed to save data to database', details: error.message });
        }

        console.log('Insert successful:', data);
        return res.status(200).json({ message: 'Form data saved successfully', data });
    } catch (error) {
        console.error('Unexpected error in submit-form:', error);
        return res.status(500).json({ error: 'Unexpected server error', details: error.message });
    }
};