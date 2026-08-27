<?php
/**
 * Parse .env file and load variables into $_ENV and environment.
 */
function loadEnv($path = null) {
    if ($path === null) {
        $path = __DIR__ . '/../.env';
    }

    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        $line = trim($line);

        // Skip comments
        if (strpos($line, '#') === 0) {
            continue;
        }

        // Skip non-assignment lines
        if (strpos($line, '=') === false) {
            continue;
        }

        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        // Remove quotes
        if (preg_match('/^["\'](.*)["\']$/', $value, $matches)) {
            $value = $matches[1];
        }

        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

/**
 * Get an env value with optional default.
 */
function env($key, $default = null) {
    $value = $_ENV[$key] ?? getenv($key);
    return $value !== false ? $value : $default;
}

// Auto-load on include
loadEnv();
