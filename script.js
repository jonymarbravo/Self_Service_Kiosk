/*Coffee display*/
document.getElementById('coffee').addEventListener('click', function() {
    document.getElementById('coffee_container').style.display = 'flex';
    document.getElementById('juice_container').style.display = 'none';
    document.getElementById('sandwiches_container').style.display = 'none';
    document.getElementById('order_list').style.display = 'flex';
    document.getElementById('home_design').style.display = 'none';
});

/*Juices display*/
document.getElementById('juice').addEventListener('click', function() {
    document.getElementById('coffee_container').style.display = 'none';
    document.getElementById('juice_container').style.display = 'flex';
    document.getElementById('sandwiches_container').style.display = 'none';
    document.getElementById('order_list').style.display = 'flex';
    document.getElementById('home_design').style.display = 'none';
});

/*Sandwiches display*/
document.getElementById('sandwiches').addEventListener('click', function() {
    document.getElementById('coffee_container').style.display = 'none';
    document.getElementById('juice_container').style.display = 'none';
    document.getElementById('sandwiches_container').style.display = 'flex';
    document.getElementById('order_list').style.display = 'flex';
    document.getElementById('home_design').style.display = 'none';
});


/*Order Display Lists*/
let priorityNumber = 1;

const productLimits = {};
const MAX_LIMIT = 10;

function addToOrder(name, price) {
    if (!productLimits[name]) {
        productLimits[name] = 0;
    }

    if (productLimits[name] >= MAX_LIMIT) {
        displayLimitMessage(name);
        return;
    }

    productLimits[name]++;

    if (productLimits[name] >= MAX_LIMIT) {  
        displayLimitMessage(name);
    }

    let orderDisplay = document.getElementById("order_display");
    
    // Check if an order for this product already exists
    let existingOrder = [...orderDisplay.getElementsByClassName("order_item")]
        .find(order => order.dataset.name === name);
    
    if (existingOrder) {
        let quantityInput = existingOrder.querySelector(".quantity_box input");
        quantityInput.value = parseInt(quantityInput.value) + 1;
        updatePrice(existingOrder, price);
        return;
    }

    let orderItem = document.createElement("div");
    orderItem.classList.add("order_item");
    orderItem.dataset.name = name;
    let orderId = Date.now();

    orderItem.innerHTML = `
        <div class="order_header">
            <h4>${name}</h4>
            <i class="delete_icon" onclick="removeOrder(this, '${name}', ${price})"><i class="fa-solid fa-trash"></i></i>
        </div>
        <p class="order_price">₱${price}.00</p>
        <div class="quantity_box">
            <button class="minus" onclick="changeQuantity(this, -1, '${name}', ${price})">−</button>
            <input type="text" value="1" size="2" readonly>
            <button class="plus" onclick="changeQuantity(this, 1, '${name}', ${price})">+</button>
        </div>
        <div class="order_type">
            <label><input type="radio" name="order_type_${orderId}" value="Dine In"> Dine In</label>
            <label><input type="radio" name="order_type_${orderId}" value="Take Out"> Take Out</label>
        </div>
    `;

    orderDisplay.appendChild(orderItem);
    updateTotalPrice();
}

function removeOrder(icon, name, price) {
    let orderItem = icon.closest(".order_item");
    let quantityInput = orderItem.querySelector(".quantity_box input");
    let quantity = parseInt(quantityInput.value);

    productLimits[name] -= quantity;
    orderItem.remove();

    if (productLimits[name] < MAX_LIMIT) {
        removeLimitMessage(name);
    }

    updateTotalPrice();
}

function displayLimitMessage(name) {
    let flavorImages = document.querySelectorAll(".flavors img");
    flavorImages.forEach(img => {
        if (img.getAttribute("alt") === name) {
            let parent = img.parentElement;
            let existingOverlay = parent.querySelector(".sold_out_overlay");
            if (!existingOverlay) {
                let overlay = document.createElement("div");
                overlay.classList.add("sold_out_overlay");
                overlay.textContent = "SOLD OUT!";
                parent.appendChild(overlay);
                parent.classList.add("blurred_product");
            }
        }
    });

    // Disable all + buttons for this item
    document.querySelectorAll(".order_item").forEach(order => {
        if (order.dataset.name === name) {
            let plusButton = order.querySelector(".plus");
            plusButton.disabled = true;
        }
    });
}

function removeLimitMessage(name) {
    let flavorImages = document.querySelectorAll(".flavors img");
    flavorImages.forEach(img => {
        if (img.getAttribute("alt") === name) {
            let parent = img.parentElement;
            let existingOverlay = parent.querySelector(".sold_out_overlay");
            if (existingOverlay) {
                existingOverlay.remove();
                parent.classList.remove("blurred_product");
            }
        }
    });

    // Re-enable all + buttons for this item
    document.querySelectorAll(".order_item").forEach(order => {
        if (order.dataset.name === name) {
            let plusButton = order.querySelector(".plus");
            plusButton.disabled = false;
        }
    });
}

function changeQuantity(button, change, name, price) {
    let quantityInput = button.parentElement.querySelector("input");
    let currentValue = parseInt(quantityInput.value);
    let newValue = Math.max(1, currentValue + change);

    if (productLimits[name] + change > MAX_LIMIT) {
        displayLimitMessage(name);
        return;
    }

    productLimits[name] += change;

    if (productLimits[name] >= MAX_LIMIT) {
        displayLimitMessage(name);
    } else {
        removeLimitMessage(name);
    }

    quantityInput.value = newValue;
    let orderItem = button.closest(".order_item");
    updatePrice(orderItem, price);
}

function updatePrice(orderItem, price) {
    let quantity = parseInt(orderItem.querySelector(".quantity_box input").value);
    let totalPrice = price * quantity;
    orderItem.querySelector(".order_price").textContent = `₱${totalPrice}.00`;

    updateTotalPrice();
}

function updateTotalPrice() {
    let total = 0;
    document.querySelectorAll(".order_item").forEach(order => {
        let priceText = order.querySelector(".order_price").textContent.replace("₱", "").replace(".00", "");
        total += parseInt(priceText);
    });
    document.getElementById("total_price").textContent = `₱${total}.00`;
}


function validateOrder() {
    let orders = document.querySelectorAll(".order_item");
    if (orders.length === 0) {
        alert("🚨 You haven't ordered anything! Please add items to your order before proceeding. 🚨");
        return;
    }
    
    for (let order of orders) {
        let radios = order.querySelectorAll("input[type=radio]");
        if (![...radios].some(r => r.checked)) {
            alert("🚨 Please choose an option: Dine In or Take Out! 🚨");
            return;
        }
    }
    showPopup("payment_popup");
}


function showPopup(id) {
    document.getElementById("main_container").classList.add("blur");
    document.getElementById(id).style.display = "flex";
    document.getElementById(id).style.flexDirection = "column";
}

function hidePopup(id) {
    document.getElementById(id).style.display = "none";
    document.getElementById("main_container").classList.remove("blur");
}

function confirmPayment() {
    let selected = document.querySelector("input[name=payment]:checked");
    if (!selected) {
        alert("🚨 Please select a payment method! 🚨");
        return;
    }
    hidePopup("payment_popup");
    showPopup("repeat_order_popup");
}


//Cancel Payment Option
document.getElementById('cancel_icon').addEventListener('click', function() {
    document.getElementById('payment_popup').style.display = 'none';
    document.getElementById("main_container").classList.remove("blur");
});

function repeatOrder(again) {
    hidePopup("repeat_order_popup");

    if (!again) {
        priorityNumber = (priorityNumber < 2000) ? priorityNumber + 1 : 1;
        document.getElementById("priority").textContent = priorityNumber.toString().padStart(2, '0');

        // Reset VIP verification fields
        document.getElementById("vip_checkbox").checked = false;
        document.getElementById("vip_id").value = "";
        document.getElementById("vip_id").disabled = true;
        document.getElementById("vip_message").style.display = "none";
    }

    document.getElementById("order_display").innerHTML = "";
}


setInterval(() => {
    let now = new Date();
    if (now.getHours() === 1 && now.getMinutes() === 0) {
        priorityNumber = 1;
        document.getElementById("priority").textContent = "01";
    }
}, 60000);



document.addEventListener("DOMContentLoaded", function() {
    const vipCustomers = ["12345", "67890", "11223", "44556", "78901"];

document.getElementById("vip_checkbox").addEventListener("change", function() {
    document.getElementById("vip_id").disabled = !this.checked;
});

document.getElementById("verify_vip").addEventListener("click", function() {
    let vipId = document.getElementById("vip_id").value;
    let message = document.getElementById("vip_message");
    if (vipCustomers.includes(vipId)) {
        message.textContent = "Welcome VIP/PWD customer! Enjoy your discount.";
        message.style.color = "green";
    } else {
        message.textContent = "Sorry, try again. Invalid VIP/PWD ID.";
        message.style.color = "red";
    }
    message.style.display = "block";
});
});