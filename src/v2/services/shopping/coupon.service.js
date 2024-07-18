import { Op, Sequelize } from "sequelize";
import Category from "../../models/products/category.model.js";
import Product from "../../models/products/product.model.js";
import Coupon from "../../models/promotion/coupon.model.js";
import Order from "../../models/userOrder/order.model.js";
import { ResourceNotFoundError } from "../../utils/error.js";
import Variant from "../../models/products/variant.model.js";
import productCategoryService from "../products/productCategory.service.js";
import { flattenArray } from "../../utils/utils.js";

class CouponService {
    /**
     * Create a coupon
     *
     * @param {Object} couponData The coupon data to be created
     * @returns {Promise<Coupon>} The created coupon
     */
    async createCoupon(couponData) {
        const coupon = await Coupon.create(couponData);

        if (couponData.categories) {
            const categories = await Category.findAll({
                where: {
                    name: {
                        [Op.in]: couponData.categories,
                    },
                },
            });
            await coupon.setCategories(categories);
            coupon.dataValues.categories = categories;
        }

        if (couponData.products) {
            const products = await Product.findAll({
                where: {
                    productID: {
                        [Op.in]: couponData.products,
                    },
                },
            });
            await coupon.setProducts(products);
            coupon.dataValues.products = products;
        }

        return coupon;
    }

    /**
     * Get all coupons
     *
     * @param {Object} options The options to get coupons
     * @param {Boolean} options.includeAssociated Include associated models
     *
     * @returns {Promise<Coupon[]>} The list of coupons
     */
    async getCoupons(
        options = {
            includeAssociated: false,
        }
    ) {
        const coupons = await Coupon.findAll({
            include: options.includeAssociated ? getIncludeOptions() : [],
        });

        return coupons;
    }

    /**
     * Get a coupon by id
     *
     * @param {String} couponID The id of the coupon to be retrieved
     * @param {Object} options The options to get the coupon
     * @param {Boolean} options.includeAssociated Include associated models
     *
     * @returns {Promise<Coupon>} The coupon
     * @throws {ResourceNotFoundError} If the coupon is not found
     */
    async getCoupon(
        couponID,
        options = {
            includeAssociated: false,
        }
    ) {
        const coupon = await Coupon.findByPk(couponID, {
            include: options.includeAssociated ? getIncludeOptions() : [],
        });

        if (!coupon) {
            throw new ResourceNotFoundError("Coupon not found");
        }

        return coupon;
    }

    /**
     * Update a coupon
     *
     * @param {String} couponID The id of the coupon to be updated
     * @param {Object} couponData The updated coupon data
     * @returns {Promise<Coupon>} The updated coupon
     * @throws {ResourceNotFoundError} If the coupon is not found
     */
    async updateCoupon(couponID, couponData) {
        const coupon = await Coupon.findByPk(couponID);

        if (!coupon) {
            throw new ResourceNotFoundError("Coupon not found");
        }

        return await coupon.update(couponData);
    }

    /**
     * Delete a coupon
     *
     * @param {String} couponID The id of the coupon to be deleted
     * @throws {ResourceNotFoundError} If the coupon is not found
     */
    async deleteCoupon(couponID) {
        const coupon = await Coupon.findByPk(couponID);

        if (!coupon) {
            throw new ResourceNotFoundError("Coupon not found");
        }

        await coupon.destroy();
    }

    /**
     * Calculate final total based on coupon
     *
     * @param {Order} order - The order.
     * @param {Coupon} coupon - The coupon.
     * @returns {Number} - The final total.
     */
    async calcFinalTotal(order, coupon) {
        if (!order) {
            return 0;
        }
        if (!coupon) {
            return order.subTotal;
        }

        let totalAmount = order.subTotal;

        if (coupon.target === "all") {
            // Calculate the total amount
            switch (coupon.discountType) {
                case "percentage":
                    totalAmount -= (coupon.discountValue / 100) * totalAmount;
                    break;
                case "fixed":
                    totalAmount -= coupon.discountValue;
                    break;
            }
        } else if (coupon.target === "single") {
            const products = order.products;
            const supportCategories = coupon.categories;

            // Get all products that are supported by the coupon
            // This includes products that are directly supported by the coupon
            // and products that are in categories supported by the coupon
            if (!coupon.products || !coupon.products.length) {
                coupon.products = [];
            }

            const supportProducts = [
                ...new Set(
                    coupon.products
                        .concat(
                            (
                                await Promise.all(
                                    supportCategories.map(async (category) => {
                                        return await productCategoryService.getProductsByAncestorCategory(
                                            category.name
                                        );
                                    })
                                )
                            ).flat()
                        )
                        .map((product) => product.productID)
                ),
            ];

            // Calculate the total amount
            for (const product of products) {
                if (supportProducts.includes(product.productID)) {
                    switch (coupon.discountType) {
                        case "percentage":
                            totalAmount -=
                                (coupon.discountValue / 100) *
                                product.price *
                                product.orderItem.quantity;
                            break;
                        case "fixed":
                            totalAmount -=
                                coupon.discountValue *
                                product.orderItem.quantity;
                            break;
                    }
                }
            }
        }

        return totalAmount;
    }

    /**
     * Apply a coupon to the order
     *
     * @param {String} couponCode The code of the coupon to be applied
     * @param {Order} order The order to apply the coupon to
     * @returns {Promise<Order>} The updated order
     * @throws {ResourceNotFoundError} If the coupon is not found or not available
     */
    async applyCoupon(order, couponCode) {
        const coupon = await Coupon.findOne({
            where: {
                code: couponCode,
                ...getAvailableOptions(),
            },
            include: getIncludeOptions(),
        });
        if (!coupon) {
            throw new ResourceNotFoundError(
                "Coupon not found or not available"
            );
        }

        // Calculate final total
        order.finalTotal = await this.calcFinalTotal(order, coupon);

        // Update order
        if (order.couponID) {
            Coupon.update(
                { timesUsed: Sequelize.literal("timesUsed - 1") },
                {
                    where: {
                        couponID: order.couponID,
                    },
                }
            );
        }
        order.couponID = coupon.couponID;
        coupon.increment("timesUsed");

        return await order.save();
    }

    /**
     * Get recommended coupons for the order
     *
     * @param {Order} order The order to get recommended coupons for
     * @returns {Promise<Coupon[]>} The list of recommended coupons
     */
    async getRecommendedCoupons(order) {
        // Products in order
        const products = order.products
            ? [...new Set(order.products.map((product) => product.productID))]
            : [];

        // Categories that contain products in the order

        const categories = flattenArray(
            await Promise.all(
                products.map(async (productID) => {
                    return productCategoryService.getProductCategoryTree(
                        productID
                    );
                })
            )
        );
        const coupons = await Coupon.findAll({
            where: {
                ...getAvailableOptions(),
                // minimumOrderAmount <= subTotal
                minimumOrderAmount: {
                    [Op.lte]: order.subTotal,
                },
            },
            include: getIncludeOptions(),
            subQuery: false,
            where: {
                [Op.or]: [
                    {
                        "$products.productID$": {
                            [Op.in]: products,
                        },
                    },
                    {
                        "$categories.name$": {
                            [Op.in]: categories,
                        },
                    },
                ],
            },
        });

        return await Promise.all(
            coupons.map(async (coupon) => {
                return {
                    coupon: coupon,
                    subTotal: order.subTotal,
                    finalTotal: await this.calcFinalTotal(order, coupon),
                };
            })
        );
    }
}

const getAvailableOptions = () => {
    return (
        {
            [Op.or]: {
                // maxUsage > timesUsed
                timesUsed: {
                    [Op.lt]: Sequelize.col("maxUsage"),
                },
                maxUsage: {
                    [Op.is]: null,
                },
            },
        },
        {
            // endDate > today
            endDate: {
                [Op.or]: {
                    [Op.gt]: new Date().setHours(0, 0, 0, 0),
                    [Op.is]: null,
                },
            },
        }
    );
};

const getIncludeOptions = () => {
    return [
        {
            model: Product,
            as: "products",
        },
        {
            model: Category,
            as: "categories",
        },
    ];
};

export default new CouponService();