<?php
/**
 * Appointment endpoints:
 * GET  /api/appointments/list.php — List appointments (owner sees own, vet sees assigned)
 * POST /api/appointments/book.php — Book new appointment (owner)
 * POST /api/appointments/update_status.php — Update status (vet approve/reject/complete)
 * POST /api/appointments/cancel.php — Cancel appointment (owner)
 * POST /api/appointments/add_notes.php — Add diagnosis/treatment notes (vet)
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validate.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../middleware/role.php';

$user = requireAuth();
$db = getDB();
$path = basename($_SERVER['SCRIPT_NAME']);
$method = $_SERVER['REQUEST_METHOD'];

if ($path === 'list.php' && $method === 'GET') {
    $statusFilter = $_GET['status'] ?? '';
    if ($user['role'] === 'owner') {
        $sql = "SELECT a.*, u.full_name as vet_name, p.name as pet_name FROM appointments a LEFT JOIN users u ON a.vet_id = u.id LEFT JOIN pets p ON a.pet_id = p.id WHERE a.owner_id = ?";
        $params = [$user['id']];
        if ($statusFilter) { $sql .= " AND a.status = ?"; $params[] = $statusFilter; }
        $sql .= " ORDER BY a.date DESC, a.time DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
    } elseif ($user['role'] === 'vet') {
        $sql = "SELECT a.*, u.full_name as owner_name, p.name as pet_name, p.species as pet_species FROM appointments a LEFT JOIN users u ON a.owner_id = u.id LEFT JOIN pets p ON a.pet_id = p.id WHERE a.vet_id = ?";
        $params = [$user['id']];
        if ($statusFilter) { $sql .= " AND a.status = ?"; $params[] = $statusFilter; }
        $sql .= " ORDER BY a.date DESC, a.time DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
    } else {
        respondSuccess([]);
    }
    respondSuccess($stmt->fetchAll());
}

elseif ($path === 'book.php' && $method === 'POST') {
    requireRole('owner');
    requireFields(['vet_id', 'pet_id', 'date', 'time']);
    $stmt = $db->prepare("INSERT INTO appointments (owner_id, vet_id, pet_id, date, time, reason) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$user['id'], inputInt('vet_id'), inputInt('pet_id'), input('date'), input('time'), input('reason', '')]);
    $id = $db->lastInsertId();

    // Notify vet
    $petStmt = $db->prepare("SELECT name FROM pets WHERE id = ?");
    $petStmt->execute([inputInt('pet_id')]);
    $pet = $petStmt->fetch();
    $db->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'appointment')")->execute([
        inputInt('vet_id'), 'New Appointment Request',
        "{$user['name']} has requested an appointment for {$pet['name']} on " . input('date') . ' at ' . input('time')
    ]);

    $stmt = $db->prepare("SELECT * FROM appointments WHERE id = ?");
    $stmt->execute([$id]);
    respondSuccess($stmt->fetch(), 'Appointment booked');
}

elseif ($path === 'update_status.php' && $method === 'POST') {
    requireRole('vet');
    requireFields(['id', 'status']);
    $apptId = inputInt('id');
    $status = input('status');
    $stmt = $db->prepare("SELECT owner_id FROM appointments WHERE id = ? AND vet_id = ?");
    $stmt->execute([$apptId, $user['id']]);
    $appt = $stmt->fetch();
    if (!$appt) respondForbidden('Not your appointment');

    $db->prepare("UPDATE appointments SET status = ? WHERE id = ?")->execute([$status, $apptId]);

    // Notify owner
    $db->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'appointment')")->execute([
        $appt['owner_id'], 'Appointment ' . ucfirst($status),
        "Your appointment has been $status by the veterinarian."
    ]);

    respondSuccess(null, "Appointment $status");
}

elseif ($path === 'cancel.php' && $method === 'POST') {
    requireRole('owner');
    requireFields(['id']);
    $apptId = inputInt('id');
    $stmt = $db->prepare("SELECT vet_id FROM appointments WHERE id = ? AND owner_id = ?");
    $stmt->execute([$apptId, $user['id']]);
    $appt = $stmt->fetch();
    if (!$appt) respondForbidden('Not your appointment');

    $db->prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?")->execute([$apptId]);
    respondSuccess(null, 'Appointment cancelled');
}

elseif ($path === 'add_notes.php' && $method === 'POST') {
    requireRole('vet');
    requireFields(['id']);
    $apptId = inputInt('id');
    $stmt = $db->prepare("SELECT id FROM appointments WHERE id = ? AND vet_id = ?");
    $stmt->execute([$apptId, $user['id']]);
    if (!$stmt->fetch()) respondForbidden('Not your appointment');

    $db->prepare("UPDATE appointments SET diagnosis = ?, treatment_notes = ?, medication = ?, follow_up = ?, notes = ? WHERE id = ?")->execute([
        input('diagnosis', ''), input('treatment_notes', ''), input('medication', ''), input('follow_up', ''), input('notes', ''), $apptId
    ]);
    respondSuccess(null, 'Notes saved');
}

else {
    respondError('Invalid endpoint');
}
