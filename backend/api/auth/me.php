<?php
/**
 * GET /api/auth/me.php
 * Get current authenticated user info from session.
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respondError('Method not allowed', 405);
}

if (!isAuthenticated()) {
    respondSuccess(null, 'Not authenticated');
}

$userId = currentUserId();
$db = getDB();

$stmt = $db->prepare("SELECT id, email, role, full_name, phone, address, avatar FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    session_destroy();
    respondSuccess(null, 'User not found');
}

respondSuccess([
    'id' => $user['id'],
    'email' => $user['email'],
    'role' => $user['role'],
    'name' => $user['full_name'],
    'phone' => $user['phone'],
    'address' => $user['address'],
    'avatar' => $user['avatar']
]);
