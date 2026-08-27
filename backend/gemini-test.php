<?php

require_once __DIR__ . '/config/env.php';

header('Content-Type: application/json');

$apiKey = trim(env('GEMINI_API_KEY', ''));

if (!$apiKey) {
    echo json_encode([
        'success' => false,
        'error' => 'GEMINI_API_KEY is missing from .env'
    ], JSON_PRETTY_PRINT);
    exit;
}

$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

$payload = [
    'contents' => [
        [
            'parts' => [
                [
                    'text' => 'Say hello to FurShield in one short sentence.'
                ]
            ]
        ]
    ]
];

$ch = curl_init($url);

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-goog-api-key: ' . $apiKey
    ],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 10
]);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

echo json_encode([
    'success' => ($httpCode >= 200 && $httpCode < 300),
    'http_code' => $httpCode,
    'curl_error' => $curlError,
    'gemini_response' => json_decode($response, true)
], JSON_PRETTY_PRINT);