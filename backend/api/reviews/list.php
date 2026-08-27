<?php
/**
 * Review endpoints:
 * GET  /api/reviews/list.php?target_type=vet&target_id=3 — List reviews
 * POST /api/reviews/create.php — Create review
 * GET  /api/reviews/my_reviews.php — User's own reviews
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validate.php';
require_once __DIR__ . '/../../middleware/auth.php';

$db = getDB();
$path = basename($_SERVER['SCRIPT_NAME']);
$method = $_SERVER['REQUEST_METHOD'];

if ($path === 'list.php' && $method === 'GET') {
    $targetType = $_GET['target_type'] ?? '';
    $targetId = intval($_GET['target_id'] ?? 0);
    if (!$targetType || !$targetId) respondError('target_type and target_id required');

    $stmt = $db->prepare("SELECT r.*, u.full_name as reviewer_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.target_type = ? AND r.target_id = ? ORDER BY r.created_at DESC");
    $stmt->execute([$targetType, $targetId]);
    $reviews = $stmt->fetchAll();

    // Calculate average
    $avg = 0;
    if (count($reviews) > 0) {
        $avg = round(array_sum(array_column($reviews, 'rating')) / count($reviews), 1);
    }
    respondSuccess(['reviews' => $reviews, 'average' => $avg, 'count' => count($reviews)]);
}

elseif ($path === 'create.php' && $method === 'POST') {
    $user = requireAuth();
    requireFields(['target_type', 'target_id', 'rating']);
    $rating = inputInt('rating');
    if ($rating < 1 || $rating > 5) respondError('Rating must be 1-5');

    $targetType = input('target_type');
    $targetId = inputInt('target_id');

    // Check for existing review
    $stmt = $db->prepare("SELECT id FROM reviews WHERE user_id = ? AND target_type = ? AND target_id = ?");
    $stmt->execute([$user['id'], $targetType, $targetId]);
    if ($stmt->fetch()) respondError('You have already reviewed this');

    $stmt = $db->prepare("INSERT INTO reviews (user_id, target_type, target_id, rating, comment) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$user['id'], $targetType, $targetId, $rating, input('comment', '')]);

    // Update aggregate rating
    $stmt = $db->prepare("SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE target_type = ? AND target_id = ?");
    $stmt->execute([$targetType, $targetId]);
    $stats = $stmt->fetch();

    if ($targetType === 'vet') {
        $db->prepare("UPDATE vet_profiles SET rating = ?, total_reviews = ? WHERE user_id = ?")->execute([$stats['avg'], $stats['cnt'], $targetId]);
    } elseif ($targetType === 'product') {
        $db->prepare("UPDATE products SET rating = ?, total_reviews = ? WHERE id = ?")->execute([$stats['avg'], $stats['cnt'], $targetId]);
    }

    respondSuccess(null, 'Review submitted');
}

elseif ($path === 'my_reviews.php' && $method === 'GET') {
    $user = requireAuth();
    $stmt = $db->prepare("SELECT r.*, CASE WHEN r.target_type = 'vet' THEN (SELECT full_name FROM users WHERE id = r.target_id) WHEN r.target_type = 'product' THEN (SELECT name FROM products WHERE id = r.target_id) ELSE (SELECT full_name FROM users WHERE id = r.target_id) END as target_name FROM reviews r WHERE r.user_id = ? ORDER BY r.created_at DESC");
    $stmt->execute([$user['id']]);
    respondSuccess($stmt->fetchAll());
}

else {
    respondError('Invalid endpoint');
}
