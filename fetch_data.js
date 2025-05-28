document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('order_code').addEventListener('input', loadItems);
});

function loadItems(){
const order_code = document.getElementById('order_code').value;
  const orderTableBody = document.getElementById('searchTable').getElementsByTagName('tbody')[0];
  const updateTotalPrice = document.getElementById("UpdateTotalPrice");

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
      row.insertCell().textContent = item.item_name;
      row.insertCell().textContent = item.quantity;
      row.insertCell().textContent = item.price;
      row.insertCell().innerHTML = '<button onclick="deleteItem(' + item.id + ', ' + updateTotalPrice.value + ')">ลบ</button>'; // ปุ่มลบ
    });
    updateTotalDelete();
  })
  .catch(error => {
    console.error("❌ ERROR: ", error);
  });
  
}


function deleteItem(itemId ,totalPrice){
     if (!confirm("คุณต้องการลบสินค้านี้ใช่ไหม?")) return;

    fetch('delete_item.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: itemId,
        totalPrice: totalPrice
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
    // const quantity = parseFloat(row.cells[1].innerText);
    const price = parseFloat(row.cells[2].innerText);
    total += price;
  }
  document.getElementById("totalSearchPrice").textContent = total.toFixed(2);
  document.getElementById("totalSearchPrice").value = total.toFixed(2)

}


