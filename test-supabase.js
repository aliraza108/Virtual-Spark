const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://capovlpsazabvijplgqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcG92bHBzYXphYnZpanBsZ3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc3NzY1MywiZXhwIjoyMDcwMzUzNjUzfQ.Qh7S5U0pV9p97gI9fCCbb2V21n7_8-lg-VqgWvVfjBk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    try {
        const { data, error } = await supabase
            .from('contactform')
            .insert([
                {
                    name: 'Test',
                    surname: 'User',
                    mail: 'test@example.com',
                    number: 1234567890,
                    subject: 'uiux',
                    message: 'This is a test message'
                }
            ])
            .select();

        if (error) {
            console.error('Insert error:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return;
        }
        console.log('Insert successful:', data);
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

testInsert();