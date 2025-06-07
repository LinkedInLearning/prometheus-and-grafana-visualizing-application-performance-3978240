class OrderManager {
    constructor() {
        this.apiBaseUrl = window.location.origin + '/api';
        this.orderForm = document.getElementById('order-form');
        this.ordersList = document.getElementById('orders-list');
        this.orderIdInput = document.getElementById('order-id');
        this.customerNameInput = document.getElementById('customer-name');
        this.productNameInput = document.getElementById('product-name');
        this.quantityInput = document.getElementById('quantity');
        this.totalPriceInput = document.getElementById('total-price');
        this.cancelEditButton = document.getElementById('cancel-edit');

        this.initEventListeners();
        this.loadOrders();
    }

    initEventListeners() {
        this.orderForm.addEventListener('submit', this.handleSubmit.bind(this));
        this.cancelEditButton.addEventListener('click', this.cancelEdit.bind(this));
    }

    async loadOrders() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/orders`);
            const orders = await response.json();
            this.renderOrders(orders);
        } catch (error) {
            console.error('Failed to load orders:', error);
            alert('Failed to load orders');
        }
    }

    renderOrders(orders) {
        this.ordersList.innerHTML = '';
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.customer_name}</td>
                <td>${order.product_name}</td>
                <td>${order.quantity}</td>
                <td>$${order.total_price.toFixed(2)}</td>
                <td>
                    <button onclick="orderManager.editOrder(${order.id}, '${order.customer_name}', '${order.product_name}', ${order.quantity}, ${order.total_price})">Edit</button>
                    <button onclick="orderManager.deleteOrder(${order.id})">Delete</button>
                </td>
            `;
            this.ordersList.appendChild(row);
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        const orderData = {
            customer_name: this.customerNameInput.value,
            product_name: this.productNameInput.value,
            quantity: parseInt(this.quantityInput.value),
            total_price: parseFloat(this.totalPriceInput.value)
        };

        try {
            if (this.orderIdInput.value) {
                // Update existing order
                await this.updateOrder(this.orderIdInput.value, orderData);
            } else {
                // Create new order
                await this.createOrder(orderData);
            }
            this.resetForm();
            this.loadOrders();
        } catch (error) {
            console.error('Failed to save order:', error);
            alert('Failed to save order');
        }
    }

    async createOrder(orderData) {
        const response = await fetch(`${this.apiBaseUrl}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error('Failed to create order');
        }
    }

    async updateOrder(orderId, orderData) {
        const response = await fetch(`${this.apiBaseUrl}/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error('Failed to update order');
        }
    }

    editOrder(id, customerName, productName, quantity, totalPrice) {
        this.orderIdInput.value = id;
        this.customerNameInput.value = customerName;
        this.productNameInput.value = productName;
        this.quantityInput.value = quantity;
        this.totalPriceInput.value = totalPrice;
        this.cancelEditButton.style.display = 'block';
    }

    cancelEdit() {
        this.resetForm();
    }

    async deleteOrder(orderId) {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/orders/${orderId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete order');
            }

            this.loadOrders();
        } catch (error) {
            console.error('Failed to delete order:', error);
            alert('Failed to delete order');
        }
    }

    resetForm() {
        this.orderIdInput.value = '';
        this.customerNameInput.value = '';
        this.productNameInput.value = '';
        this.quantityInput.value = '';
        this.totalPriceInput.value = '';
        this.cancelEditButton.style.display = 'none';
    }
}

// Initialize the order manager when the page loads
const orderManager = new OrderManager();