<?php
/**
 * CORS Headers for React Frontend
 */
require_once __DIR__ . '/env.php';

$frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

header("Access-Control-Allow-Origin: $frontendUrl");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
