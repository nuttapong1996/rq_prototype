<?php
$root = str_replace("api", "", __DIR__);
require_once $root . "/config/connect_db.php";
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === "GET" && ! empty($_GET)) {
// Begin ดึงรายการ item ทั้งหมด
    if(!empty($_GET['get']) && $_GET['get'] == 'all'){
        try {
        $stmtAllItem = $conn->prepare("SELECT * FROM tbl_items");
        $stmtAllItem->Execute();
        $item_result = $stmtAllItem->fetchAll(PDO::FETCH_ASSOC);

            if($item_result){
                http_response_code(200);
                echo json_encode(
                    [
                        "code" => 200,
                        "status" => "success",
                        "data" => $item_result
                    ]
                );
            }
        } catch (PDOException $e) {
        http_response_code(200);
        echo json_encode(
            [
                "code" => 204,
                "status" => "error",
                "title" => "Error",
                "message" => "Something went wrong :". $e
            ]
            );
        }
    }
// End ดึงรายการ item ทั้งหมด

// Begin ดึงรายการ item By ID
    else if (! empty($_GET['itemCode'])) {
        try {
            $itemCode  =  $_GET['itemCode']."%";
            $stmt_item = $conn->prepare("SELECT * FROM tbl_items WHERE item_code LIKE :itemcode");
            $stmt_item->BindParam(":itemcode", $itemCode);
            $stmt_item->Execute();
            $item_result = $stmt_item->fetchAll(PDO::FETCH_ASSOC);

            if ($item_result) {
                http_response_code(200);
                echo json_encode(
                    [
                        "code"   => 200,
                        "status" => "success",
                        "data"   => $item_result,
                    ]
                );
            } else {
                http_response_code(200);
                echo json_encode(
                    [
                        "code"    => 204,
                        "status"  => "error",
                        "title"   => "Not found",
                        "message" => "ไม่พบข้อมูล",
                    ]
                );
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
    } else {
        http_response_code(204);
    }
//  End ดึงรายการ item ทั้งหมด

} else if ($method === "POST" && ! empty($_POST)) {

} else if ($method === "PUT" && ! empty($_POST)) {

} else if ($method === "DELETE" && ! empty($_POST)) {

} else {
    http_response_code(400);
    echo json_encode(
        [
            "code"    => 400,
            "status"  => "error",
            "title"   => "Bad request",
            "message" => "Invalid request",
        ]
    );
    exit;
}
