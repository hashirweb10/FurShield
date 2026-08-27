<?php
/**
 * Notification endpoints:
 * GET  /api/notifications/list.php — List user's notifications
 * POST /api/notifications/read.php — Mark notification as read
 * POST /api/notifications/read_all.php — Mark all as read
 * GET  /api/notifications/unread_count.php — Get unread count
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

if ($path === 'list.php' && $method === 'GET') {
    $stmt = $db->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50");
    $stmt->execute([$user['id']]);
    respondSuccess($stmt->fetchAll());
}

elseif ($path === 'unread_count.php' && $method === 'GET') {
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0");
    $stmt->execute([$user['id']]);
    respondSuccess($stmt->fetch());
}

elseif ($path === 'read.php' && $method === 'POST') {
    $id = inputInt('id');
    $db->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?")->execute([$id, $user['id']]);
    respondSuccess(null, 'Marked as read');
}

elseif ($path === 'read_all.php' && $method === 'POST') {
    $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0")->execute([$user['id']]);
    respondSuccess(null, 'All marked as read');
}

else {
    respondError('Invalid endpoint');
}
