<?php
$root = str_replace('api', '', __DIR__);
require_once $root . '/config/connect_db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

$method = $_SERVER['REQUEST_METHOD'];

//เรียกดูรายการ By Order Code (GET)
if ($method === 'GET') {
    if (! empty($_GET['order_code'])) {
        try {
            $order_code = $_GET['order_code'];
            // ตรวจสอบว่ามีพารามิตเตอร์ id ของ item อยู่หรือไม่ เพื่อดึงเฉพาะ item เดียว
            if (isset($_GET['id'])) {
                // ดึงเฉพาะรายการ โดย ดึงจาก Order_code และ id ของ item
                $itemId = $_GET['id'];
                $stmt   = $conn->prepare("SELECT
                                            items.id ,
                                            items.order_number ,
                                            items.item_name,
                                            items.price,
                                            items.quantity ,
                                            order_detail.total_price
                                            FROM order_items  AS items
                                            JOIN orders AS order_detail ON items.order_number = order_detail.order_number
                                            WHERE items.order_number =:order_number AND items.id =:item_id");
                $stmt->BindParam(":order_number", $order_code);
                $stmt->BindParam(":item_id", $itemId);
            } else {
                // ดึงรายการทั้งหมด
                $stmt = $conn->prepare("SELECT id ,order_number ,item_name, price, quantity FROM order_items WHERE order_number = :order_number");
                $stmt->BindParam(":order_number", $order_code);
            }
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
//เพิ่ม Order และ รายการ (POST)
} elseif ($method === 'POST') {
    if (! empty($input['order_items']) && is_array($input['order_items'])) {
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
            $order->Execute();
            $order = null;
            // -------- เพิ่ม Order Item --------------- //
            // Query เพิ่ม Order Item
            $order_items = $conn->prepare("INSERT INTO order_items ( order_number, item_name, quantity,  price)VALUES (:order_number, :item_name, :quantity, :price)");
            // ทำการวนลูปเพื่อบันทึกรายการสินค้า
            foreach ($input['order_items'] as $data_order_items) {
                $order_items->BindParam(":order_number", $orderNumber);
                $order_items->BindParam(":item_name", $data_order_items['item_name']);
                $order_items->BindParam(":quantity", $data_order_items['quantity']);
                $order_items->BindParam(":price", $data_order_items['price']);
                $order_item->execute();
            }
            $order_items = null;
            $conn        = null;

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
}
//แก้ไขรายการ (PUT)
elseif ($method === 'PUT') {
    if (! empty($input['orderCode']) && ! empty($input['itemId'])) {
        try {
            $orderCode    = $input['orderCode'];
            $itemId       = $input['itemId'];
            $itemName     = $input['itemName'];
            $qty          = $input['quantity'];
            $price        = $input['price'];
            $sumItemPrice = $input['sumItemPrice'];

            // Query Update รายละเอียด Item
            $stmtUpdateOrderItem = $conn->prepare("UPDATE order_items
                                                SET item_name =:item_name ,
                                                    quantity=:qty ,
                                                    price =:update_price
                                                WHERE order_number = :order_code
                                                AND id =:item_id");
            $stmtUpdateOrderItem->BindParam(":item_name", $itemName);
            $stmtUpdateOrderItem->BindParam(":qty", $qty);
            $stmtUpdateOrderItem->BindParam(":update_price", $price);
            $stmtUpdateOrderItem->BindParam(":order_code", $orderCode);
            $stmtUpdateOrderItem->BindParam(":item_id", $itemId);
            $stmtUpdateOrderItem->Execute();

            // ทำการ Query เพื่อคำนวนราคารวมของ Order ใหม่
            $stmtTotalPrice = $conn->prepare("SELECT SUM(quantity * price) AS  Total FROM order_items WHERE order_number =:orderCode");
            $stmtTotalPrice->BindParam(':orderCode', $orderCode);
            $stmtTotalPrice->Execute();
            $totalOrderPrice = $stmtTotalPrice->Fetch();

            // ทำการ Update Total price ของ Order
            $stmtUpdateTotalPrice = $conn->prepare("UPDATE orders SET total_price =:update_price WHERE order_number =:order_code");
            $stmtUpdateTotalPrice->BindParam(":update_price", $totalOrderPrice['Total']);
            $stmtUpdateTotalPrice->BindParam(":order_code", $orderCode);
            $stmtUpdateTotalPrice->Execute();

            echo json_encode([
                "code"    => 200,
                "status"  => "success",
                "title"   => "Update Order",
                "message" => "Update Order " . $orderCode . " successfully.",
            ]);
            $stmtUpdateOrderItem  = null;
            $stmtTotalPrice       = null;
            $stmtUpdateTotalPrice = null;
            $conn                 = null;
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
            'code'    => 204,
            'status'  => 'error',
            'title'   => 'Not found',
            'message' => 'Order code or id is require',
        ]);
        exit;
    }
}
//ลบรายการ (DELETE)
elseif ($method === 'DELETE') {
    
} else {
    echo "ไม่รู้จัก method: $method";
}
