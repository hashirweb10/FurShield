<?php
/**
 * Authentication Middleware
 * Checks for valid session and loads user data.
 */

require_once __DIR__ . '/../config/env.php';

// Start session if not already started
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

/**
 * Require authenticated user. Exits with 401 if not logged in.
 * Returns the current user data from session.
 */
function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        respondUnauthorized('Please log in to continue');
    }

    return [
        'id' => $_SESSION['user_id'],
        'email' => $_SESSION['user_email'] ?? '',
        'role' => $_SESSION['user_role'] ?? '',
        'name' => $_SESSION['user_name'] ?? ''
    ];
}

/**
 * Check if user is authenticated (non-blocking).
 */
function isAuthenticated() {
    return isset($_SESSION['user_id']);
}

/**
 * Get current user ID or null.
 */
function currentUserId() {
    return $_SESSION['user_id'] ?? null;
}
