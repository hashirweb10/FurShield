<?php
/**
 * Cart endpoints:
 * GET  /api/cart/list.php — Get cart items
 * POST /api/cart/add.php — Add item to cart
 * POST /api/cart/update_quantity.php — Update item quantity
 * DELETE /api/cart/remove.php — Remove item
 * POST /api/cart/clear.php — Clear cart
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validate.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = requireAuth();
$db = getDB();
$path = basename($_SERVER['SCRIPT_NAME']);
$method = $_SERVER['REQUEST_METHOD'];

// Ensure cart exists
$stmt = $db->prepare("SELECT id FROM cart WHERE user_id = ?");
$stmt->execute([$user['id']]);
$cart = $stmt->fetch();
if (!$cart) {
    $db->prepare("INSERT INTO cart (user_id) VALUES (?)")->execute([$user['id']]);
    $cartId = $db->lastInsertId();
} else {
    $cartId = $cart['id'];
}

if ($path === 'list.php' && $method === 'GET') {
    $stmt = $db->prepare("SELECT ci.*, p.name, p.price, p.image, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?");
    $stmt->execute([$cartId]);
    respondSuccess($stmt->fetchAll());
}

elseif ($path === 'add.php' && $method === 'POST') {
    requireFields(['product_id']);
    $productId = inputInt('product_id');
    $qty = inputInt('quantity') ?: 1;

    // Check if already in cart
    $stmt = $db->prepare("SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?");
    $stmt->execute([$cartId, $productId]);
    $existing = $stmt->fetch();

    if ($existing) {
        $db->prepare("UPDATE cart_items SET quantity = quantity + ? WHERE id = ?")->execute([$qty, $existing['id']]);
    } else {
        $db->prepare("INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)")->execute([$cartId, $productId, $qty]);
    }
    respondSuccess(null, 'Added to cart');
}

elseif ($path === 'update_quantity.php' && $method === 'POST') {
    requireFields(['item_id', 'quantity']);
    $qty = inputInt('quantity');
    if ($qty < 1) $qty = 1;
    $db->prepare("UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?")->execute([$qty, inputInt('item_id'), $cartId]);
    respondSuccess(null, 'Quantity updated');
}

elseif ($path === 'remove.php' && ($method === 'DELETE' || $method === 'POST')) {
    $itemId = intval($_GET['id'] ?? inputInt('item_id'));
    $db->prepare("DELETE FROM cart_items WHERE id = ? AND cart_id = ?")->execute([$itemId, $cartId]);
    respondSuccess(null, 'Removed from cart');
}

elseif ($path === 'clear.php' && $method === 'POST') {
    $db->prepare("DELETE FROM cart_items WHERE cart_id = ?")->execute([$cartId]);
    respondSuccess(null, 'Cart cleared');
}

else {
    respondError('Invalid endpoint');
}
