<?php
/**
 * Pet CRUD endpoints:
 * GET  /api/pets/list.php — List owner's pets
 * POST /api/pets/create.php — Create pet
 * POST /api/pets/update.php — Update pet
 * DELETE /api/pets/delete.php — Delete pet
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validate.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../middleware/role.php';

$user = requireRole('owner');
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$path = basename($_SERVER['SCRIPT_NAME']);

if ($path === 'list.php' && $method === 'GET') {
    $stmt = $db->prepare("SELECT p.*, pi.image_path as image FROM pets p LEFT JOIN pet_images pi ON pi.pet_id = p.id AND pi.is_primary = 1 WHERE p.owner_id = ? ORDER BY p.created_at DESC");
    $stmt->execute([$user['id']]);
    respondSuccess($stmt->fetchAll());
}

elseif ($path === 'create.php' && $method === 'POST') {
    requireFields(['name', 'species']);
    $stmt = $db->prepare("INSERT INTO pets (owner_id, name, species, breed, age, gender, weight, health_status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$user['id'], input('name'), input('species'), input('breed', ''), input('age', ''), input('gender', 'Male'), input('weight', 0), input('health_status', 'Healthy'), input('notes', '')]);
    $petId = $db->lastInsertId();

    // Handle image upload
    $image = uploadFile('image');
    if ($image) {
        $db->prepare("INSERT INTO pet_images (pet_id, image_path, is_primary) VALUES (?, ?, 1)")->execute([$petId, $image]);
    }

    $stmt = $db->prepare("SELECT * FROM pets WHERE id = ?");
    $stmt->execute([$petId]);
    respondSuccess($stmt->fetch(), 'Pet added');
}

elseif ($path === 'update.php' && $method === 'POST') {
    requireFields(['id']);
    $petId = inputInt('id');

    // Verify ownership
    $stmt = $db->prepare("SELECT id FROM pets WHERE id = ? AND owner_id = ?");
    $stmt->execute([$petId, $user['id']]);
    if (!$stmt->fetch()) respondForbidden('Not your pet');

    $db->prepare("UPDATE pets SET name=?, species=?, breed=?, age=?, gender=?, weight=?, health_status=?, notes=? WHERE id=?")->execute([
        input('name'), input('species'), input('breed', ''), input('age', ''), input('gender', 'Male'), input('weight', 0), input('health_status', 'Healthy'), input('notes', ''), $petId
    ]);

    $image = uploadFile('image');
    if ($image) {
        $db->prepare("DELETE FROM pet_images WHERE pet_id = ? AND is_primary = 1")->execute([$petId]);
        $db->prepare("INSERT INTO pet_images (pet_id, image_path, is_primary) VALUES (?, ?, 1)")->execute([$petId, $image]);
    }

    $stmt = $db->prepare("SELECT * FROM pets WHERE id = ?");
    $stmt->execute([$petId]);
    respondSuccess($stmt->fetch(), 'Pet updated');
}

elseif ($path === 'delete.php' && $method === 'DELETE') {
    $petId = inputInt('id') ?: inputInt('id', 0);
    if (isset($_GET['id'])) $petId = intval($_GET['id']);
    $stmt = $db->prepare("SELECT id FROM pets WHERE id = ? AND owner_id = ?");
    $stmt->execute([$petId, $user['id']]);
    if (!$stmt->fetch()) respondForbidden('Not your pet');
    $db->prepare("DELETE FROM pets WHERE id = ?")->execute([$petId]);
    respondSuccess(null, 'Pet deleted');
}

else {
    respondError('Invalid endpoint');
}
