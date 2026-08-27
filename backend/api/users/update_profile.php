<?php
/**
 * POST /api/users/owner_profile.php — Update owner profile
 * POST /api/users/vet_profile.php — Update vet profile
 * POST /api/users/shelter_profile.php — Update shelter profile
 * POST /api/users/change_password.php — Change password
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validate.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../middleware/role.php';

$user = requireAuth();
$db = getDB();

$path = $_SERVER['SCRIPT_NAME'];

if (str_contains($path, 'owner_profile')) {
    $bio = input('bio', '');
    $emergency = input('emergency_contact', '');
    $db->prepare("UPDATE owner_profiles SET bio = ?, emergency_contact = ? WHERE user_id = ?")->execute([$bio, $emergency, $user['id']]);
    $db->prepare("UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?")->execute([input('full_name', $user['name']), input('phone', ''), input('address', ''), $user['id']]);
    $_SESSION['user_name'] = input('full_name', $user['name']);
    respondSuccess(['name' => $_SESSION['user_name']], 'Profile updated');
}

elseif (str_contains($path, 'vet_profile')) {
    $name = input('full_name', $user['name']);
    $db->prepare("UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?")->execute([$name, input('phone', ''), input('address', ''), $user['id']]);
    $db->prepare("UPDATE vet_profiles SET specialization = ?, experience = ?, qualifications = ? WHERE user_id = ?")->execute([input('specialization', ''), input('experience', ''), input('qualifications', ''), $user['id']]);
    $_SESSION['user_name'] = $name;
    respondSuccess(['name' => $name], 'Profile updated');
}

elseif (str_contains($path, 'shelter_profile')) {
    $name = input('contact_person', $user['name']);
    $db->prepare("UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?")->execute([$name, input('phone', ''), input('address', ''), $user['id']]);
    $db->prepare("UPDATE shelter_profiles SET shelter_name = ?, description = ?, operating_hours = ? WHERE user_id = ?")->execute([input('shelter_name', ''), input('description', ''), input('operating_hours', ''), $user['id']]);
    $_SESSION['user_name'] = $name;
    respondSuccess(['name' => $name], 'Profile updated');
}

elseif (str_contains($path, 'change_password')) {
    $currentPassword = inputRaw('current_password');
    $newPassword = inputRaw('new_password');
    if (strlen($newPassword) < 6) respondError('Password must be at least 6 characters');
    $stmt = $db->prepare("SELECT password_hash FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();
    if (!password_verify($currentPassword, $row['password_hash'])) respondError('Current password is incorrect');
    $hash = password_hash($newPassword, PASSWORD_BCRYPT);
    $db->prepare("UPDATE users SET password_hash = ? WHERE id = ?")->execute([$hash, $user['id']]);
    respondSuccess(null, 'Password changed');
}

else {
    respondError('Invalid endpoint');
}
