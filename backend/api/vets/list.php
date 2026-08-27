<?php
/**
 * Vet directory endpoints:
 * GET  /api/vets/list.php — Public vet directory (search/filter)
 * GET  /api/vets/profile.php?id= — Individual vet profile
 * GET  /api/vets/patients.php — Vet's patients (vet role)
 * POST /api/vets/add_record.php — Vet adds medical record for patient
 * GET  /api/vets/availability.php?id= — Vet's public availability
 * POST /api/vets/set_availability.php — Vet manages own availability
 * DELETE /api/vets/remove_slot.php — Vet removes availability slot
 * GET  /api/vets/my_appointments.php — Vet's own appointments
 * POST /api/vets/update_appointment.php — Vet approve/reject/complete appointment
 * GET  /api/vets/my_reviews.php — Vet's own reviews
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validate.php';
require_once __DIR__ . '/../../middleware/auth.php';

$db = getDB();
$path = basename($_SERVER['SCRIPT_NAME']);
$method = $_SERVER['REQUEST_METHOD'];

// Public vet directory
if ($path === 'list.php' && $method === 'GET') {
    $search = $_GET['search'] ?? '';
    $specialization = $_GET['specialization'] ?? '';
    $sql = "SELECT u.id, u.full_name, u.email, u.phone, u.address, vp.specialization, vp.experience, vp.qualifications, vp.rating, vp.total_reviews, vp.bio FROM users u JOIN vet_profiles vp ON u.id = vp.user_id WHERE u.role = 'vet' AND 1=1";
    $params = [];
    if ($search) {
        $sql .= " AND (u.full_name LIKE ? OR vp.specialization LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    if ($specialization) {
        $sql .= " AND vp.specialization = ?";
        $params[] = $specialization;
    }
    $sql .= " ORDER BY vp.rating DESC, vp.total_reviews DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    respondSuccess($stmt->fetchAll());
}

// Individual vet profile
elseif ($path === 'profile.php' && $method === 'GET') {
    $id = intval($_GET['id'] ?? 0);
    $stmt = $db->prepare("SELECT u.id, u.full_name, u.email, u.phone, u.address, vp.specialization, vp.experience, vp.qualifications, vp.rating, vp.total_reviews, vp.bio FROM users u JOIN vet_profiles vp ON u.id = vp.user_id WHERE u.id = ? AND u.role = 'vet'");
    $stmt->execute([$id]);
    $vet = $stmt->fetch();
    if (!$vet) respondNotFound('Veterinarian not found');

    // Get specializations
    $stmt = $db->prepare("SELECT specialization FROM vet_specializations WHERE vet_id = ?");
    $stmt->execute([$id]);
    $vet['specializations'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Get availability
    $stmt = $db->prepare("SELECT * FROM vet_availability WHERE vet_id = ? AND available_date >= CURDATE() ORDER BY available_date, start_time");
    $stmt->execute([$id]);
    $vet['availability'] = $stmt->fetchAll();

    respondSuccess($vet);
}

// Vet's patients (from completed/confirmed appointments)
elseif ($path === 'patients.php' && $method === 'GET') {
    $user = requireAuth();
    $stmt = $db->prepare("SELECT DISTINCT p.*, u.full_name as owner_name, u.email as owner_email, u.phone as owner_phone FROM pets p JOIN appointments a ON p.id = a.pet_id JOIN users u ON p.owner_id = u.id WHERE a.vet_id = ? AND a.status IN ('approved','completed') ORDER BY p.name");
    $stmt->execute([$user['id']]);
    respondSuccess($stmt->fetchAll());
}

// Vet adds medical record for a patient
elseif ($path === 'add_record.php' && $method === 'POST') {
    $user = requireAuth();
    requireFields(['pet_id', 'type', 'title']);

    // Verify this pet is a patient of this vet
    $stmt = $db->prepare("SELECT id FROM appointments WHERE vet_id = ? AND pet_id = ? AND status IN ('approved','completed')");
    $stmt->execute([$user['id'], inputInt('pet_id')]);
    if (!$stmt->fetch()) respondForbidden('This pet is not your patient');

    $stmt = $db->prepare("INSERT INTO health_records (pet_id, vet_id, type, title, description, date) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([inputInt('pet_id'), $user['id'], input('type'), input('title'), input('description', ''), input('date', date('Y-m-d'))]);
    $recordId = $db->lastInsertId();

    // If treatment is included
    if (input('treatment')) {
        $db->prepare("INSERT INTO treatments (health_record_id, name, description, dosage, duration) VALUES (?, ?, ?, ?, ?)")->execute([
            $recordId, input('treatment'), input('treatment_description', ''), input('dosage', ''), input('duration', '')
        ]);
    }

    // If vaccination
    if (input('vaccine_name')) {
        $db->prepare("INSERT INTO vaccinations (pet_id, vet_id, vaccine_name, date_given, next_due_date) VALUES (?, ?, ?, ?, ?)")->execute([
            inputInt('pet_id'), $user['id'], input('vaccine_name'), input('date', date('Y-m-d')), input('next_due_date', null)
        ]);
    }

    respondSuccess(['id' => $recordId], 'Record added');
}

// Public availability for a vet
elseif ($path === 'availability.php' && $method === 'GET') {
    $vetId = intval($_GET['id'] ?? 0);
    $stmt = $db->prepare("SELECT * FROM vet_availability WHERE vet_id = ? AND is_booked = 0 AND available_date >= CURDATE() ORDER BY available_date, start_time");
    $stmt->execute([$vetId]);
    respondSuccess($stmt->fetchAll());
}

// Vet manages availability
// Vet's own availability (GET) and add slot (POST)
elseif ($path === 'set_availability.php' && $method === 'GET') {
    $user = requireAuth();
    $stmt = $db->prepare("SELECT * FROM vet_availability WHERE vet_id = ? ORDER BY available_date, start_time");
    $stmt->execute([$user['id']]);
    respondSuccess($stmt->fetchAll());
}

elseif ($path === 'set_availability.php' && $method === 'POST') {
    $user = requireAuth();
    requireFields(['available_date', 'start_time', 'end_time']);
    $stmt = $db->prepare("INSERT INTO vet_availability (vet_id, available_date, start_time, end_time) VALUES (?, ?, ?, ?)");
    $stmt->execute([$user['id'], input('available_date'), input('start_time'), input('end_time')]);
    respondSuccess(['id' => $db->lastInsertId()], 'Availability added');
}

// Vet removes availability slot
elseif ($path === 'remove_slot.php' && ($method === 'DELETE' || $method === 'POST')) {
    $user = requireAuth();
    $slotId = intval($_GET['id'] ?? inputInt('id'));
    $stmt = $db->prepare("SELECT id FROM vet_availability WHERE id = ? AND vet_id = ? AND is_booked = 0");
    $stmt->execute([$slotId, $user['id']]);
    if (!$stmt->fetch()) respondError('Slot not found or already booked');
    $db->prepare("DELETE FROM vet_availability WHERE id = ?")->execute([$slotId]);
    respondSuccess(null, 'Slot removed');
}

// Vet's own appointments
elseif ($path === 'my_appointments.php' && $method === 'GET') {
    $user = requireAuth();
    $status = $_GET['status'] ?? '';
    $sql = "SELECT a.*, p.name as pet_name, p.species as pet_species, p.breed, u.full_name as owner_name, u.email as owner_email, u.phone as owner_phone FROM appointments a LEFT JOIN pets p ON a.pet_id = p.id LEFT JOIN users u ON p.owner_id = u.id WHERE a.vet_id = ?";
    $params = [$user['id']];
    if ($status) { $sql .= " AND a.status = ?"; $params[] = $status; }
    $sql .= " ORDER BY a.date DESC, a.time DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    respondSuccess($stmt->fetchAll());
}

// Vet updates appointment status
elseif ($path === 'update_appointment.php' && $method === 'POST') {
    $user = requireAuth();
    requireFields(['id', 'status']);
    $appId = inputInt('id');
    $status = input('status');

    // Verify ownership
    $stmt = $db->prepare("SELECT a.*, p.owner_id FROM appointments a JOIN pets p ON a.pet_id = p.id WHERE a.id = ? AND a.vet_id = ?");
    $stmt->execute([$appId, $user['id']]);
    $appt = $stmt->fetch();
    if (!$appt) respondForbidden('Not your appointment');

    $db->prepare("UPDATE appointments SET status = ? WHERE id = ?")->execute([$status, $appId]);

    // Notify owner
    $db->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'appointment')")->execute([
        $appt['owner_id'],
        'Appointment ' . ucfirst($status),
        "Your appointment has been $status."
    ]);

    respondSuccess(null, "Appointment $status");
}

// Vet's own reviews
elseif ($path === 'my_reviews.php' && $method === 'GET') {
    $user = requireAuth();
    $stmt = $db->prepare("SELECT r.*, u.full_name as reviewer_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.target_type = 'vet' AND r.target_id = ? ORDER BY r.created_at DESC");
    $stmt->execute([$user['id']]);
    $reviews = $stmt->fetchAll();
    $avg = 0;
    if (count($reviews) > 0) {
        $avg = round(array_sum(array_column($reviews, 'rating')) / count($reviews), 1);
    }
    respondSuccess(['reviews' => $reviews, 'average' => $avg, 'count' => count($reviews)]);
}

else {
    respondError('Invalid endpoint');
}
