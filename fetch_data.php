<?php
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);
$order_code = $input['order_code'] ?? '';

if (!$order_code) {
    echo json_encode([]);
    exit;
}

$pdo = new PDO("mysql:host=localhost;dbname=order_db;charset=utf8mb4", "root", "", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);

$stmt = $pdo->prepare("SELECT id ,order_number, item_name, price, quantity FROM order_items WHERE order_number = ?");
$stmt->execute([$order_code]);

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows);
