<?php
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);
$itemId = $input['id'] ?? null;

// if (!$itemId) {
//     echo json_encode(['success' => false, 'error' => 'Missing ID']);
//     exit;
// }

// try {
//     $pdo = new PDO("mysql:host=localhost;dbname=order_db;charset=utf8mb4", "root", "", [
//         PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
//     ]);

//     $stmt = $pdo->prepare("DELETE FROM order_items WHERE id = ?");
//     $stmt->execute([$itemId]);

//     // $update_order_total



//     echo json_encode(['success' => true]);
// } catch (PDOException $e) {
//     echo json_encode(['success' => false, 'error' => $e->getMessage()]);
// }
