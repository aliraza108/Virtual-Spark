const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { fullname, lastname, email, phone, topic, message } = req.body;

    // Basic validation
    if (!email || !phone) {
        return res.status(400).json({ error: 'Email and phone are required' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('contactform')
        .insert([
            {
                name: fullname,
                surname: lastname,
                mail: email,
                number: phone,
                subject: topic,
                message: message
            }
        ]);

    if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to save data to database' });
    }

    return res.status(200).json({ message: 'Form data saved successfully', data });
};