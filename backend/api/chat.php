<?php
/**
 * FurShield AI Chat Endpoint
 *
 * POST /api/chat.php
 *
 * Requires:
 * - Logged-in user
 * - message in POST body
 * - GEMINI_API_KEY in backend/.env
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validate.php';
require_once __DIR__ . '/../middleware/auth.php';


/*
|--------------------------------------------------------------------------
| Only POST requests
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('Method not allowed', 405);
}


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

$user = requireAuth();


/*
|--------------------------------------------------------------------------
| Validate message
|--------------------------------------------------------------------------
*/

requireFields(['message']);

$message = trim(inputRaw('message'));

if ($message === '') {
    respondError('Message is required.', 400);
}


/*
|--------------------------------------------------------------------------
| Gemini API Key
|--------------------------------------------------------------------------
*/

$apiKey = trim(env('GEMINI_API_KEY', ''));

if ($apiKey === '') {
    respondError('Gemini API key is not configured.', 500);
}


/*
|--------------------------------------------------------------------------
| FurShield AI System Prompt
|--------------------------------------------------------------------------
*/

$systemPrompt = <<<PROMPT
You are the FurShield Care Assistant — a friendly, knowledgeable and
professional pet-care AI assistant.

FurShield is a premium pet-care ecosystem connecting:
- Pet Owners
- Veterinarians
- Animal Shelters

Help users with:
- Pet nutrition
- Grooming
- Vaccinations
- Exercise
- Training
- General pet wellbeing
- Basic responsible pet care
- Preparing for veterinarian visits
- Understanding common pet-care concerns

Important safety rules:
- Never claim to be a veterinarian.
- Do not diagnose serious medical conditions.
- Do not prescribe prescription medication.
- Do not recommend dangerous treatments.
- For emergencies or serious symptoms, recommend contacting a qualified
  veterinarian immediately.
- If a pet has difficulty breathing, severe bleeding, poisoning,
  seizures, collapse, unconsciousness, or another obvious emergency,
  tell the owner to seek emergency veterinary care immediately.
- Keep answers concise, practical and easy to understand.
- Be warm, supportive and professional.
- Do not unnecessarily scare the user.
- When appropriate, ask a short follow-up question to better understand
  the pet's situation.

You represent FurShield.
PROMPT;


/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

$db = getDB();


/*
|--------------------------------------------------------------------------
| Get recent conversation history
|--------------------------------------------------------------------------
*/

$stmt = $db->prepare("
    SELECT role, message
    FROM chat_messages
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 10
");

$stmt->execute([$user['id']]);

$history = array_reverse($stmt->fetchAll());


/*
|--------------------------------------------------------------------------
| Build Gemini conversation
|--------------------------------------------------------------------------
*/

$contents = [];


/*
| Add previous messages
*/

foreach ($history as $msg) {

    $text = trim($msg['message']);

    if ($text === '') {
        continue;
    }

    $role = ($msg['role'] === 'assistant')
        ? 'model'
        : 'user';

    $contents[] = [
        'role' => $role,
        'parts' => [
            [
                'text' => $text
            ]
        ]
    ];
}


/*
| Add current message
*/

$contents[] = [
    'role' => 'user',
    'parts' => [
        [
            'text' => $message
        ]
    ]
];


/*
|--------------------------------------------------------------------------
| Gemini Request Payload
|--------------------------------------------------------------------------
*/

$payload = [
    'system_instruction' => [
        'parts' => [
            [
                'text' => $systemPrompt
            ]
        ]
    ],

    'contents' => $contents,

    'generationConfig' => [
        'temperature' => 0.7,
        'maxOutputTokens' => 1024
    ]
];


$jsonPayload = json_encode(
    $payload,
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);


if ($jsonPayload === false) {
    respondError('Failed to prepare AI request.', 500);
}


/*
|--------------------------------------------------------------------------
| Gemini API Endpoint
|--------------------------------------------------------------------------
*/

$endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/' .
    'gemini-3.6-flash:generateContent';


/*
|--------------------------------------------------------------------------
| CURL Request
|--------------------------------------------------------------------------
*/

$ch = curl_init($endpoint);

curl_setopt_array($ch, [

    CURLOPT_POST => true,

    CURLOPT_POSTFIELDS => $jsonPayload,

    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-goog-api-key: ' . $apiKey
    ],

    CURLOPT_RETURNTRANSFER => true,

    CURLOPT_TIMEOUT => 60,

    CURLOPT_CONNECTTIMEOUT => 15,

    CURLOPT_SSL_VERIFYPEER => true,

    CURLOPT_SSL_VERIFYHOST => 2
]);


$response = curl_exec($ch);

$curlError = curl_error($ch);

$curlErrno = curl_errno($ch);

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);


/*
|--------------------------------------------------------------------------
| CURL / Internet Connection Error
|--------------------------------------------------------------------------
*/

if ($response === false || $curlErrno !== 0) {

    error_log(
        'FurShield Gemini CURL Error [' .
        $curlErrno .
        ']: ' .
        $curlError
    );

    $reply =
        "I'm having trouble connecting to the FurShield AI right now. " .
        "Please check your internet connection and try again.";
}


/*
|--------------------------------------------------------------------------
| Gemini HTTP Error
|--------------------------------------------------------------------------
*/

elseif ($httpCode < 200 || $httpCode >= 300) {

    $errorData = json_decode($response, true);

    $errorMessage =
        $errorData['error']['message']
        ?? 'Unknown Gemini API error.';

    error_log("========== FURSHIELD GEMINI DEBUG ==========");
    error_log("HTTP CODE: " . $httpCode);
    error_log("CURL ERROR: " . $curlError);
    error_log("RESPONSE: " . $response);
    error_log("============================================");

    error_log(
        'FurShield Gemini API Error | HTTP: ' .
        $httpCode .
        ' | Message: ' .
        $errorMessage
    );


    /*
    | User-friendly responses
    */

    if ($httpCode === 400) {

        $reply =
            "The FurShield AI request was not accepted. " .
            "Please try asking your question in a different way.";

    } elseif ($httpCode === 401 || $httpCode === 403) {

        $reply =
            "The FurShield AI API key could not be authenticated. " .
            "Please check the Gemini API configuration.";

    } elseif ($httpCode === 404) {

        $reply =
            "The selected FurShield AI model is currently unavailable. " .
            "Please check the Gemini model configuration.";

    } elseif ($httpCode === 429) {

        $reply =
            "The FurShield AI is temporarily busy or the API limit " .
            "has been reached. Please try again shortly.";

    } else {

        $reply =
            "I'm having trouble connecting to the FurShield AI right now. " .
            "Please try again in a moment.";
    }
}


/*
|--------------------------------------------------------------------------
| Successful Gemini Response
|--------------------------------------------------------------------------
*/

else {

    $data = json_decode($response, true);


    /*
    | Check for Gemini-generated text
    */

    $reply =
        $data['candidates'][0]['content']['parts'][0]['text']
        ?? null;


    /*
    | If Gemini did not return normal text
    */

    if (!$reply) {

        error_log(
            'FurShield Gemini Unexpected Response: ' .
            $response
        );

        $reply =
            "I'm sorry, I couldn't process that question. " .
            "Could you try asking it another way?";
    }
}


/*
|--------------------------------------------------------------------------
| Save Assistant Response
|--------------------------------------------------------------------------
*/

$db->prepare("
    INSERT INTO chat_messages (user_id, role, message)
    VALUES (?, 'assistant', ?)
")->execute([
    $user['id'],
    $reply
]);


/*
|--------------------------------------------------------------------------
| Return JSON Response
|--------------------------------------------------------------------------
*/

respondSuccess([
    'reply' => $reply
]);