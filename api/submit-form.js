const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { fullname, lastname, email, phone, topic, message } = req.body;

    // Basic validation
    if (!email || !phone) {
        console.error('Validation failed: Email and phone are required', { email, phone });
        return res.status(400).json({ error: 'Email and phone are required' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase configuration', { supabaseUrl, supabaseKey });
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { data, error } = await supabase
            .from('contactform')
            .insert([
                {
                    name: fullname || null,
                    surname: lastname || null,
                    mail: email,
                    number: phone ? parseFloat(phone.replace(/[^0-9.]/g, '')) : null, // Clean and convert phone to numeric
                    subject: topic || null,
                    message: message || null
                }
            ])
            .select(); // Return inserted data for verification

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