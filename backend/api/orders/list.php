<?php
/**
 * Order endpoints:
 * GET  /api/orders/list.php — List user's orders
 * POST /api/orders/place.php — Place order from cart
 * GET  /api/orders/detail.php?id= — Get order detail with items
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

if ($path === 'list.php' && $method === 'GET') {
    $stmt = $db->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user['id']]);
    respondSuccess($stmt->fetchAll());
}

elseif ($path === 'detail.php' && $method === 'GET') {
    $id = intval($_GET['id'] ?? 0);
    $stmt = $db->prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $user['id']]);
    $order = $stmt->fetch();
    if (!$order) respondNotFound('Order not found');

    $stmt = $db->prepare("SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
    $stmt->execute([$id]);
    $order['items'] = $stmt->fetchAll();
    respondSuccess($order);
}

elseif ($path === 'place.php' && $method === 'POST') {
    // Get cart
    $stmt = $db->prepare("SELECT id FROM cart WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $cart = $stmt->fetch();
    if (!$cart) respondError('Cart is empty');

    $stmt = $db->prepare("SELECT ci.*, p.name, p.price, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?");
    $stmt->execute([$cart['id']]);
    $items = $stmt->fetchAll();

    if (empty($items)) respondError('Cart is empty');

    // Calculate total
    $total = 0;
    foreach ($items as $item) {
        $total += $item['price'] * $item['quantity'];
    }

    // Create order
    $address = input('shipping_address', $user['id']);
    $stmt = $db->prepare("INSERT INTO orders (user_id, total, shipping_address) VALUES (?, ?, ?)");
    $stmt->execute([$user['id'], $total, $address]);
    $orderId = $db->lastInsertId();

    // Create order items
    $stmtItems = $db->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($items as $item) {
        $stmtItems->execute([$orderId, $item['product_id'], $item['quantity'], $item['price']]);
    }

    // Clear cart
    $db->prepare("DELETE FROM cart_items WHERE cart_id = ?")->execute([$cart['id']]);

    // Notify
    $db->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Order Placed', 'Your order #? has been placed successfully.', 'order')")->execute([$user['id'], $orderId]);

    respondSuccess(['order_id' => $orderId, 'total' => $total], 'Order placed successfully');
}

else {
    respondError('Invalid endpoint');
}
