<?php
/**
 * Contact form endpoint:
 * POST /api/contact/submit.php — Submit contact form
 * GET  /api/contact/submit.php — List submissions (admin)
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validate.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    requireFields(['name', 'email', 'message']);
    $email = input('email');
    if (!isValidEmail($email)) respondError('Invalid email address');

    $stmt = $db->prepare("INSERT INTO contact_submissions (name, email, subject, message) VALUES (?, ?, ?, ?)");
    $stmt->execute([input('name'), $email, input('subject', ''), input('message')]);
    respondSuccess(['id' => $db->lastInsertId()], 'Message sent successfully');
}

elseif ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 100");
    respondSuccess($stmt->fetchAll());
}

else {
    respondError('Method not allowed');
}
