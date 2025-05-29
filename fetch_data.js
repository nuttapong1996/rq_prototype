document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('order_code').addEventListener('input', loadItems);
});

function loadItems(){
const order_code = document.getElementById('order_code').value;
const orderTableBody = document.getElementById('searchTable').getElementsByTagName('tbody')[0];

  fetch('fetch_data.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_code })
  })
  .then(response => response.json())
  .then(data => {
    // console.log("📥 Response:", data);

    orderTableBody.innerHTML = ''; // ล้างข้อมูลเก่า
    data.forEach(item => {
      const row = orderTableBody.insertRow();
      row.setAttribute('data-id', item.id);
      row.insertCell().textContent = item.item_name;
      row.insertCell().textContent = item.quantity;
      row.insertCell().textContent = item.price;
      row.insertCell().innerHTML = '<button onclick="deleteItem('+ item.id +')">ลบ</button>'; // ปุ่มลบ
    });
    updateTotalDelete();
  })
  .catch(error => {
    console.error("❌ ERROR: ", error);
  });
  
}

function deleteItem(itemId){
  if (!confirm("คุณต้องการลบสินค้านี้ใช่ไหม?")) return;

  // ลบแถวจาก DOM ก่อน (ถ้าทำแบบ frontend delete)
  // หรือจะทำหลังได้รับ response ก็ได้
  const row = document.querySelector(`tr[data-id='${itemId}']`);
  if (row) row.remove();

  const updatedTotal = updateTotalDelete();
  const order_code = document.getElementById('order_code').value;


    fetch('delete_item.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: itemId,
        order_code: order_code,
        totalPrice: updatedTotal
      })
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        alert("ลบเรียบร้อยแล้ว");
        loadItems(); // โหลดใหม่
      } else {
        alert("ลบไม่สำเร็จ: " + result.error);
      }
    });
}

function updateTotalDelete(){
  const tbody = document.querySelector("#searchTable tbody");
  const rows = tbody.rows;
  let total = 0;

  for (let row of rows) {
    const quantity = parseFloat(row.cells[1].innerText);
    const price = parseFloat(row.cells[2].innerText);
    total += quantity* price;
  }
  document.getElementById("totalSearchPrice").textContent = total.toFixed(2);
  return total;
}


