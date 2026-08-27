<?php
/**
 * Standardized JSON Response Helper
 */

function respond($success, $message = '', $data = null, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

function respondSuccess($data = null, $message = 'Success') {
    respond(true, $message, $data, 200);
}

function respondError($message = 'An error occurred', $code = 400) {
    respond(false, $message, null, $code);
}

function respondNotFound($message = 'Resource not found') {
    respond(false, $message, null, 404);
}

function respondUnauthorized($message = 'Unauthorized') {
    respond(false, $message, null, 401);
}

function respondForbidden($message = 'Forbidden') {
    respond(false, $message, null, 403);
}
