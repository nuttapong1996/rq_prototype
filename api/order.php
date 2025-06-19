<?php
$root = str_replace('api', '', __DIR__);
require_once $root . '/config/connect_db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

$method = $_SERVER['REQUEST_METHOD'];

// GET
if ($method === 'GET' && ! empty($_GET)) {
    if (! empty($_GET['order_code'])) {
    //เรียกดูรายการทั้งหมด By Order Code
        try {
            $order_code = trim($_GET['order_code']);
            // ตรวจสอบว่ามีพารามิตเตอร์ id ของ item อยู่หรือไม่ เพื่อดึงเฉพาะ item เดียว
            if (isset($_GET['id'])) {
                // ดึงเฉพาะรายการ โดย ดึงจาก Order_code และ id ของ item
                $itemId = $_GET['id'];
                $stmt   = $conn->prepare("SELECT
                                                    items.id ,
                                                    items.order_number ,
                                                    items.item_code,
                                                    items.item_name,
                                                    items.price,
                                                    items.quantity ,
                                                    order_detail.total_price
                                                    FROM order_items  AS items
                                                    JOIN orders AS order_detail ON items.order_number = order_detail.order_number
                                                    WHERE items.order_number =:order_number AND items.id =:item_id");
                $stmt->BindParam(":order_number", $order_code);
                $stmt->BindParam(":item_id", $itemId);
                $stmt->Execute();
                $result = $stmt->FetchAll(PDO::FETCH_ASSOC);
            } else {
                // ดึงรายการทั้งหมด
                $stmt = $conn->prepare("SELECT id ,item_code,order_number ,item_name, price, quantity FROM order_items WHERE order_number = :order_number");
                $stmt->BindParam(":order_number", $order_code);
                $stmt->Execute();
                $data      = $stmt->FetchAll(PDO::FETCH_ASSOC);
                $stmtTotal = $conn->prepare("SELECT SUM(price * quantity) AS total FROM order_items WHERE order_number = :order_number");
                $stmtTotal->BindParam(":order_number", $order_code);
                $stmtTotal->Execute();
                $total  = $stmtTotal->Fetch();
                $result = [
                    'data'  => $data,
                    'total' => $total['total'],
                ];
            }
            if (! empty($result)) {
                http_response_code(200);
                echo json_encode(
                    [
                        "code"   => 200,
                        "status" => "success",
                        "data"   => $result,
                    ]
                );
            } else {
                http_response_code(200);
                echo json_encode([
                    "code"    => 204,
                    "status"  => "error",
                    "title"   => "Not found",
                    "message" => "ไม่พบข้อมูล order",
                ]);
            }
        } catch (PDOException $e) {
            http_response_code(200);
            echo json_encode(
                [
                    "code"    => 204,
                    "status"  => "error",
                    "title"   => "Error",
                    "message" => "Something went wrong : $e",
                ]
            );
        }
    } else if (! empty($_GET['searchCode'])) {
    // เรียกดูรายการ Order (Search)
        try {
            $searchCode  = '%' . $_GET['searchCode'] . '%';
            $searchQuery = "SELECT * FROM orders WHERE  order_number LIKE :Code";
            $stmtSearch  = $conn->prepare($searchQuery);
            $stmtSearch->BindParam(":Code", $searchCode);
            $stmtSearch->Execute();
            $result = $stmtSearch->FetchAll(PDO::FETCH_ASSOC);

            if (! empty($result)) {
                http_response_code(200);
                echo json_encode(
                    [
                        "code"   => 200,
                        "status" => "success",
                        "data"   => $result,
                    ]
                );
            } else {
                http_response_code(200);
                echo json_encode([
                    "code"    => 204,
                    "status"  => "error",
                    "title"   => "Not found",
                    "message" => "ไม่พบข้อมูล order",
                ]);
            }
        } catch (PDOException $e) {
            http_response_code(200);
            echo json_encode([
                'code'    => 204,
                'status'  => 'error',
                'title'   => 'Error',
                'message' => 'Something went wrong :' . $e,
            ]
            );
        }
    } else {
        http_response_code(200);
        echo json_encode(
            [
                "code"    => 204,
                "status"  => "error",
                "title"   => "Not found",
                "message" => "No data provided",
            ]
        );
        exit;
    }
}
// POST
else if ($method === 'POST') {
    if (! empty($input['order_items']) && is_array($input['order_items'])) {
        try {
            // -------- เพิ่ม Order และ Item--------------- //
            if (empty($input['order_code'])) {
                // -------- เพิ่ม Order --------------- //
                // Generate Order Code
                $rannumst    = rand(10, 99);
                $rannumnd    = rand(10, 99);
                $rannum      = $rannumst . "/" . $rannumnd;
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
                // -------- เพิ่ม Order Item --------------- //
                // Query เพิ่ม Order Item
                $order_items = $conn->prepare("INSERT INTO order_items ( order_number , item_code, item_name, quantity,  price)VALUES (:order_number,:item_code, :item_name, :quantity, :price)");
                // ทำการวนลูปเพื่อบันทึกรายการสินค้า
                foreach ($input['order_items'] as $data_order_items) {
                    $order_items->BindParam(":order_number", $orderNumber);
                    $order_items->BindParam(":item_code", $data_order_items['item_code']);
                    $order_items->BindParam(":item_name", $data_order_items['item_name']);
                    $order_items->BindParam(":quantity", $data_order_items['quantity']);
                    $order_items->BindParam(":price", $data_order_items['price']);
                    $order_items->execute();
                }

                http_response_code(200);
                echo json_encode(
                    [
                        "code"    => 200,
                        "status"  => "success",
                        "title"   => "Order success",
                        "message" => "Order number : " . $orderNumber . " has been created successfully.",
                        "order"   => $orderNumber,
                    ]
                );
                // -------- เพิ่ม Order Item By Order --------------- //
            } else if (! empty($input['order_code'])) {
                // สร้างตัวแปร totalPrice สำหรับเก็บค่าราคารวม
                $totalPrice = 0;
                // Query เพิ่ม Order Item By Order ใน table order_items โดยจะ Insert เมื่อไม่มี itemCode ใน Order และจะ Update qty และ price เมื่อพบ itemCode ที่อยู่ใน Order
                $addItemOrder = $conn->prepare("INSERT INTO order_items (order_number, item_code, item_name, quantity,price)
                                                VALUES (:order_code, :itemCode, :itemName, :itemQty,:itemPrice)
                                                ON DUPLICATE KEY UPDATE
                                                    quantity = VALUES(quantity),
                                                    price = VALUES(price)");
                //  ทำการ Query เพื่อ Update ราคารวมใน table Order
                $newTotalPrice = $conn->prepare("UPDATE orders SET total_price =:total_price WHERE order_number =:order_code");

                // ทำการวนลูป ค่า Array order_items ที่ถูกส่งมาแล้วทำการผูกค่า Param กับ Query ของ sql
                foreach ($input['order_items'] as $data_order_items) {
                    $addItemOrder->BindParam(":order_code", $input['order_code']);
                    $addItemOrder->BindParam(":itemCode", $data_order_items['item_code']);
                    $addItemOrder->BindParam(":itemName", $data_order_items['item_name']);
                    $addItemOrder->BindParam(":itemQty", $data_order_items['quantity']);
                    $addItemOrder->BindParam(":itemPrice", $data_order_items['price']);
                    $totalPrice += $data_order_items['quantity'] * $data_order_items['price'];

                    $newTotalPrice->BindParam(":total_price", $totalPrice);
                    $newTotalPrice->BindParam(":order_code", $input['order_code']);

                    $newTotalPrice->execute();
                    $addItemOrder->execute();
                }
                http_response_code(200);
                echo json_encode(
                    [
                        "code"    => 200,
                        "status"  => "success",
                        "title"   => "Order Update",
                        "message" => "Order : " . $input['order_code'] . " has updated successfully.",
                        "order"   => $input['order_code'],
                    ]
                );
            }
        } catch (PDOException $e) {
            http_response_code(200);
            echo json_encode([
                "code"    => 204,
                "status"  => "error",
                "title"   => "Something went wrong",
                "message" => "Could not complete the request : $e",
            ]);
        }
    } else {
        http_response_code(200);
        echo json_encode([
            "code"    => 204,
            "status"  => "error",
            "title"   => "Not found",
            "message" => "Order items is require",
        ]);
    }
}
// PUT
else if ($method === 'PUT') {
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
//DELETE
else if ($method === 'DELETE') {
    if (!empty($input['order_code']) && !empty($input['id']) && isset($input['totalPrice'])){
       try {
            $itemId = $input['id'];
            $order_code = $input['order_code'];
            
            if($input['totalPrice'] == 0){
                $totalPrice = 0;
            }else{
                $totalPrice = $input['totalPrice'];
            }

            // Query เพื่อลบรายการ
            $stmtDelete = $conn->prepare("DELETE FROM order_items WHERE id = :itemId AND order_number = :orderCode");
            $stmtDelete->BindParam(":itemId", $itemId);
            $stmtDelete->BindParam(":orderCode", $order_code);
            $stmtDelete->Execute();

            // ทำการ Query เพื่อ Update ราคารวมใน table Order หลังจาก Delete
            $stmtDeletePrice = $conn->prepare("UPDATE orders SET total_price =:totalPrice WHERE order_number = :orderCode");
            $stmtDeletePrice->BindParam(":totalPrice", $totalPrice);
            $stmtDeletePrice->BindParam(":orderCode", $order_code);
            $stmtDeletePrice->Execute();

            http_response_code(200);
            echo json_encode(
                [
                    "code" => 200,
                    "status" => "success",
                    "title" =>"Delete item success",
                    "message" => "Delete item success",
                    "orderCode" => $order_code
                ]
                );

       } catch (PDOException $e) {
            http_response_code(200);
            echo json_encode(
                [
                    "code" => 204,
                    "status" => "error",
                    "title" => "Erorr",
                    "message" => "Something went wrong : $e"
                ]
                );
       }
    }else{
        http_response_code(200);
        echo json_encode(
            [
                "code" => 204,
                "status" => "error",
                "title" => "Not found",
                "message" => "No data provided"
            ]
        );
    }
}
