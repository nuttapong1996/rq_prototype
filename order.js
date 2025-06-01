// เมื่อโหลดหน้าเสร็จ
document.addEventListener("DOMContentLoaded", () => {
  const itemName = document.getElementById("itemName");
  const quantity = document.getElementById("quantity");
  const price = document.getElementById("price");

  const orderTable = document
    .getElementById("orderTable")
    .getElementsByTagName("tbody")[0];
  const addItemBtn = document.getElementById("addItem");
  const submitOrderBtn = document.getElementById("submitOrder");

  // ฟังก์ชันเพิ่มรายการสินค้าในตาราง
  addItemBtn.addEventListener("click", () => {
    if (!itemName.value || !quantity.value || !price.value) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    const row = orderTable.insertRow();
    row.innerHTML = `
      <td>${itemName.value}</td>
      <td>${quantity.value}</td>
      <td>${price.value}</td>
      <td><button onclick="removeItem(this)">ลบ</button></td>
    `;

    // เคลียร์ค่าหลังเพิ่ม
    itemName.value = "";
    quantity.value = "";
    price.value = "";
    updateTotalPrice();
  });


  // ฟังก์ชันส่งข้อมูล Order ไปบันทึก
  submitOrderBtn.addEventListener("click", () => {
    const rows = orderTable.rows;

    if (rows.length === 0) {
      alert("กรุณาเพิ่มไอเท็มอย่างน้อย 1 รายการ");
      return;
    }

    // รวบรวมข้อมูลสินค้า
    const orderItems = Array.from(rows).map((row) => {
      const cells = row.cells;
      return {
        item_name: cells[0].innerText,
        quantity: parseInt(cells[1].innerText),
        price: parseFloat(cells[2].innerText),
      };
    });

    // ส่งข้อมูลไปเซิร์ฟเวอร์
    fetch("save_order.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_items: orderItems,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.success) location.reload();
      })
      .catch((err) => {
        console.error("เกิดข้อผิดพลาด:", err);
        alert("ไม่สามารถบันทึก Order ได้");
      });
  });
});

// ฟังก์ชันลบแถวสินค้า
function removeItem(button) {
  button.closest("tr").remove();
  updateTotalPrice();
}

function updateTotalPrice() {
  const tbody = document.querySelector("#orderTable tbody");
  const rows = tbody.rows;
  let total = 0;

  for (let row of rows) {
    const quantity = parseFloat(row.cells[1].innerText);
    const price = parseFloat(row.cells[2].innerText);
    total += quantity * price;
  }

  document.getElementById("totalPrice").textContent = total.toFixed(2);
}
