<?php
/**
 * Input Validation & Sanitization Helpers
 */

/**
 * Get and sanitize a JSON request field.
 */
function input($key, $default = null) {
    static $jsonBody = null;

    if ($jsonBody === null) {
        $raw = file_get_contents('php://input');
        $jsonBody = json_decode($raw, true) ?? [];
    }

    // Check JSON body first, then $_POST, then $_GET
    if (isset($jsonBody[$key])) {
        return sanitize($jsonBody[$key]);
    }
    if (isset($_POST[$key])) {
        return sanitize($_POST[$key]);
    }
    if (isset($_GET[$key])) {
        return sanitize($_GET[$key]);
    }

    return $default;
}

/**
 * Get raw input (without sanitization) for trusted fields.
 */
function inputRaw($key, $default = null) {
    static $jsonBody = null;

    if ($jsonBody === null) {
        $raw = file_get_contents('php://input');
        $jsonBody = json_decode($raw, true) ?? [];
    }

    return $jsonBody[$key] ?? $_POST[$key] ?? $_GET[$key] ?? $default;
}

/**
 * Sanitize a string value.
 */
function sanitize($value) {
    if (is_string($value)) {
        return trim(htmlspecialchars($value, ENT_QUOTES, 'UTF-8'));
    }
    if (is_array($value)) {
        return array_map('sanitize', $value);
    }
    return $value;
}

/**
 * Validate email format.
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate required fields.
 */
function requireFields($fields) {
    foreach ($fields as $field) {
        $value = input($field);
        if ($value === null || $value === '') {
            respondError("Missing required field: $field");
        }
    }
}

/**
 * Validate integer.
 */
function inputInt($key, $default = 0) {
    $value = input($key, $default);
    return intval($value);
}

/**
 * Handle file upload with validation.
 */
function uploadFile($fieldName, $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], $maxSize = 5242880) {
    if (!isset($_FILES[$fieldName]) || $_FILES[$fieldName]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    $file = $_FILES[$fieldName];

    // Validate size
    if ($file['size'] > $maxSize) {
        respondError('File too large. Maximum size: ' . ($maxSize / 1048576) . 'MB');
    }

    // Validate MIME type
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);

    if (!in_array($mimeType, $allowedTypes)) {
        respondError('Invalid file type. Allowed: ' . implode(', ', $allowedTypes));
    }

    // Generate unique filename
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('fs_', true) . '.' . $ext;

    $uploadDir = __DIR__ . '/../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $destination = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        respondError('Failed to upload file');
    }

    return $filename;
}
