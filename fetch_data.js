document.addEventListener("DOMContentLoaded", () => {
  const Seacrh_box = document.getElementById("order_code");
  if (Seacrh_box) Seacrh_box.addEventListener("input", loadItems);

});

function loadItems() {
  const order_code = document.getElementById("order_code").value;
  const orderTableBody = document
    .getElementById("searchTable")
    .getElementsByTagName("tbody")[0];

  fetch(`api/order.php?order_code=${encodeURIComponent(order_code)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.code === 200 && response.status === "success") {
        const data = response.data; // ✅ ดึง array จาก response
        orderTableBody.innerHTML = ""; // ล้างข้อมูลเก่า

        data.forEach((item) => {
          const row = orderTableBody.insertRow();
          row.setAttribute("data-id", item.id);
          row.insertCell().textContent = item.item_name;
          row.insertCell().textContent = item.quantity;
          row.insertCell().textContent = item.price;
          row.insertCell().innerHTML =
            '<a href="edit.html?order_code=' +
            item.order_number +
            "&id=" +
            item.id +
            '">แก้ไข</a>' +
            '<button onclick="deleteItem(' +
            item.id +
            ')">ลบ</button>';
        });
        updateTotalDelete();
      } else {
        console.error("โหลดข้อมูลไม่สำเร็จ:", response);
      }
    })
    .catch((error) => {
      console.error("เกิดข้อผิดพลาด:", error);
    });
}

function deleteItem(itemId) {
  if (!confirm("คุณต้องการลบสินค้านี้ใช่ไหม?")) return;

  // ลบแถวจาก DOM ก่อน (ถ้าทำแบบ frontend delete)
  // หรือจะทำหลังได้รับ response ก็ได้
  const row = document.querySelector(`tr[data-id='${itemId}']`);
  if (row) row.remove();

  const updatedTotal = updateTotalDelete();
  const order_code = document.getElementById("order_code").value;

  fetch("delete_item.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: itemId,
      order_code: order_code,
      totalPrice: updatedTotal,
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.success) {
        alert("ลบเรียบร้อยแล้ว");
        loadItems(); // โหลดใหม่
      } else {
        alert("ลบไม่สำเร็จ: " + result.error);
      }
    });
}

function updateTotalDelete() {
  const tbody = document.querySelector("#searchTable tbody");
  const rows = tbody.rows;
  let total = 0;

  for (let row of rows) {
    const quantity = parseFloat(row.cells[1].innerText);
    const price = parseFloat(row.cells[2].innerText);
    total += quantity * price;
  }
  document.getElementById("totalSearchPrice").textContent = total.toFixed(2);
  return total;
}


function loadItemDetail(orderNumber, itemId) {
  const orderCode = document.getElementById("orderCode");
  const item_id = document.getElementById("item_id");
  const itemName = document.getElementById("item_name");
  const quantity = document.getElementById("qty");
  const price = document.getElementById("price");
  const total_order_price = document.getElementById("total_order_price");
  const sum_item_price = document.getElementById("sum_item_price");


  const update_sum_price = () =>{
    sum_item_price.value = quantity.value * price.value;
  }
  quantity.addEventListener('input', update_sum_price);
  price.addEventListener('input', update_sum_price);


  fetch(`api/order.php?order_code=${encodeURIComponent(orderNumber)}&id=${encodeURIComponent(itemId)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((response) => {
        if(response.code === 200 && response.status === 'success'){
           const data = response.data; // ✅ ดึง array จาก response
            data.forEach((item) =>{
                  orderCode.value = item.order_number;
                  item_id.value = item.id;
                  itemName.value = item.item_name;
                  quantity.value = item.quantity;
                  price.value = item.price;
                  total_order_price.value = item.total_price;
                  sum_item_price.value = quantity.value * price.value;
            });
        }else{
            console.error('โหลดข้อมูลไม่สำเร็จ:', response);
        }
    });
}

function updateItem() {
  const orderCode = document.getElementById("orderCode").value;
  const item_id = document.getElementById("item_id").value;
  const itemName = document.getElementById("item_name");
  const quantity = document.getElementById("qty");
  const price = document.getElementById("price");
  const total_order_price = document.getElementById("total_order_price");
  const sum_item_price = document.getElementById("sum_item_price");

  fetch('api/order.php',{
    method: 'PUT',
    headers:{
      'Content-Type' : 'application/json'
    },
    body: JSON.stringify({
      order_code : orderCode,
      id: item_id,
      itemName : itemName.value,
      quantity : quantity.value,
      price : price.value,
      total_order_price : total_order_price.value,
      sum_item_price : sum_item_price.value
    })
  })
   .then((response)=>response.json())
    .then((response)=>{
      if(response.code === 200 && response.status === 'success'){
          console.log(response);
      }
    })
    .catch((error)=>{
      console.error('เกิดข้อผิดพลาด:', error);
    })
}
