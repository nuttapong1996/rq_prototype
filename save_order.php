<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "order_db");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ"]));
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data || empty($data["order_items"])) {
    die(json_encode(["success" => false, "message" => "ข้อมูลไม่ถูกต้อง"]));
}

$conn->begin_transaction();

try {
    // สร้างเลข Order ใหม่
    $curDate = date("Ymdhms");
    $orderNumber = "ORD".$curDate;
    $orders_num = $conn->prepare("INSERT INTO orders (order_number ,total_price) VALUES (?,?)");
    $totalPrice = 0;
    foreach($data["order_items"] as $order){
        $totalPrice += $order["quantity"] * $order["price"];
        $orders_num->bind_param("sd", $orderNumber, $totalPrice);
    }
        $orders_num->execute();

    $orders_num->close();
    // บันทึกไอเท็มใน Order
    $order_item = $conn->prepare("INSERT INTO order_items (order_number, item_name, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($data["order_items"] as $item) {
        $order_item->bind_param("ssid", $orderNumber, $item["item_name"], $item["quantity"], $item["price"]);
        $order_item->execute();
    }
    $order_item->close();

    $conn->commit();
    echo json_encode(["success" => true, "message" => "บันทึกคำสั่งซื้อสำเร็จ!"]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "เกิดข้อผิดพลาดในการบันทึก"]);
}

$conn->close();
?>
