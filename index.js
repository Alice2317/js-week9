const api = 'https://livejs-api.hexschool.io/api/livejs/v1/customer/apirong';
let data = []; //產品列表
let cartList = []; //購物車列表
const productWrap = document.querySelector('.productWrap');

// 得到產品列表
function getProducts() {
    axios.get(`${api}/products`)
        .then(function (response) {
            data = response.data.products;
            render(data);
        })
}

getProducts();

// 篩選產品類別
let productSelect = document.querySelector('.productSelect');
productSelect.addEventListener('change', (e) => {
    if (productSelect.value == '全部') {
        render(data);
    } else {
        let sort = data.filter(item => {
            return e.target.value == item.category
        });
        render(sort);
    }
})

function render(val) {
    let str = '';
    val.forEach(item => {
        str += `
            <li class="productCard" data-id="${item.id}">
                <h4 class="productType">新品</h4>
                <img src="${item.images}"
                    alt="${item.category}">
                <a href="#" class="addCardBtn">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
            </li>
            `
    });
    productWrap.innerHTML = str;
}

// 得到購物車列表
function getCarts() {
    let shoppingCart = document.querySelector('.shoppingCart-table');
    axios.get(`${api}/carts`)
        .then(function (response) {
            cartList = response.data;
            let str = '';
            if (cartList.carts.length <= 0) {
                str = `
                <tr>
                    <th> — 尚未有商品 — </th>
                </tr>
             `;
            } else {
                // table上面標題
                str = `
            <tr>
                    <th width="40%">品項</th>
                    <th width="15%">單價</th>
                    <th width="15%">數量</th>
                    <th width="15%">金額</th>
                    <th width="15%"></th>
                </tr>
            `;
                // table中間產品
                cartList.carts.forEach(item => {
                    str += `
                    <tr data-id="${item.id}">
                    <td>
                        <div class="cardItem-title">
                            <img src="https://github.com/hexschool/js-training/blob/main/%E7%AC%AC%E4%B9%9D%E9%80%B1%E4%B8%BB%E7%B7%9A%E4%BB%BB%E5%8B%99%E5%9C%96%E5%BA%AB/HvT3zlU.png?raw=true" alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${item.product.price}</td>
                    <td>${item.quantity}</td>
                    <td>NT$${item.product.price * item.quantity}</td>
                    <td class="discardBtn">
                        <a href="#" class="material-icons" data-id="${item.id}">
                            clear
                        </a>
                    </td>
                </tr>
                    `
                })
                str += `
                <tr>
                    <td>
                        <a href="#" class="discardAllBtn">刪除所有品項</a>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                        <p>總金額</p>
                    </td>
                    <td>NT$${cartList.finalTotal}</td>
                </tr>
                `;
            }
            shoppingCart.innerHTML = str;
        })
}

getCarts();

// 新增購物車列表
productWrap.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.getAttribute('class') == 'addCardBtn') {
        let id = e.target.closest('li').dataset.id;
        let num = 1;

        cartList.carts.forEach(item => {
            if (item.product.id == id) {
                num += 1;
            }
        })

        let product = {
            productId: id,
            quantity: num
        }

        axios.post(`${api}/carts`, { data: product })
            .then(function (response) {
                getCarts();
            })
    }
})

// 刪除購物車列表
let shopList = document.querySelector('.shoppingCart-table');
shopList.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.getAttribute('class') == 'discardAllBtn') {
        delCarts();
    } else if (e.target.closest('td').getAttribute('class') == 'discardBtn') {
        delCart(e.target.dataset.id);
    }
})

// 刪除購物車列表全部
function delCarts() {
    axios.delete(`${api}/carts`)
        .then(function (response) {
            getCarts();
        })
}

// 刪除單筆購物車列表
function delCart(val) {
    axios.delete(`${api}/carts/${val}`)
        .then(function (response) {
            getCarts();
        })
}

// 傳送訂單
let orderInfo = document.querySelector('.orderInfo-form');
orderInfo.addEventListener('submit', (e) => {
    e.preventDefault();
    let [...inputAll] = document.querySelectorAll('.orderInfo-input');

    if (cartList.carts.length <= 0) {
        alert('請選擇購買的商品');
        return;
    }

    for (let i = 0; i < inputAll.length; i++) {
        if (inputAll[i].value == '') {
            alert('請填寫資料');
            return;
        }
    }

    let inputVal = inputAll.map(item => {
        return item.value;
    })

    let userList = {
        name: inputVal[0],
        tel: inputVal[1],
        email: inputVal[2],
        address: inputVal[3],
        payment: inputVal[4]
    };

    axios.post(`${api}/orders`,
        {
            "data": {
                "user": userList
            }
        })
        .then(function (response) {
            alert('已成功傳送訂單');
        })

    resetOrder(inputAll);
})


// 清空購物車及訂單
function resetOrder(val) {
    delCarts();
    let valItem = val;
    for (let i = 0; i < valItem.length; i++) {
        valItem[i].value = '';
    }
    val[val.length - 1].value = document.querySelector('#tradeWay').children[0].value;
}