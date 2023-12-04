const api = 'https://livejs-api.hexschool.io/api/livejs/v1/admin/apirong';
const token = {
    headers: {
        Authorization: 'UqGdZ1h6A6c1cbm9PsmzpVP9OCB2'
    }
};
let orders = []; //訂單列表
let ordersTable = document.querySelector('.orderPage-table');


// 得到訂單
function getOrders() {
    axios.get(`${api}/orders`, token)
        .then(function (response) {
            orders = response.data.orders;
            render(orders);
        })
}

getOrders();

function render(val) {
    let kindColumn = {};
    let titleColumn = {};
    let str = `
    <thead>
                    <tr>
                        <th>訂單編號</th>
                        <th>聯絡人</th>
                        <th>聯絡地址</th>
                        <th>電子郵件</th>
                        <th>訂單品項</th>
                        <th>訂單日期</th>
                        <th>訂單狀態</th>
                        <th>操作</th>
                    </tr>
                </thead>
    `;

    val.forEach((item, index) => {
        // 找出類別及數量圓餅圖
        item.products.forEach(item => {
            if (kindColumn[item.category] == undefined) {
                kindColumn[item.category] = item.quantity;
            } else {
                kindColumn[item.category] += item.quantity;
            }
        })

        // 找出產品標題及數量圓餅圖
        item.products.forEach(item => {
            if (titleColumn[item.title] == undefined) {
                titleColumn[item.title] = item.quantity;
            } else {
                titleColumn[item.title] += item.quantity;
            }
        })

        // 渲染表格
        str += `
            <tr>
                    <td>${item.createdAt}</td>
                    <td>
                        <p>${item.user.name}</p>
                        <p>${item.user.tel}</p>
                    </td>
                    <td>${item.user.address}</td>
                    <td>${item.user.email}</td>
                    <td>
                        <p>${item.products.map(item => item.category)}</p>
                    </td>
                    <td>2021/03/08</td>
                    <td class="orderStatus">
                        <a href="#"  data-id="${item.id}">${item.paid ? '已處理' : '未處理'}</a>
                    </td>
                    <td>
                        <input type="button"  data-id="${item.id}" class="delSingleOrder-Btn" value="刪除">
                    </td>
                </tr>
            `;
    });
    ordersTable.innerHTML = str;

    // 渲染類別圓餅圖
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: Object.entries(kindColumn)
        },
    });

    // 產品標題排序
    let aryTitleColumn = Object.entries(titleColumn);
    aryTitleColumn.sort(function (a, b) {
        if (a > b) {
            return -1;
        }
    });

    // 產品標題前三名
    let maxNum = 3;
    let minNum = 2;
    let winItem3 = aryTitleColumn.filter((item, index) => {
        return index < maxNum;
    })

    // 其他產品
    if (aryTitleColumn.length > maxNum) {
        let noWinItem = aryTitleColumn.filter((item, index) => {
            return index > minNum;
        })

        let otherItem = {};
        noWinItem.forEach(item => {
            if (otherItem['其他'] == undefined) {
                otherItem['其他'] = item[1];
            } else {
                otherItem['其他'] += item[1];
            }
        })
        winItem3 = [...winItem3, ...Object.entries(otherItem)];
    }

    // 渲染產品標題圓餅圖
    let chart1 = c3.generate({
        bindto: '#chart1', // HTML 元素綁定
        data: {
            type: "pie",
            columns: winItem3
        }
    });
}

// 更新及刪除訂單
ordersTable.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.closest('td').getAttribute('class') == 'orderStatus') {
        updateOrder(e.target.dataset.id);
    } else if (e.target.getAttribute('class') == 'delSingleOrder-Btn') {
        delOrder(e.target.dataset.id);
    }
});

// 更新單筆訂單
function updateOrder(val) {
    axios.put(`${api}/orders`,
        {
            data: {
                id: val,
                paid: true
            }
        }, token
    ).then(function (response) {
        getOrders();
    })
}

// 刪除單筆訂單
function delOrder(val) {
    axios.delete(`${api}/orders/${val}`, token)
        .then(function (response) {
            getOrders();
        })
}

//刪除全部訂單
let discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', (e) => {
    axios.delete(`${api}/orders`, token)
        .then(function (response) {
            getOrders();
        })
})