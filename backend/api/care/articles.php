<?php
/**
 * Care endpoints:
 * GET  /api/care/articles.php — List care articles
 * GET  /api/care/faqs.php — List FAQs
 * GET  /api/care/shelter_logs.php?pet_id= — Get shelter care logs
 * POST /api/care/add_log.php — Add care log (shelter)
 * DELETE /api/care/delete_log.php — Delete care log (shelter)
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validate.php';
require_once __DIR__ . '/../../middleware/auth.php';

$db = getDB();
$path = basename($_SERVER['SCRIPT_NAME']);
$method = $_SERVER['REQUEST_METHOD'];

if ($path === 'articles.php' && $method === 'GET') {
    $category = $_GET['category'] ?? '';
    $search = $_GET['search'] ?? '';
    $sql = "SELECT * FROM care_articles WHERE 1=1";
    $params = [];
    if ($category) { $sql .= " AND category = ?"; $params[] = $category; }
    if ($search) { $sql .= " AND (title LIKE ? OR content LIKE ?)"; $params[] = "%$search%"; $params[] = "%$search%"; }
    $sql .= " ORDER BY created_at DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    respondSuccess($stmt->fetchAll());
}

elseif ($path === 'faqs.php' && $method === 'GET') {
    $stmt = $db->query("SELECT * FROM care_faqs ORDER BY sort_order");
    respondSuccess($stmt->fetchAll());
}

elseif ($path === 'shelter_logs.php' && $method === 'GET') {
    $user = requireAuth();
    $petId = intval($_GET['pet_id'] ?? 0);
    $stmt = $db->prepare("SELECT * FROM shelter_pet_care_logs WHERE pet_id = ? ORDER BY created_at DESC");
    $stmt->execute([$petId]);
    respondSuccess($stmt->fetchAll());
}

elseif ($path === 'add_log.php' && $method === 'POST') {
    $user = requireAuth();
    requireFields(['pet_id', 'type', 'title']);
    $stmt = $db->prepare("INSERT INTO shelter_pet_care_logs (pet_id, shelter_id, type, title, description, date) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([inputInt('pet_id'), $user['id'], input('type'), input('title'), input('description', ''), input('date', date('Y-m-d'))]);
    $id = $db->lastInsertId();
    $stmt = $db->prepare("SELECT * FROM shelter_pet_care_logs WHERE id = ?");
    $stmt->execute([$id]);
    respondSuccess($stmt->fetch(), 'Log added');
}

elseif ($path === 'delete_log.php' && ($method === 'DELETE' || $method === 'POST')) {
    $user = requireAuth();
    $id = intval($_GET['id'] ?? inputInt('id'));
    $stmt = $db->prepare("SELECT id FROM shelter_pet_care_logs WHERE id = ? AND shelter_id = ?");
    $stmt->execute([$id, $user['id']]);
    if (!$stmt->fetch()) respondForbidden('Not your log');
    $db->prepare("DELETE FROM shelter_pet_care_logs WHERE id = ?")->execute([$id]);
    respondSuccess(null, 'Log deleted');
}

else {
    respondError('Invalid endpoint');
}
