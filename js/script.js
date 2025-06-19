// ทำการเมื่อโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded" , ()=>{
    getStockItem("all","stockTable");
});



// ฟังก์ชั่นดึงไอเท็มในคลัง
function getStockItem (Item , tableName){
    const table = document.getElementById(tableName).getElementsByTagName("tbody")[0];

    fetch(`api/item.php?get=${encodeURIComponent(Item)}` ,{
        method: "GET",
        headers :{
            "Content-Type" : "application/json"
        }
    })
    .then(response=>response.json())
    .then(response=>{
        if(response.code === 200 && response.status === "success"){
            const data = response.data;
            data.forEach(item => {
                const row = table.insertRow();
                const row_no = table.rows.length;
                // row.setAttribute("data-id", item.id);
                row.insertCell().textContent = row_no;
                row.insertCell().textContent = item.item_code;
                row.insertCell().textContent = item.item_name;
                row.insertCell().textContent = item.item_price;
                row.insertCell().textContent = item.item_stock;
                row.insertCell().innerHTML = `<a class="btn btn-primary" href="?item=${item.item_code}">...</a>`
            });
        }else{
            table.innerHTML = "";
            const row = table.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 7;
            cell.textContent = "ไม่มีรายการสินค้า";
        }
    })
    .catch((error)=>{
        console.error("เกิดข้อผิดพลาด:", error);
    })
}