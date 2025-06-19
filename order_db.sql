/*
 Navicat Premium Dump SQL

 Source Server         : local
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : order_db

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 18/06/2025 22:18:35
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `item_code` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `item_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `quantity` int NULL DEFAULT NULL,
  `price` decimal(10, 2) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `order_id`(`order_number` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of order_items
-- ----------------------------

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp,
  `total_price` decimal(10, 0) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of orders
-- ----------------------------

-- ----------------------------
-- Table structure for tbl_item_group
-- ----------------------------
DROP TABLE IF EXISTS `tbl_item_group`;
CREATE TABLE `tbl_item_group`  (
  `item_group_id` int NOT NULL,
  `item_group_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`item_group_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tbl_item_group
-- ----------------------------
INSERT INTO `tbl_item_group` VALUES (1, 'Computer Hardware');

-- ----------------------------
-- Table structure for tbl_items
-- ----------------------------
DROP TABLE IF EXISTS `tbl_items`;
CREATE TABLE `tbl_items`  (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `item_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `item_name` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `item_group_id` int NULL DEFAULT NULL,
  `item_price` decimal(10, 2) NULL DEFAULT NULL,
  `item_stock` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`item_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tbl_items
-- ----------------------------
INSERT INTO `tbl_items` VALUES (1, 'A001', 'Mouse wireless', 1, 300.00, '5');
INSERT INTO `tbl_items` VALUES (2, 'A002', 'Mouse USB', 1, 200.00, '5');
INSERT INTO `tbl_items` VALUES (3, 'A003', 'Keyboard', 1, 300.00, '5');

-- ----------------------------
-- Table structure for tbl_stock_trans
-- ----------------------------
DROP TABLE IF EXISTS `tbl_stock_trans`;
CREATE TABLE `tbl_stock_trans`  (
  `stock_trans_id` int NOT NULL AUTO_INCREMENT,
  `item_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `request_qty` int NULL DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stock_trans_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tbl_stock_trans
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
