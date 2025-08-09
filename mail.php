<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ---------- CONFIG ----------
$use_smtp = true;

// Zoho SMTP settings
$smtp_host       = 'smtp.zoho.com';
$smtp_port       = 587; // use 587 for TLS, 465 for SSL
$smtp_user       = 'support@klothek.com'; // full email address
$smtp_pass       = 'DQGaJvFJHmaB';         // Zoho App Password (NOT your login password)
$smtp_from_email = $smtp_user;             // must match authenticated email
$smtp_from_name  = 'Ali Raza';              // "From" display name

$recipients = [
    'razaabro.dev@gmail.com',
    'ghulamakbarabbbro110@gmail.com',
    'virtualspark.info@gmail.com'
];

// ---------- HELPER ----------
function respond($code, $text) {
    http_response_code($code);
    echo $text;
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(403, "Invalid request method.");
}

// Get + sanitize POST data
$fullname = isset($_POST['fullname']) ? trim(strip_tags($_POST['fullname'])) : '';
$email    = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$phone    = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$message  = isset($_POST['message']) ? trim($_POST['message']) : '';

if (empty($fullname) || empty($email) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, "Please complete all required fields and use a valid email.");
}

$subject = "Message from $fullname";
$body = "Name: $fullname\n";
$body .= "Email: $email\n";
$body .= "Phone: $phone\n\n";
$body .= "Message:\n$message\n";

// ---------- SEND ----------
$autoload = __DIR__ . '/vendor/autoload.php';

if ($use_smtp && file_exists($autoload)) {
    require $autoload;
    $mail = new PHPMailer(true);
    try {
        // SMTP config
        $mail->isSMTP();
        $mail->Host       = $smtp_host;
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtp_user;
        $mail->Password   = $smtp_pass;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // TLS
        $mail->Port       = 587;
        $mail->CharSet    = 'UTF-8';

        // Debugging (set to 0 in production)
        $mail->SMTPDebug  = 0;
        $mail->Debugoutput = 'error_log';

        // From & reply
        $mail->setFrom($smtp_from_email, $smtp_from_name);
        $mail->addReplyTo($email, $fullname);

        // Recipients
        foreach ($recipients as $r) {
            $mail->addAddress($r);
        }

        // Content
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->isHTML(false);

        $mail->send();
        respond(200, "Thank you! Your message has been sent successfully.");
    } catch (Exception $e) {
        respond(500, "Mailer Error: " . $mail->ErrorInfo);
    }
} else {
    // PHP mail() fallback
    $to = implode(", ", $recipients);
    $headers = "From: $fullname <$email>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    if (mail($to, $subject, $body, $headers)) {
        respond(200, "Thank you! Your message has been sent.");
    } else {
        respond(500, "PHP mail() failed. Please use SMTP.");
    }
}
