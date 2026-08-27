<?php
/**
 * POST /api/auth/logout.php
 * Destroy session and log out.
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('Method not allowed', 405);
}

session_unset();
session_destroy();

respondSuccess(null, 'Logged out successfully');
