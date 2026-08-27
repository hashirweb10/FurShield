<?php
/**
 * Product endpoints:
 * GET /api/products/list.php — List all products (with optional search, category, sort)
 * GET /api/products/detail.php?id= — Get single product
 * GET /api/products/categories.php — List categories
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../helpers/response.php';

$db = getDB();
$path = basename($_SERVER['SCRIPT_NAME']);
$method = $_SERVER['REQUEST_METHOD'];

if ($path === 'categories.php' && $method === 'GET') {
    $stmt = $db->query("SELECT * FROM product_categories ORDER BY name");
    respondSuccess($stmt->fetchAll());
}

elseif ($path === 'detail.php' && $method === 'GET') {
    $id = intval($_GET['id'] ?? 0);
    $stmt = $db->prepare("SELECT p.*, c.name as category_name FROM products p LEFT JOIN product_categories c ON p.category_id = c.id WHERE p.id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    if (!$product) respondNotFound('Product not found');
    respondSuccess($product);
}

elseif ($path === 'list.php' && $method === 'GET') {
    $search = $_GET['search'] ?? '';
    $category = $_GET['category'] ?? '';
    $sort = $_GET['sort'] ?? 'newest';

    $sql = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN product_categories c ON p.category_id = c.id WHERE 1=1";
    $params = [];

    if ($search) {
        $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    if ($category) {
        $sql .= " AND (c.slug = ? OR c.name = ?)";
        $params[] = $category;
        $params[] = $category;
    }

    switch ($sort) {
        case 'price_asc': $sql .= " ORDER BY p.price ASC"; break;
        case 'price_desc': $sql .= " ORDER BY p.price DESC"; break;
        case 'rating': $sql .= " ORDER BY p.rating DESC"; break;
        case 'name': $sql .= " ORDER BY p.name ASC"; break;
        default: $sql .= " ORDER BY p.created_at DESC"; break;
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    respondSuccess($stmt->fetchAll());
}

else {
    respondError('Invalid endpoint');
}
