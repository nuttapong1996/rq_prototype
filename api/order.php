<?php
$root = str_replace('api', '', __DIR__);
require_once $root . '/config/connect_db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

$method = $_SERVER['REQUEST_METHOD'];
//เรียกดูรายการสินค้า By Order Code (GET)
if ($method === 'GET') {
    if (! empty($input['order_code'])) {
        try {
            $order_code = $input['order_code'];
            $stmt       = $conn->prepare("SELECT id ,item_name, price, quantity FROM order_items WHERE order_number = :order_number");
            $stmt->BindParam(":order_number", $order_code);
            $stmt->Execute();
            $result = $stmt->FetchAll(PDO::FETCH_ASSOC);
            http_response_code(200);
            echo json_encode(
                [
                    "code"   => 200,
                    "status" => "success",
                    "data"   => $result,
                ]
            );
            $conn = null;
            $stmt = null;
        } catch (PDOException $e) {
            http_response_code(200);
            echo json_encode(
                [
                    "code"    => 204,
                    "status"  => "error",
                    "title"   => "Not found",
                    "message" => "Order not found : $e",
                ]
            );
            exit;
        }
    } else {
        http_response_code(200);
        echo json_encode(
            [
                "code"    => 204,
                "status"  => "error",
                "title"   => "Not found",
                "message" => "Order code is require",
            ]
        );
        exit;
    }
//เพิ่มรายการสินค้า (Add)
} elseif ($method === 'POST') {
    if (! empty($input['order_items'])) {
        try {

            // -------- เพิ่ม Order --------------- //
            // Generate Order Code
            $rannum      = rand(10, 99);
            $orderNumber = "RQ" . $rannum;
            // สร้างตัวแปร totalPrice สำหรับเก็บค่าราคารวม
            $totalPrice = 0;
            // Query เพิ่ม Order
            $order = $conn->prepare("INSERT INTO orders (order_number ,total_price) VALUES (:order_number,:total_price)");
            // ทำการวนลูปเพื่อดึงรายการสินค้าจาก input ที่ถูกส่งมาแบบ Array
            foreach ($input['order_items'] as $data_order) {
                // ทำการคำนวนราคารวมสำหรับแต่ละรายการสินค้า
                $totalPrice += $data_order['quantity'] * $data_order['price'];
                $order->BindParam(":order_number", $orderNumber);
                $order->BindParam(":total_price", $totalPrice);
            }
            $orders->Execute();
            $order = null;

            // -------- เพิ่ม Order Item --------------- //

            $order_items = $conn->prepare("INSERT INTO order_items ( order_number, item_name, quantity,  price)VALUES (:order_number, :item_name, :quantity, :price)");
            foreach($input['order_items'] as $data_order_items) {
                $order_items->BindParam(":order_number" ,$orderNumber);
                $order_items->BindParam(":item_name" ,$data_order_items['item_name']);
            }

        } catch (PDOException $e) {
            http_response_code(200);
            echo json_encode([
                "code"    => 204,
                "status"  => "error",
                "title"   => "Something went wrong",
                "message" => "Could not complete the request : $e",
            ]);
            exit;
        }
    } else {
        http_response_code(200);
        echo json_encode([
            "code"    => 204,
            "status"  => "error",
            "title"   => "Not found",
            "message" => "Order items is require",
        ]);
        exit;
    }
    // echo "นี่คือ POST request";
} elseif ($method === 'PUT') {
    echo "นี่คือ PUT request";
} elseif ($method === 'DELETE') {
    echo "นี่คือ DELETE request";
} else {
    echo "ไม่รู้จัก method: $method";
}
