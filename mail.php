<?php
// mail.php - put this in your project root (same folder as index.html/index.php)

// DEBUG: show PHP errors (turn off on production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ---------- CONFIG ----------
$use_smtp = true;                 // set false to force PHP mail() fallback
$smtp_host = 'smtp.gmail.com';
$smtp_port = 587;
$smtp_user = 'yourgmail@gmail.com';        // <- REPLACE with your Gmail
$smtp_pass = 'your-app-password';          // <- REPLACE with Gmail App Password (NOT your normal password)
$smtp_from_email = $smtp_user;             // recommended: same as smtp_user
$smtp_from_name  = 'Virtual Spark';        // name that appears in From
$recipients = [
    'razaabro.dev@gmail.com',
    'ghulamakbarabbbro110@gmail.com',
    'virtualspark.info@gmail.com'
];
// ---------- END CONFIG ----------

// Helper: return plain text response (AJAX expects text)
function respond($code, $text) {
    http_response_code($code);
    echo $text;
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(403, "Invalid request method.");
}

// Get + sanitize inputs
$fullname = isset($_POST['fullname']) ? trim(strip_tags($_POST['fullname'])) : '';
$fullname = str_replace(array("\r","\n"), array(" ", " "), $fullname);
$email    = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$phone    = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$message  = isset($_POST['message']) ? trim($_POST['message']) : '';

// Basic validation
if (empty($fullname) || empty($email) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, "Please complete required fields and provide a valid email.");
}

// Prepare body
$subject = "Message from $fullname";
$body = "Name: $fullname\n";
$body .= "Email: $email\n";
$body .= "Phone: $phone\n\n";
$body .= "Message:\n$message\n";

// Try PHPMailer via Composer if enabled
if ($use_smtp) {
    // autoload path - adjust if your vendor folder is elsewhere
    $autoload = __DIR__ . '/vendor/autoload.php';

    if (file_exists($autoload)) {
        require $autoload;
        // PHPMailer namespace
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        try {
            // SMTP settings
            $mail->isSMTP();
            $mail->Host = $smtp_host;
            $mail->SMTPAuth = true;
            $mail->Username = $smtp_user;
            $mail->Password = $smtp_pass;
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $smtp_port;
            $mail->CharSet = 'UTF-8';

            // From (important: many SMTP providers require From to match smtp account)
            $mail->setFrom($smtp_from_email, $smtp_from_name);
            // Reply to user
            $mail->addReplyTo($email, $fullname);

            // Add recipients
            foreach ($recipients as $r) {
                $mail->addAddress($r);
            }

            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->isHTML(false);

            $mail->send();
            respond(200, "Thank You! Your message has been sent.");
        } catch (Exception $e) {
            // PHPMailer error string is useful for debugging
            respond(500, "Mailer Error: " . $mail->ErrorInfo);
        }
    } else {
        // autoload not found - fallback to mail()
        $use_smtp = false; // force fallback below
    }
}

// Fallback: PHP mail()
if (!$use_smtp) {
    $to = implode(", ", $recipients);
    $headers = "From: $fullname <$email>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    if (mail($to, $subject, $body, $headers)) {
        respond(200, "Thank You! Your message has been sent (via PHP mail()).");
    } else {
        respond(500, "PHP mail() failed. Check server mail configuration or use SMTP.");
    }
}
