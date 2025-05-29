<?php
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);
$itemId = $input['id'] ?? null;
$totalPrice = $input['totalPrice'] ?? null;
$order_code = $input['order_code'] ?? null;

if (!$itemId) {
    echo json_encode(['success' => false, 'error' => 'Missing ID']);
    exit;
}

try {
    $pdo = new PDO("mysql:host=localhost;dbname=order_db;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $stmt = $pdo->prepare("DELETE FROM order_items WHERE id = ?");
    $stmt->execute([$itemId]);

    $update_order_total = $pdo->prepare("UPDATE orders SET total_price = ? WHERE order_number = ?");
    $update_order_total->execute([$totalPrice, $order_code]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
