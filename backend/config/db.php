<?php
/**
 * PDO Database Connection
 */
require_once __DIR__ . '/env.php';

function getDB() {
    static $pdo = null;

    if ($pdo === null) {
        $host = env('DB_HOST', 'localhost');
        $dbname = env('DB_NAME', 'furshield');
        $user = env('DB_USER', 'root');
        $pass = env('DB_PASS', '');

        $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";

        try {
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed',
                'data' => null
            ]);
            exit;
        }
    }

    return $pdo;
}
