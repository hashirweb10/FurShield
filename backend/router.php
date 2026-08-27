<?php
/**
 * Router for PHP built-in development server.
 * Usage: php -S localhost:8000 backend/router.php
 *
 * Maps /api/* requests to backend/api/* PHP files.
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Only handle /api/* routes
if (strpos($uri, '/api/') !== 0 && $uri !== '/api') {
    return false; // Let PHP built-in server handle static files
}

// Map /api/auth/login.php → backend/api/auth/login.php
$filePath = __DIR__ . $uri;

// Security: block directory traversal
if (strpos($uri, '..') !== false) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    return;
}

if (is_file($filePath) && pathinfo($filePath, PATHINFO_EXTENSION) === 'php') {
    require $filePath;
    return;
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['success' => false, 'message' => 'Endpoint not found: ' . $uri]);
