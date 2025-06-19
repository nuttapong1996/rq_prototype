// DOMContentLoaded เริ่มทำงานเมื่อโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", () => {
  const addItemBtn = document.getElementById("addItem");

  if (addItemBtn) {
    // ประกาศตัวแปร Object สำหรับใช้งานในการเช็ค
    const orderTable = document.getElementById("orderTable");
    const detailTable = document.getElementById("detailTable");

    // ทำการเช็คว่ามี object อยู่ในหน้าเว็บมั้ย
    // Index page
    if (orderTable) {
      addItemBtn.addEventListener("click", () => {
        addItem("orderTable",
          "itemCode",
          "itemName",
          "quantity",
          "price",
          "totalPrice"
        );
      });
    }
    // Detail page 
    else if (detailTable) {
      addItemBtn.addEventListener("click", () => {
        addItem(
          "detailTable",
          "itemCode",
          "itemName",
          "quantity",
          "price",
          "totalOrderPrice"
        );
      });
    }
  }

});

// ฟังก์ชันเพิ่มรายการสินค้า
function addItem(tableName, itemCode, itemName, itemQuantity, itemPrice, textTotal) {
  const item_Code = document.getElementById(itemCode);
  const item_Name = document.getElementById(itemName);
  const item_Quantity = document.getElementById(itemQuantity);
  const item_Price = document.getElementById(itemPrice);
  const totalText = document.getElementById(textTotal);

  const table = document.getElementById(tableName).getElementsByTagName("tbody")[0];

  let i ;



  if (!item_Name.value || !item_Quantity.value || !item_Price.value) {
    alert("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  // ลบแถว 'ไม่มีรายการสินค้า' ถ้ามี
  const emptyRow = document.getElementById('noItem');
  if (emptyRow) {
    emptyRow.closest("tr").remove();
    i--;
  }

  // check Itemcode ซ้ำ ในตาราง
  const rowItemCode = table.getElementsByTagName("tr");

  let isDuplicate = false;
  // วนลูปหาค่าซ้ำ
  for (let rowdup of rowItemCode) {
    const existItemCode = rowdup.cells[1].textContent.trim();
    if (item_Code.value === existItemCode) {
      isDuplicate = true;
      break;
    }
  }

  if (isDuplicate === true) {
    alert("Item Code นี้ถูกเลือกไปแล้ว");
    item_Code.value = "";
    item_Name.value = "";
    item_Quantity.value = "";
    item_Price.value = "";
  } else {
    const row = table.insertRow();
    i = table.rows.length;
    row.innerHTML = `
              <td>${i}</td>
              <td>${item_Code.value}</td>
              <td>${item_Name.value}</td>
              <td><input  type="number" value="${item_Quantity.value}"  style="width: 50px; text-align:center" disabled/></td>
              <td>${item_Price.value}</td>
              <td>${item_Price.value * item_Quantity.value}</td>
              <td><button class="btn btn-danger" onclick="removeItem(this, '${tableName}' ,'${textTotal}' )">X</button></td> `;

    // เคลียร์ค่า Textbox หลังเพิ่ม
    item_Code.value = "";
    item_Name.value = "";
    item_Quantity.value = "";
    item_Price.value = "";
    // อัพเดทราคารวม
    if (totalText) totalText.textContent = updateTotal(tableName);
  }
}

// ฟังก์ชันลบแถวสินค้า
function removeItem(button, tableName, textTotal) {
  const totalText = document.getElementById(textTotal);
  button.closest("tr").remove();
  if (totalText) {
    totalText.textContent = updateTotal(tableName);
  }
}
// ฟังก์ชั่นคำนวนและอัพเดทราคารวม
function updateTotal(tableName) {
  const tbody = document.querySelector(`#${tableName} tbody`);
  const rows = tbody.rows;
  let total = 0;

  for (let row of rows) {
    const quantityInput = row.cells[3].querySelector('input');
    const price = parseFloat(row.cells[4].innerText) || 0;

    if (quantityInput) {
      const quantity = parseFloat(quantityInput.value) || 0;
      total += quantity * price;
    }
  }

  return total;
}



