<?php
/**
 * Health Records endpoints:
 * GET  /api/health/records.php — List health records (optionally filtered by pet_id)
 * POST /api/health/add_record.php — Add a health record
 * POST /api/health/upload_document.php — Upload a medical document
 * GET  /api/health/vaccinations.php — List vaccinations
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validate.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = requireAuth();
$db = getDB();
$path = basename($_SERVER['SCRIPT_NAME']);
$method = $_SERVER['REQUEST_METHOD'];

if ($path === 'records.php' && $method === 'GET') {
    $petId = isset($_GET['pet_id']) ? intval($_GET['pet_id']) : null;
    if ($user['role'] === 'owner') {
        if ($petId) {
            $stmt = $db->prepare("SELECT h.*, u.full_name as vet_name FROM health_records h LEFT JOIN users u ON h.vet_id = u.id WHERE h.pet_id IN (SELECT id FROM pets WHERE owner_id = ?) AND h.pet_id = ? ORDER BY h.date DESC");
            $stmt->execute([$user['id'], $petId]);
        } else {
            $stmt = $db->prepare("SELECT h.*, u.full_name as vet_name, p.name as pet_name FROM health_records h LEFT JOIN users u ON h.vet_id = u.id LEFT JOIN pets p ON h.pet_id = p.id WHERE h.pet_id IN (SELECT id FROM pets WHERE owner_id = ?) ORDER BY h.date DESC");
            $stmt->execute([$user['id']]);
        }
    } elseif ($user['role'] === 'vet') {
        if ($petId) {
            $stmt = $db->prepare("SELECT h.*, p.name as pet_name, u.full_name as owner_name FROM health_records h LEFT JOIN pets p ON h.pet_id = p.id LEFT JOIN users u ON p.owner_id = u.id WHERE h.pet_id = ? ORDER BY h.date DESC");
            $stmt->execute([$petId]);
        } else {
            $stmt = $db->prepare("SELECT h.*, p.name as pet_name, u.full_name as owner_name FROM health_records h LEFT JOIN pets p ON h.pet_id = p.id LEFT JOIN users u ON p.owner_id = u.id WHERE h.vet_id = ? ORDER BY h.date DESC");
            $stmt->execute([$user['id']]);
        }
    } else {
        respondSuccess([]);
    }
    respondSuccess($stmt->fetchAll());
}

elseif ($path === 'add_record.php' && $method === 'POST') {
    requireFields(['pet_id', 'type', 'title', 'date']);
    $petId = inputInt('pet_id');
    $vetId = ($user['role'] === 'vet') ? $user['id'] : (inputInt('vet_id') ?: null);
    $stmt = $db->prepare("INSERT INTO health_records (pet_id, vet_id, type, title, description, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$petId, $vetId, input('type'), input('title'), input('description', ''), input('date'), input('notes', '')]);
    $id = $db->lastInsertId();
    $stmt = $db->prepare("SELECT * FROM health_records WHERE id = ?");
    $stmt->execute([$id]);
    respondSuccess($stmt->fetch(), 'Record added');
}

elseif ($path === 'upload_document.php' && $method === 'POST') {
    requireFields(['pet_id']);
    $petId = inputInt('pet_id');
    $recordId = inputInt('record_id') ?: null;
    $file = uploadFile('document', ['image/jpeg','image/png','image/gif','image/webp','application/pdf'], 10485760);
    if (!$file) respondError('No document uploaded');
    $stmt = $db->prepare("INSERT INTO medical_documents (pet_id, record_id, file_path, file_name) VALUES (?, ?, ?, ?)");
    $stmt->execute([$petId, $recordId, $file, $_FILES['document']['name'] ?? 'document']);
    respondSuccess(['file_path' => $file], 'Document uploaded');
}

elseif ($path === 'vaccinations.php' && $method === 'GET') {
    if ($user['role'] === 'owner') {
        $stmt = $db->prepare("SELECT v.*, p.name as pet_name FROM vaccinations v LEFT JOIN pets p ON v.pet_id = p.id WHERE v.pet_id IN (SELECT id FROM pets WHERE owner_id = ?) ORDER BY v.date_administered DESC");
        $stmt->execute([$user['id']]);
    } else {
        $stmt = $db->prepare("SELECT v.*, p.name as pet_name FROM vaccinations v LEFT JOIN pets p ON v.pet_id = p.id WHERE v.vet_id = ? ORDER BY v.date_administered DESC");
        $stmt->execute([$user['id']]);
    }
    respondSuccess($stmt->fetchAll());
}

else {
    respondError('Invalid endpoint');
}
