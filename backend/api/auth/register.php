<?php
/**
 * POST /api/auth/register.php
 * Register a new user with role selection.
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validate.php';

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

requireFields(['email', 'password', 'role']);

$role = input('role');

// For shelters, use contact_person as full_name; for others use full_name
if ($role === 'shelter') {
    $fullName = input('contact_person', input('shelter_name', ''));
    if (!$fullName) respondError('Contact person name is required');
} else {
    $fullName = input('full_name');
    if (!$fullName) respondError('Full name is required');
}

$email = input('email');
$password = inputRaw('password');
$phone = input('phone', '');
$address = input('address', '');

// Validate email
if (!isValidEmail($email)) {
    respondError('Invalid email address');
}

// Validate password length
if (strlen($password) < 6) {
    respondError('Password must be at least 6 characters');
}

// Validate role
$validRoles = ['owner', 'vet', 'shelter'];
if (!in_array($role, $validRoles)) {
    respondError('Invalid role. Must be: owner, vet, or shelter');
}

$db = getDB();

// Check if email exists
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    respondError('An account with this email already exists');
}

// Create user
$passwordHash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $db->prepare("INSERT INTO users (email, password_hash, role, full_name, phone, address) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([$email, $passwordHash, $role, $fullName, $phone, $address]);
$userId = $db->lastInsertId();

// Create role-specific profile
if ($role === 'owner') {
    $db->prepare("INSERT INTO owner_profiles (user_id) VALUES (?)")->execute([$userId]);
} elseif ($role === 'vet') {
    $db->prepare("INSERT INTO vet_profiles (user_id) VALUES (?)")->execute([$userId]);
} elseif ($role === 'shelter') {
    $shelterName = input('shelter_name', $fullName);
    $db->prepare("INSERT INTO shelter_profiles (user_id, shelter_name) VALUES (?, ?)")->execute([$userId, $shelterName]);
}

// Auto-login after registration
$_SESSION['user_id'] = $userId;
$_SESSION['user_email'] = $email;
$_SESSION['user_role'] = $role;
$_SESSION['user_name'] = $fullName;

respondSuccess([
    'id' => $userId,
    'email' => $email,
    'role' => $role,
    'name' => $fullName
], 'Registration successful');
