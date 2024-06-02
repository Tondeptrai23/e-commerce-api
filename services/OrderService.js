import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";
import { CartService } from "./cartService.js";

class OrderSerivce {
    static getOrders = async (user) => {
        const orders = await user.getOrders({
            attributes: {
                exclude: ["updatedAt", "createdAt"],
            },
        });
        return orders;
    };

    static getOrder = async (orderId) => {
        const order = await Order.findByPk(orderId, {
            attributes: {
                exclude: ["updatedAt", "createdAt", "userId"],
            },
            include: [
                {
                    model: Product,
                    as: "products",
                    attributes: {
                        exclude: ["updatedAt", "createdAt"],
                    },
                    through: {
                        attributes: ["quantity"],
                    },
                },
            ],
        });
        return order;
    };

    static updatePaymentAndMessage = async (orderId, updateField) => {
        const order = await this.getOrder(orderId);

        if (order) {
            order.message = updateField.message;
            order.payment = updateField.payment;
            order.save();
        }

        return order;
    };

    static moveToCart = async (user, orderId) => {
        const order = await this.getOrder(orderId);

        if (order === null) {
            return null;
        }

        for (const product of order.products) {
            await CartService.addProduct(
                user,
                product.id,
                product.orderProduct.quantity
            );
        }

        await this.deleteOrder(orderId);

        return CartService.getProducts(user);
    };

    static deleteOrder = async (orderId) => {
        const order = await Order.findByPk(orderId);

        if (order) {
            await order.destroy();
            return true;
        }

        return false;
    };

    static deleteAllOrders = async (user) => {
        const orders = await user.getOrders();

        for (const order of orders) {
            await order.destroy();
        }

        return true;
    };
}

export { OrderSerivce };
