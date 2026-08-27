<?php
/**
 * GET /api/users/profile.php
 * Get detailed profile for current user.
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = requireAuth();
$db = getDB();

$stmt = $db->prepare("SELECT id, email, role, full_name, phone, address, avatar FROM users WHERE id = ?");
$stmt->execute([$user['id']]);
$profile = $stmt->fetch();

// Get role-specific data
if ($user['role'] === 'owner') {
    $stmt = $db->prepare("SELECT bio, emergency_contact FROM owner_profiles WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $extra = $stmt->fetch();
    $profile = array_merge($profile, $extra ?: []);
} elseif ($user['role'] === 'vet') {
    $stmt = $db->prepare("SELECT specialization, experience, qualifications, clinic_name, consultation_fee, rating, total_reviews FROM vet_profiles WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $extra = $stmt->fetch();
    $profile = array_merge($profile, $extra ?: []);
} elseif ($user['role'] === 'shelter') {
    $stmt = $db->prepare("SELECT shelter_name, description, operating_hours, capacity FROM shelter_profiles WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $extra = $stmt->fetch();
    $profile = array_merge($profile, $extra ?: []);
}

$profile['name'] = $profile['full_name'];
respondSuccess($profile);
