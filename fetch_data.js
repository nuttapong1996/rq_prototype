// DOMContentLoaded เริ่มทำงานเมื่อโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", () => {
  // ประกาศตัวแปรสำหรับรับ parameter url : order_code
  const url = new URL(window.location.href);
  const order_code = url.searchParams.get("order_code");
  // const item_code = url.searchParams.get("itemCode");

  // ประกาศตัวแปร title แสดง เลขที่ order
  const orderCodeTitle = document.getElementById("orderCodeTitle");

  // ประกาศตัวแปรหน้า Home page 
  const submitOrderBtn = document.getElementById("submitOrder");
  const Seacrh_box = document.getElementById("orderCode");
  const seacrh_item = document.getElementById("inputItemCode");

  if (seacrh_item) {
    seacrh_item.addEventListener("input", () =>{
    loadStockItems(seacrh_item.value,'inputItemCode' ,'itemCodeList','itemCode', 'itemName', 'price')
  });
  }

  // ทำการเช็ค object ปุ่ม บันทึก และ เพิ่ม event ให้กับปุ่ม  
  if (submitOrderBtn) {
    submitOrderBtn.addEventListener("click", () => {
      saveOrder('orderTable', '');
    });
  }
  // ทำการเช็ค object ช่องค้นหา และ เพิ่ม event ให้กับ textbox
  if (Seacrh_box) {
    Seacrh_box.value = '';
    Seacrh_box.addEventListener("input", () => {
      searchOrder('searchTable', Seacrh_box.value);
    });
  }

  // ประกาศตัวแปรหน้า Detail Page
  // ประกาศตัวแปร ตารางรายละเอียด , ปุ่มบันทึกรายการ
  const detailTable = document.getElementById("detailTable");
  const saveOrderBtn = document.getElementById("saveOrder");

  // ทำการเช็ค object ตารางรายละเอียด  และ เพิ่ม event ให้กับ ตารางรายละเอียด 
  if (detailTable && orderCodeTitle && saveOrderBtn) {

    orderCodeTitle.textContent = order_code;

    loadOrderItems('detailTable', order_code, 'totalOrderPrice');

    saveOrderBtn.addEventListener("click", () => {
      saveOrder('detailTable', order_code);
    });
  }
});

// ฟังก์ชั่น บันทึก Order และ รายการไอเท็ม
function saveOrder(tableName, order_code) {
  const table = document.getElementById(tableName).getElementsByTagName("tbody")[0];
  const rows = table.rows;

  // เช็คจำนวนรายการสินค้า
  if (rows.length === 0) {
    alert("กรุณาเพิ่มไอเท็มอย่างน้อย 1 รายการ");
    return;
  }

  // สร้างตัวแปร Array สำหรับ map ข้อมูลจากตาราง
  const orderItems = Array.from(rows).map((row) => {
    const cells = row.cells;
    return {
      item_code: cells[1].innerText,
      item_name: cells[2].innerText,
      quantity: parseInt(cells[3].querySelector('input').value),
      price: parseFloat(cells[4].innerText),
    };
  });

  fetch("api/order.php", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      order_code: order_code,
      order_items: orderItems,
    }),
  })
    .then((response)=> response.json())
    .then((data) => {
      if (data.code === 200 && data.status === 'success') {
        alert(data.message);
        location.href = 'detail.html?order_code=' + data.order
      } else {
        alert(data.message);
        location.reload();
      }
    })
    .catch((error) => {
      alert('เกิดข้อผิดพลาด โปรดตรวจสอบ console');
      console.error('เกิดข้อผิดพลาด:', error);
    });
}

// ฟังก์ชั่นค้นหารายการ
function searchOrder(tableName, searchCode) {
  const tableBody = document.getElementById(tableName).getElementsByTagName("tbody")[0];

  if (searchCode == '') {
    tableBody.innerHTML = '';
    return;
  }

  fetch(`api/order.php?searchCode=${encodeURIComponent(searchCode)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('เกิดข้อผิดพลาด');
      }
      const data = await response.text();
      if (!data) {
        tableBody.innerHTML = '';
        console.log('ไม่พบข้อมูล');
      } else {
        return JSON.parse(data);
      }
    })
    .then((response) => {
      if (response.code === 200 && response.status === 'success') {
        const data = response.data;
        tableBody.innerHTML = '';
        data.forEach((item) => {
          const row = tableBody.insertRow();
          row.insertCell().textContent = item.id;
          row.insertCell().textContent = item.created_at.substring(0, 10);
          row.insertCell().textContent = item.order_number;
          row.insertCell().textContent = item.total_price;
          row.insertCell().innerHTML = '<a  href="detail.html?order_code=' + item.order_number + '">ดู</a>'
        });
      } else {
        tableBody.innerHTML = '';
      }
    })
    .catch((error) => {
      console.error('เกิดข้อผิดพลาด:', error);
    });
}

// ฟังก์ชั่นดึงรายการไอเท็ม
function loadOrderItems(tableName, order_code, textTotal) {
  const orderTableBody = document.getElementById(tableName).getElementsByTagName("tbody")[0];
  const totalOrderPrice = document.getElementById(textTotal);
  let row_no;

  fetch(`api/order.php?order_code=${encodeURIComponent(order_code)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.code === 200 && response.status === "success") {
        const data = response.data.data; 
        const total = response.data.total;

        orderTableBody.innerHTML = ""; // ล้างข้อมูลเก่า

        if (data.length === 0) {
          const row = orderTableBody.insertRow();
          const cell = row.insertCell();
          cell.colSpan = 7;
          cell.setAttribute("id", "noItem");
          cell.textContent = "ไม่มีรายการสินค้า";
          cell.style.textAlign = "center";
          return; 
        }

        data.forEach((item) => {
          const row = orderTableBody.insertRow();
          row_no = orderTableBody.rows.length;
          row.setAttribute("data-id", item.id);
          row.insertCell().textContent = row_no;
          row.insertCell().textContent = item.item_code;
          row.insertCell().textContent = item.item_name;
          row.insertCell().innerHTML = `<input  type="number" value="${item.quantity}"  style="width: 50px; text-align:center" />`;
          row.insertCell().textContent = item.price;
          row.insertCell().textContent = (item.price * item.quantity).toFixed(2);
          // row.insertCell().innerHTML = '<a href="edit.html?order_code=' + item.order_number + "&id=" + item.id + '">แก้ไข</a>';
          row.insertCell().innerHTML = `<button onclick="deleteItem('${item.order_number}',${item.id})">ลบ</button>`
        });
        if (totalOrderPrice) totalOrderPrice.textContent = total;
        updateRowPrice(tableName, textTotal);
        
      } else {
        console.error("โหลดข้อมูลไม่สำเร็จ:", response);
      }
    })
    .catch((error) => {
      console.error("เกิดข้อผิดพลาด:", error);
    });
}

// ฟังก์ชันลบรายการไอเท็ม
function deleteItem(order_code, itemId) {
  if (!confirm("คุณต้องการลบสินค้านี้ใช่ไหม?")) return;

  // ลบแถวจาก DOM ก่อน (ถ้าทำแบบ frontend delete)
  // หรือจะทำหลังได้รับ response ก็ได้
  const row = document.querySelector(`tr[data-id='${itemId}']`);
  if (row) row.remove();

  const updatedTotal = updateTotal('detailTable');
  const textTotal = document.getElementById("totalOrderPrice");
  if (textTotal) { textTotal.textContent = updatedTotal.toFixed(2) };

  fetch("api/order.php", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: itemId,
      order_code: order_code,
      totalPrice: updatedTotal,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.code === 200 && data.status === 'success') {
        alert(data.message);
        location.href = "detail.html?order_code=" + data.orderCode;
      } else {
        alert("Could not delete an item , please check console." );
      }
    })
    .catch((error)=>{
        console.error("เกิดข้อผิดพลาด:", error);
    });
}

// ฟังก์ชั่นคำนวนและอัพเดทราคารวมของไอเท็มในแถว
function updateRowPrice(tableName, textTotal){
  const tbody = document.querySelector(`#${tableName} tbody`);
  const rows = tbody.rows;

  for (let row of rows) {
    const quantityInput = row.cells[3].querySelector('input');
    const price = parseFloat(row.cells[4].innerText) || 0;
    const totalCell = row.cells[5];

    if (quantityInput) {
      quantityInput.addEventListener('input', () => {
        const quantity = parseFloat(quantityInput.value) || 0;
        const rowTotal = quantity * price;

        // อัปเดตราคาต่อแถว
        totalCell.textContent = rowTotal.toFixed(2);

        // รวมทั้งหมดใหม่ แล้วอัปเดตแสดงผล
        const total = updateTotal(tableName);
        const totalText = document.getElementById(textTotal);
        if (totalText) {
          totalText.textContent = total.toFixed(2);
          console.log(total.toFixed(2));
        }
      });
    }
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

// ฟังก์ชันดึงรายละเอียดไอเท็ม
function loadOrderItemsDetail(orderNumber, itemId) {
  const orderCode = document.getElementById("orderCode");
  const item_id = document.getElementById("item_id");
  const itemName = document.getElementById("item_name");
  const quantity = document.getElementById("qty");
  const price = document.getElementById("price");
  const sum_item_price = document.getElementById("sum_item_price");


  const update_sum_price = () => {
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
      if (response.code === 200 && response.status === 'success') {
        const data = response.data; // ✅ ดึง array จาก response
        data.forEach((item) => {
          orderCode.value = item.order_number;
          item_id.value = item.id;
          itemName.value = item.item_name;
          quantity.value = item.quantity;
          price.value = item.price;
          sum_item_price.value = quantity.value * price.value;
        });
      } else {
        console.error('โหลดข้อมูลไม่สำเร็จ:', response);
      }
    });
}

// ฟังก์ชั่นดึงไอเท็มในคลัง
function loadStockItems(inputItemCodeValue,inputItemCode,itemCodeList,itemCode,itemName, itemPrice) {
  const searchBox = document.getElementById(inputItemCode);
  const suggList = document.getElementById(itemCodeList);
  const item_Code = document.getElementById(itemCode);
  const item_Name = document.getElementById(itemName);
  const item_Price = document.getElementById(itemPrice);
  
  fetch(`api/item.php?itemCode=${encodeURIComponent(inputItemCodeValue)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("เกิดข้อผิดพลาด");
      }
      return response.text(); // return promise ของ text
    })
    .then(text => {
      if (!text) {
        console.log("ไม่พบข้อมูล");
        return null;
      }
      return JSON.parse(text); // parse json ที่ได้จาก text
    })
    .then(response => {
      if (!response) return;

      if (response.code === 200 && response.status === "success") {
        const data = response.data; // สมมุติว่าเป็น array ของ item ชื่อ


        searchBox.addEventListener("input", () => {
          const keyword = searchBox.value;
          suggList.innerHTML = "";

          if (keyword === "") {
            suggList.style.display = "none";
            return;
          }

          if (data.length > 0) {
            suggList.style.display = "block";

            data.forEach(item => {              
              const li = document.createElement("li");
              li.textContent = item.item_code + " " + item.item_name;
              li.style.cursor = "pointer";
              
             li.onmouseover = () => li.style.backgroundColor = "red";
             li.onmouseout = () => li.style.backgroundColor = "white";
                
              li.onclick = function () {
                item_Code.value = item.item_code;
                item_Name.value = item.item_name;
                item_Price.value = item.item_price;
                suggList.style.display = "none";
                searchBox.value = '';
              };

              suggList.appendChild(li);
            });
          } else {
            suggList.style.display = "none";
          }
        });

        // คลิกที่อื่นเพื่อปิด list
        document.addEventListener("click", function (e) {
          if (e.target !== searchBox) {
            suggList.style.display = "none";
            searchBox.value ='';
          }
        });
      }
    })
    .catch(error => {
      console.error("Error:", error.message);
    });
}




  // ฟังก์ชั่นแก้ไข/อัพเดทรายการไอเท็ม
  // function updateOrderItems() {
  //   const orderCode = document.getElementById("orderCode");
  //   const itemId = document.getElementById("item_id");
  //   const itemName = document.getElementById("item_name");
  //   const quantity = document.getElementById("qty");
  //   const price = document.getElementById("price");

  //   fetch('api/order.php', {
  //     method: 'PUT',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       orderCode: orderCode.value,
  //       itemId: itemId.value,
  //       itemName: itemName.value,
  //       quantity: quantity.value,
  //       price: price.value,
  //       sumItemPrice: quantity.value * price.value
  //     })
  //   })
  //     .then((response) => response.json())
  //     .then((response) => {
  //       if (response.code === 200 && response.status === 'success') {
  //         console.log(response);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('เกิดข้อผิดพลาด:', error);
  //     })
// }

