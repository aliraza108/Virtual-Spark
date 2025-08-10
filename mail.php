<?php
// mail.php - Insert contact form into Supabase (hardcoded keys)
// Model: GPT-5 Thinking mini
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// -----------------
// Supabase config (HARDCODED)
$supabase_url = 'https://capovlpsazabvijplgqh.supabase.co';
$service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcG92bHBzYXphYnZpanBsZ3FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc3NzY1MywiZXhwIjoyMDcwMzUzNjUzfQ.Qh7S5U0pV9p97gI9fCCbb2V21n7_8-lg-VqgWvVfjBk';
// -----------------

// helper response
function respond($code, $status, $message) {
    http_response_code($code);
    echo json_encode(['status' => $status, 'message' => $message]);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, 'error', 'Invalid request method. Use POST.');
}

// Read + sanitize inputs
$name    = isset($_POST['fullname']) ? trim(strip_tags($_POST['fullname'])) : '';
$surname = isset($_POST['lastname']) ? trim(strip_tags($_POST['lastname'])) : '';
$mail    = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$number  = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$subject = isset($_POST['topic']) ? trim(strip_tags($_POST['topic'])) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Basic validation
if ($name === '' || $mail === '' || $message === '') {
    respond(400, 'error', 'Please complete required fields (name, email, message).');
}
if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    respond(400, 'error', 'Please provide a valid email address.');
}

// Normalize number: keep digits only or null
$number_digits = preg_replace('/\D+/', '', $number);
if ($number_digits === '') $number_digits = null;

// Build Supabase REST endpoint for table "contactform"
$endpoint = rtrim($supabase_url, '/') . '/rest/v1/contactform';

// Build payload (keys must match your table columns)
$payload = [
    'name'    => $name,
    'surname' => $surname,
    'mail'    => $mail,
    'number'  => $number_digits === null ? null : $number_digits,
    'subject' => $subject,
    'message' => $message
];

$json = json_encode($payload);

// cURL to Supabase
$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'apikey: ' . $service_role_key,
    'Authorization: Bearer ' . $service_role_key,
    'Prefer: return=representation'
]);
$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    respond(500, 'error', 'Curl error: ' . $curlErr);
}

// Success is normally 201 Created, or 200 if representation returned
if ($httpCode >= 200 && $httpCode < 300) {
    // Optionally you can decode $result to get the inserted row
    respond(200, 'success', 'Thank you — your message has been saved.');
} else {
    // Return Supabase body for debugging (be careful: may include details)
    $msg = "Supabase API error (HTTP $httpCode). Response: " . $result;
    respond(500, 'error', $msg);
}
