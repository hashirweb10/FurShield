<?php
/**
 * Adoption endpoints:
 * GET  /api/adoption/listings.php — Public adoption listings
 * GET  /api/adoption/shelter_listings.php — Shelter's own listings
 * POST /api/adoption/create_listing.php — Create listing (shelter)
 * POST /api/adoption/update_listing.php — Update listing (shelter)
 * DELETE /api/adoption/delete_listing.php — Delete listing (shelter)
 * GET  /api/adoption/shelter_applications.php — Shelter's applications
 * POST /api/adoption/apply.php — Submit adoption application (owner)
 * POST /api/adoption/update_application.php — Approve/reject application (shelter)
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validate.php';
require_once __DIR__ . '/../../middleware/auth.php';

$db = getDB();
$path = basename($_SERVER['SCRIPT_NAME']);
$method = $_SERVER['REQUEST_METHOD'];

// Public listings
if ($path === 'listings.php' && $method === 'GET') {
    $status = $_GET['status'] ?? '';
    $sql = "SELECT al.*, u.full_name as shelter_name FROM adoption_listings al LEFT JOIN users u ON al.shelter_id = u.id WHERE 1=1";
    $params = [];
    if ($status) { $sql .= " AND al.adoption_status = ?"; $params[] = $status; }
    $sql .= " ORDER BY al.created_at DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    respondSuccess($stmt->fetchAll());
}

// Shelter's own listings
elseif ($path === 'shelter_listings.php' && $method === 'GET') {
    $user = requireAuth();
    $stmt = $db->prepare("SELECT * FROM adoption_listings WHERE shelter_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user['id']]);
    respondSuccess($stmt->fetchAll());
}

// Create listing
elseif ($path === 'create_listing.php' && $method === 'POST') {
    $user = requireAuth();
    requireFields(['name', 'species']);
    $image = uploadFile('image');
    $stmt = $db->prepare("INSERT INTO adoption_listings (shelter_id, name, species, breed, age, gender, health_status, description, image, adoption_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$user['id'], input('name'), input('species'), input('breed', ''), input('age', ''), input('gender', 'Male'), input('health_status', 'Healthy'), input('description', ''), $image, input('adoption_status', 'available')]);
    respondSuccess(['id' => $db->lastInsertId()], 'Listing created');
}

// Update listing
elseif ($path === 'update_listing.php' && $method === 'POST') {
    $user = requireAuth();
    requireFields(['id']);
    $id = inputInt('id');
    $stmt = $db->prepare("SELECT id FROM adoption_listings WHERE id = ? AND shelter_id = ?");
    $stmt->execute([$id, $user['id']]);
    if (!$stmt->fetch()) respondForbidden('Not your listing');

    $image = uploadFile('image');
    if ($image) {
        $db->prepare("UPDATE adoption_listings SET name=?, species=?, breed=?, age=?, gender=?, health_status=?, description=?, image=?, adoption_status=? WHERE id=?")->execute([
            input('name'), input('species'), input('breed', ''), input('age', ''), input('gender', 'Male'), input('health_status', 'Healthy'), input('description', ''), $image, input('adoption_status', 'available'), $id
        ]);
    } else {
        $db->prepare("UPDATE adoption_listings SET name=?, species=?, breed=?, age=?, gender=?, health_status=?, description=?, adoption_status=? WHERE id=?")->execute([
            input('name'), input('species'), input('breed', ''), input('age', ''), input('gender', 'Male'), input('health_status', 'Healthy'), input('description', ''), input('adoption_status', 'available'), $id
        ]);
    }
    respondSuccess(null, 'Listing updated');
}

// Delete listing
elseif ($path === 'delete_listing.php' && ($method === 'DELETE' || $method === 'POST')) {
    $user = requireAuth();
    $id = intval($_GET['id'] ?? inputInt('id'));
    $stmt = $db->prepare("SELECT id FROM adoption_listings WHERE id = ? AND shelter_id = ?");
    $stmt->execute([$id, $user['id']]);
    if (!$stmt->fetch()) respondForbidden('Not your listing');
    $db->prepare("DELETE FROM adoption_listings WHERE id = ?")->execute([$id]);
    respondSuccess(null, 'Listing deleted');
}

// Shelter's applications
elseif ($path === 'shelter_applications.php' && $method === 'GET') {
    $user = requireAuth();
    $stmt = $db->prepare("SELECT aa.*, al.name as pet_name, u.full_name as applicant_name, u.email as applicant_email FROM adoption_applications aa JOIN adoption_listings al ON aa.listing_id = al.id JOIN users u ON aa.applicant_id = u.id WHERE al.shelter_id = ? ORDER BY aa.created_at DESC");
    $stmt->execute([$user['id']]);
    respondSuccess($stmt->fetchAll());
}

// Owner's applications
elseif ($path === 'my_applications.php' && $method === 'GET') {
    $user = requireAuth();
    $stmt = $db->prepare("SELECT aa.*, al.name as pet_name, al.image FROM adoption_applications aa JOIN adoption_listings al ON aa.listing_id = al.id WHERE aa.applicant_id = ? ORDER BY aa.created_at DESC");
    $stmt->execute([$user['id']]);
    respondSuccess($stmt->fetchAll());
}

// Apply for adoption
elseif ($path === 'apply.php' && $method === 'POST') {
    $user = requireAuth();
    requireFields(['listing_id']);
    $listingId = inputInt('listing_id');
    $stmt = $db->prepare("INSERT INTO adoption_applications (listing_id, applicant_id, reason) VALUES (?, ?, ?)");
    $stmt->execute([$listingId, $user['id'], input('reason', '')]);

    // Notify shelter
    $stmt = $db->prepare("SELECT shelter_id FROM adoption_listings WHERE id = ?");
    $stmt->execute([$listingId]);
    $listing = $stmt->fetch();
    if ($listing) {
        $db->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'New Adoption Application', ?, 'adoption')")->execute([$listing['shelter_id'], "{$user['name']} has applied to adopt a pet."]);
    }
    respondSuccess(null, 'Application submitted');
}

// Update application status
elseif ($path === 'update_application.php' && $method === 'POST') {
    $user = requireAuth();
    requireFields(['id', 'status']);
    $appId = inputInt('id');
    $status = input('status');

    $stmt = $db->prepare("SELECT aa.*, al.shelter_id FROM adoption_applications aa JOIN adoption_listings al ON aa.listing_id = al.id WHERE aa.id = ? AND al.shelter_id = ?");
    $stmt->execute([$appId, $user['id']]);
    if (!$stmt->fetch()) respondForbidden('Not your application');

    $db->prepare("UPDATE adoption_applications SET status = ? WHERE id = ?")->execute([$status, $appId]);

    // Notify applicant
    $db->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'adoption')")->execute([
        $stmt->fetchColumn() ?? 0, 'Application ' . ucfirst($status), "Your adoption application has been $status."
    ]);

    respondSuccess(null, "Application $status");
}

// Application message
elseif ($path === 'application_message.php' && $method === 'POST') {
    $user = requireAuth();
    requireFields(['application_id', 'message']);
    $db->prepare("INSERT INTO adoption_messages (application_id, sender_id, message) VALUES (?, ?, ?)")->execute([inputInt('application_id'), $user['id'], input('message')]);
    respondSuccess(null, 'Message sent');
}

else {
    respondError('Invalid endpoint');
}
