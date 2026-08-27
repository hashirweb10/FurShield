<?php
/**
 * POST /api/auth/login.php
 * Login with email and password.
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validate.php';
require_once __DIR__ . '/../../config/env.php';

// Start session (same config as auth middleware)
if (session_status() === PHP_SESSION_NONE) {
    $lifetime = intval(env('SESSION_LIFETIME', 86400));
    session_set_cookie_params([
        'lifetime' => $lifetime,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('Method not allowed', 405);
}

requireFields(['email', 'password']);

$email = input('email');
$password = inputRaw('password');

$db = getDB();

// Find user
$stmt = $db->prepare("SELECT id, email, password_hash, role, full_name FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    respondError('Invalid email or password', 401);
}

// Set session
$_SESSION['user_id'] = $user['id'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['user_role'] = $user['role'];
$_SESSION['user_name'] = $user['full_name'];

respondSuccess([
    'id' => $user['id'],
    'email' => $user['email'],
    'role' => $user['role'],
    'name' => $user['full_name']
], 'Login successful');
