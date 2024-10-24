import couponService from "../../../../services/shopping/coupon.service.js";
import seedData from "../../../../seedData.js";
import {
    BadRequestError,
    ResourceNotFoundError,
} from "../../../../utils/error.js";
import Order from "../../../../models/shopping/order.model.js";
import orderService from "../../../../services/shopping/order.service.js";
import Coupon from "../../../../models/shopping/coupon.model.js";
import Product from "../../../../models/products/product.model.js";
import { jest } from "@jest/globals";
import { OptimisticLockError } from "sequelize";
import { db } from "../../../../models/index.model.js";

beforeAll(async () => {
    await seedData();
});

afterAll(async () => {
    await db.close();
});

describe("getCoupons", () => {
    test("Get all coupons", async () => {
        const { coupons } = await couponService.getCoupons();

        expect(coupons).toBeDefined();
        expect(Array.isArray(coupons)).toBe(true);
        expect(coupons.length).toBeGreaterThan(0);
    });

    //Filtering coupons
    test("Get all coupons with filtering", async () => {
        const { coupons } = await couponService.getCoupons({
            discountType: "percentage",
        });

        expect(coupons).toBeDefined();
        expect(Array.isArray(coupons)).toBe(true);
        expect(coupons.length).toBeGreaterThan(0);
        expect(
            coupons.every((coupon) => coupon.discountType === "percentage")
        ).toBe(true);
    });

    test("Get all coupons with filtering 2", async () => {
        const { coupons } = await couponService.getCoupons({
            discountType: "fixed",
            discountValue: "[gte]10",
        });

        expect(coupons).toBeDefined();
        expect(Array.isArray(coupons)).toBe(true);
        expect(coupons.length).toBeGreaterThan(0);
        expect(
            coupons.every(
                (coupon) =>
                    coupon.discountType === "fixed" &&
                    coupon.discountValue >= 10
            )
        ).toBe(true);
    });

    test("Get all coupons with filtering 3", async () => {
        const { coupons } = await couponService.getCoupons({
            product: {
                name: "[like]T-shirt",
            },
        });

        expect(coupons).toBeDefined();
        expect(Array.isArray(coupons)).toBe(true);
        expect(coupons.length).toBeGreaterThan(0);
        for (const coupon of coupons) {
            expect(
                coupon.products.some((product) =>
                    product.name.toLowerCase().includes("t-shirt")
                )
            ).toBe(true);
        }
    });

    test("Get all coupons with filtering 4", async () => {
        const { coupons } = await couponService.getCoupons({
            category: ["tops"],
        });

        expect(coupons).toBeDefined();
        expect(Array.isArray(coupons)).toBe(true);
        expect(coupons.length).toBeGreaterThan(0);

        for (const coupon of coupons) {
            const categoryNames = coupon.categories.map(
                (category) => category.name
            );
            expect(
                categoryNames.some(
                    (name) =>
                        name === "tops" ||
                        name === "blouse" ||
                        name === "tshirt"
                )
            ).toBe(true);
        }
    });

    test("Get all coupons with filtering 5", async () => {
        const { coupons } = await couponService.getCoupons({
            product: {
                productID: ["1", "2"],
            },
            categories: ["shorts"],
        });

        expect(coupons).toBeDefined();
        expect(Array.isArray(coupons)).toBe(true);
        expect(coupons.length).toBeGreaterThan(0);

        for (const coupon of coupons) {
            const productIDs = coupon.products.map(
                (product) => product.productID
            );

            const categoryNames = coupon.categories.map(
                (category) => category.name
            );
            expect(
                categoryNames.some((name) => name === "shorts") ||
                    productIDs.some((id) => id === "1" || id === "2")
            ).toBe(true);
        }
    });

    //Sorting coupons
    test("Get all coupons with sorting", async () => {
        const { coupons } = await couponService.getCoupons({
            sort: ["discountValue"],
        });

        expect(coupons).toBeDefined();
        expect(Array.isArray(coupons)).toBe(true);
        expect(coupons.length).toBeGreaterThan(0);

        const sortedCoupons = [...coupons].sort(
            (a, b) => a.discountValue - b.discountValue
        );
        expect(coupons).toEqual(sortedCoupons);
    });

    test("Get all coupons with sorting 2", async () => {
        const { coupons } = await couponService.getCoupons({
            sort: ["-discountValue", "createdAt"],
        });

        expect(coupons).toBeDefined();
        expect(Array.isArray(coupons)).toBe(true);
        expect(coupons.length).toBeGreaterThan(0);

        const sortedCoupons = [...coupons].sort(
            (a, b) =>
                b.discountValue - a.discountValue || a.createdAt - b.createdAt
        );
        expect(coupons).toEqual(sortedCoupons);
    });

    //Filtering and sorting coupons
    test("Get all coupons with filtering and sorting", async () => {
        const { coupons } = await couponService.getCoupons({
            discountType: "percentage",
            sort: ["discountValue"],
        });

        expect(coupons).toBeDefined();
        expect(Array.isArray(coupons)).toBe(true);
        expect(coupons.length).toBeGreaterThan(0);
        expect(
            coupons.every((coupon) => coupon.discountType === "percentage")
        ).toBe(true);

        const sortedCoupons = [...coupons].sort(
            (a, b) => a.discountValue - b.discountValue
        );
        expect(coupons).toEqual(sortedCoupons);
    });

    //Pagination for coupons
    test("Get all coupons with pagination", async () => {
        const { coupons, currentPage, totalPages, totalItems } =
            await couponService.getCoupons({
                page: 1,
                size: 5,
            });

        expect(coupons).toBeDefined();
        expect(Array.isArray(coupons)).toBe(true);
        expect(coupons.length).toBeLessThanOrEqual(5);
        expect(currentPage).toBe(1);
        expect(totalPages).toBeGreaterThan(0);
        expect(totalItems).toBeGreaterThan(0);
    });

    test("Get all coupons with pagination 2", async () => {
        const { coupons, currentPage, totalPages, totalItems } =
            await couponService.getCoupons({
                page: 2,
                size: 3,
            });

        expect(coupons).toBeDefined();
        expect(Array.isArray(coupons)).toBe(true);
        expect(coupons.length).toBeLessThanOrEqual(5);
        expect(currentPage).toBe(2);
        expect(totalPages).toBeGreaterThan(0);
        expect(totalItems).toBeGreaterThan(0);
    });

    test("Get all coupons with pagination 3", async () => {
        const { coupons, currentPage, totalPages, totalItems } =
            await couponService.getCoupons();

        expect(coupons).toBeDefined();
        expect(Array.isArray(coupons)).toBe(true);
        expect(coupons.length).toBeLessThanOrEqual(5);
        expect(currentPage).toBe(1);
        expect(totalPages).toBeGreaterThan(0);
        expect(totalItems).toBeGreaterThan(0);
    });

    //Combining filtering, sorting, and pagination
    test("Get all coupons with filtering, sorting, and pagination", async () => {
        const { coupons, currentPage, totalPages, totalItems } =
            await couponService.getCoupons({
                discountType: "percentage",
                sort: ["discountValue"],
                page: 1,
                size: 2,
            });

        expect(coupons).toBeDefined();
        expect(Array.isArray(coupons)).toBe(true);
        expect(coupons.length).toBeLessThanOrEqual(2);
        expect(currentPage).toBe(1);
        expect(totalPages).toBeGreaterThan(0);
        expect(totalItems).toBeGreaterThan(0);
        expect(
            coupons.every((coupon) => coupon.discountType === "percentage")
        ).toBe(true);

        const sortedCoupons = [...coupons].sort(
            (a, b) => a.discountValue - b.discountValue
        );
        expect(coupons).toEqual(sortedCoupons);
    });
});

describe("getCoupon", () => {
    test("Get a specific coupon by ID", async () => {
        const couponID = "1";

        const coupon = await couponService.getCoupon(couponID);

        expect(coupon).toBeDefined();
        expect(coupon.couponID).toBe(couponID);
    });

    test("Get a specific coupon by ID with associated models", async () => {
        const couponID = "1";

        const coupon = await couponService.getCoupon(couponID, {
            includeAssociated: true,
        });

        expect(coupon).toBeDefined();
        expect(coupon.couponID).toBe(couponID);
        expect(coupon.categories).toBeDefined();
        expect(Array.isArray(coupon.categories)).toBe(true);
        expect(coupon.products).toBeDefined();
        expect(Array.isArray(coupon.products)).toBe(true);
    });

    test("Get a specific coupon by ID throws error if not found", async () => {
        const couponID = "999";

        await expect(couponService.getCoupon(couponID)).rejects.toThrow(
            ResourceNotFoundError
        );
    });
});

describe("createCoupon", () => {
    test("Create a new coupon", async () => {
        const couponData = {
            code: "SUMMER20",
            discountType: "percentage",
            discountValue: 10,
            minimumOrderAmount: 20,
            timesUsed: 0,
            maxUsage: 10,
            target: "all",
            startDate: new Date("2024/8/1"),
            endDate: new Date("2024/7/12"),
        };

        const createdCoupon = await couponService.createCoupon(couponData);

        expect(createdCoupon).toBeDefined();
        expect(createdCoupon.code).toBe(couponData.code);
        expect(createdCoupon.discountType).toBe(couponData.discountType);
        expect(createdCoupon.discountValue).toBe(couponData.discountValue);
        expect(createdCoupon.minimumOrderAmount).toBe(
            couponData.minimumOrderAmount
        );
        expect(createdCoupon.timesUsed).toBe(couponData.timesUsed);
        expect(createdCoupon.maxUsage).toBe(couponData.maxUsage);
    });

    test("Create a new coupon with categories", async () => {
        const couponData = {
            code: "SUMMER21",
            discountType: "percentage",
            discountValue: 10,
            minimumOrderAmount: 20,
            timesUsed: 0,
            maxUsage: 10,
            target: "all",
            startDate: new Date("2024/8/1"),
            endDate: new Date("2024/7/12"),
            categories: ["tops", "male"],
        };

        const createdCoupon = await couponService.createCoupon(couponData);

        expect(createdCoupon).toBeDefined();
        expect(createdCoupon.code).toBe(couponData.code);
        expect(createdCoupon.discountType).toBe(couponData.discountType);
        expect(createdCoupon.discountValue).toBe(couponData.discountValue);
        expect(createdCoupon.minimumOrderAmount).toBe(
            couponData.minimumOrderAmount
        );
        expect(createdCoupon.timesUsed).toBe(couponData.timesUsed);
        expect(createdCoupon.maxUsage).toBe(couponData.maxUsage);
        expect(createdCoupon.categories).toBeDefined();
        expect(Array.isArray(createdCoupon.categories)).toBe(true);
        expect(createdCoupon.categories.length).toBeGreaterThan(0);
    });

    test("Create a new coupon with products", async () => {
        const couponData = {
            code: "SUMMER22",
            discountType: "percentage",
            discountValue: 10,
            minimumOrderAmount: 20,
            timesUsed: 0,
            maxUsage: 10,
            target: "all",
            startDate: new Date("2024/8/1"),
            endDate: new Date("2024/7/12"),
            products: ["1", "2"],
        };

        const createdCoupon = await couponService.createCoupon(couponData);

        expect(createdCoupon).toBeDefined();
        expect(createdCoupon.code).toBe(couponData.code);
        expect(createdCoupon.discountType).toBe(couponData.discountType);
        expect(createdCoupon.discountValue).toBe(couponData.discountValue);
        expect(createdCoupon.minimumOrderAmount).toBe(
            couponData.minimumOrderAmount
        );
        expect(createdCoupon.timesUsed).toBe(couponData.timesUsed);
        expect(createdCoupon.maxUsage).toBe(couponData.maxUsage);
        expect(createdCoupon.products).toBeDefined();
        expect(Array.isArray(createdCoupon.products)).toBe(true);
        expect(createdCoupon.products.length).toBeGreaterThan(0);
    });

    test("Create a new coupon with null fields", async () => {
        const couponData = {
            code: "SUMMER23",
            discountType: "percentage",
            discountValue: 10,
            minimumOrderAmount: 20,
            timesUsed: 0,
            maxUsage: 10,
            target: "all",
            startDate: new Date("2024/8/1"),
            endDate: new Date("2024/7/12"),
            categories: null,
            products: null,
        };

        const createdCoupon = await couponService.createCoupon(couponData);

        expect(createdCoupon).toBeDefined();
        expect(createdCoupon.code).toBe(couponData.code);
        expect(createdCoupon.discountType).toBe(couponData.discountType);
        expect(createdCoupon.discountValue).toBe(couponData.discountValue);
        expect(createdCoupon.minimumOrderAmount).toBe(
            couponData.minimumOrderAmount
        );
        expect(createdCoupon.timesUsed).toBe(couponData.timesUsed);
        expect(createdCoupon.maxUsage).toBe(couponData.maxUsage);
        expect(createdCoupon.categories).toBeUndefined();
        expect(createdCoupon.products).toBeUndefined();
    });

    test("Should not create a new coupon if something goes wrong", async () => {
        const couponData = {
            code: "SUMMER24",
            discountType: "percentage",
            discountValue: 10,
            minimumOrderAmount: 20,
            timesUsed: 0,
            maxUsage: 10,
            target: "all",
            startDate: new Date("2024/8/1"),
            endDate: new Date("2024/7/12"),
            products: ["1", "2"],
        };

        // Mock Coupon.create()
        jest.spyOn(Product, "findAll").mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        try {
            await couponService.createCoupon(couponData);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        jest.restoreAllMocks();

        const createdCoupon = await Coupon.findOne({
            where: { code: "SUMMER24" },
        });
        expect(createdCoupon).toBeNull();
    });
});

describe("updateCoupon", () => {
    test("Update a coupon", async () => {
        const couponID = "1";
        const updatedCouponData = {
            code: "SUMMER20",
            discountType: "percentage",
            discountValue: 10,
            minimumOrderAmount: 20,
        };

        const updatedCoupon = await couponService.updateCoupon(
            couponID,
            updatedCouponData
        );

        expect(updatedCoupon).toBeDefined();
        expect(updatedCoupon.couponID).toBe(couponID);
        expect(updatedCoupon.code).toBe(updatedCouponData.code);
        expect(updatedCoupon.discountType).toBe(updatedCouponData.discountType);
        expect(updatedCoupon.discountValue).toBe(
            updatedCouponData.discountValue
        );
        expect(updatedCoupon.minimumOrderAmount).toBe(
            updatedCouponData.minimumOrderAmount
        );
    });

    test("Update a coupon throws error if not found", async () => {
        const couponID = "999";
        const updatedCouponData = {
            code: "SUMMER20",
            discountType: "percentage",
            discountValue: 10,
            minimumOrderAmount: 20,
        };

        await expect(
            couponService.updateCoupon(couponID, updatedCouponData)
        ).rejects.toThrow(ResourceNotFoundError);
    });
});

describe("disableCoupon", () => {
    test("disable a coupon", async () => {
        const couponID = "9";

        await couponService.disableCoupon(couponID);

        const disabledCoupon = await Coupon.findByPk(couponID);
        expect(disabledCoupon).toBeDefined();
        expect(disabledCoupon.maxUsage).toBe(0);
    });

    test("disable a coupon throws error if not found", async () => {
        const couponID = "999";

        await expect(couponService.disableCoupon(couponID)).rejects.toThrow(
            ResourceNotFoundError
        );
    });
});

describe("calcFinalTotal", () => {
    test("Calculate final total based on all-target, percentage-typed coupon", async () => {
        const order = {
            subTotal: 50,
            products: [
                {
                    variantID: "101",
                    productID: "1",
                    orderItem: {
                        priceAtPurchase: 10,
                        quantity: 1,
                    },
                },
                {
                    variantID: "201",
                    productID: "2",
                    orderItem: {
                        priceAtPurchase: 20,
                        quantity: 2,
                    },
                },
            ],
        };

        const coupon = {
            discountType: "percentage",
            discountValue: 10,
            target: "all",
        };

        const finalTotal = await couponService.calcFinalTotal(order, coupon);

        expect(finalTotal).toBeDefined();
        expect(finalTotal).toEqual(45);
    });

    test("Calculate final total based on single-target, percentage-typed coupon", async () => {
        const order = {
            subTotal: 50,
            products: [
                {
                    variantID: "101",
                    productID: "1",
                    orderItem: {
                        priceAtPurchase: 10,
                        quantity: 1,
                    },
                },
                {
                    variantID: "201",
                    productID: "2",
                    orderItem: {
                        priceAtPurchase: 20,
                        quantity: 2,
                    },
                },
            ],
        };

        const coupon = {
            discountType: "percentage",
            discountValue: 10,
            target: "single",
            categories: [
                {
                    name: "shorts",
                },
            ],
        };

        const finalTotal = await couponService.calcFinalTotal(order, coupon);

        expect(finalTotal).toBeDefined();
        expect(finalTotal).toEqual(46);
    });

    test("Calculate final total based on single-target, percentage-typed coupon 2", async () => {
        const order = {
            subTotal: 41,
            products: [
                {
                    variantID: "101",
                    productID: "1",
                    orderItem: {
                        priceAtPurchase: 10,
                        discountPriceAtPurchase: 9,
                        quantity: 1,
                    },
                },
                {
                    variantID: "201",
                    productID: "2",
                    orderItem: {
                        priceAtPurchase: 20,
                        discountPriceAtPurchase: 16,
                        quantity: 2,
                    },
                },
            ],
        };

        const coupon = {
            discountType: "percentage",
            discountValue: 10,
            target: "single",
            categories: [
                {
                    name: "shorts",
                },
            ],
        };

        const finalTotal = await couponService.calcFinalTotal(order, coupon);

        expect(finalTotal).toBeDefined();
        expect(finalTotal).toEqual(37.8);
    });

    test("Calculate final total based on all-target, fixed-typed coupon", async () => {
        const order = {
            subTotal: 50,
            products: [
                {
                    variantID: "101",
                    productID: "1",
                    orderItem: {
                        priceAtPurchase: 10,
                        quantity: 1,
                    },
                },
                {
                    variantID: "201",
                    productID: "2",
                    orderItem: {
                        priceAtPurchase: 20,
                        quantity: 2,
                    },
                },
            ],
        };

        const coupon = {
            discountType: "fixed",
            discountValue: 10,
            target: "all",
        };

        const finalTotal = await couponService.calcFinalTotal(order, coupon);

        expect(finalTotal).toBeDefined();
        expect(finalTotal).toEqual(40);
    });

    test("Calculate final total based on single-target, fixed-typed coupon", async () => {
        const order = {
            subTotal: 50,
            products: [
                {
                    variantID: "101",
                    productID: "1",
                    orderItem: {
                        priceAtPurchase: 10,
                        quantity: 1,
                    },
                },
                {
                    variantID: "201",
                    productID: "2",
                    orderItem: {
                        priceAtPurchase: 20,
                        quantity: 2,
                    },
                },
            ],
        };

        const coupon = {
            discountType: "fixed",
            discountValue: 3,
            target: "single",
            categories: [
                {
                    name: "shorts",
                },
            ],
        };

        const finalTotal = await couponService.calcFinalTotal(order, coupon);

        expect(finalTotal).toBeDefined();
        expect(finalTotal).toEqual(44);
    });

    test("Calculate final total based on single-target, fixed-typed coupon 2", async () => {
        const order = {
            subTotal: 4100,
            products: [
                {
                    variantID: "101",
                    productID: "1",
                    orderItem: {
                        priceAtPurchase: 1000,
                        discountPriceAtPurchase: 900,
                        quantity: 1,
                    },
                },
                {
                    variantID: "201",
                    productID: "2",
                    orderItem: {
                        priceAtPurchase: 2000,
                        discountPriceAtPurchase: 1600,
                        quantity: 2,
                    },
                },
            ],
        };

        const coupon = {
            discountType: "fixed",
            discountValue: 300,
            target: "single",
            categories: [
                {
                    name: "shorts",
                },
            ],
        };

        const finalTotal = await couponService.calcFinalTotal(order, coupon);

        expect(finalTotal).toBeDefined();
        expect(finalTotal).toEqual(3500);
    });

    test("Calculate final total with maximum discount amount", async () => {
        const order = {
            subTotal: 50,
            products: [
                {
                    variantID: "101",
                    productID: "1",
                    orderItem: {
                        priceAtPurchase: 10,
                        quantity: 1,
                    },
                },
                {
                    variantID: "201",
                    productID: "2",
                    orderItem: {
                        priceAtPurchase: 20,
                        quantity: 2,
                    },
                },
            ],
        };

        const coupon = {
            discountType: "percentage",
            discountValue: 50,
            maximumDiscountAmount: 10,
            target: "all",
        };

        const finalTotal = await couponService.calcFinalTotal(order, coupon);

        expect(finalTotal).toBeDefined();
        expect(finalTotal).toEqual(40);
    });
});

describe("applyCoupon", () => {
    test("Apply a coupon to the order", async () => {
        const couponCode = "20OFF_SHORTS";
        const coupon = await Coupon.findOne({
            where: { code: couponCode },
        });
        const order = await orderService.getOrder({ userID: "1" }, "1");

        const updatedOrder = await couponService.applyCoupon(order, couponCode);

        expect(updatedOrder).toBeDefined();
        expect(updatedOrder).toBeInstanceOf(Order);
        expect(updatedOrder.orderID).toBe(order.orderID);
        expect(updatedOrder.finalTotal).toBe(5200);
        expect(updatedOrder.couponID).toBe(coupon.couponID);
        expect(updatedOrder.coupon.code).toBe(coupon.code);

        // Verify that the coupon is used
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Add a delay of 1 second

        const updatedCoupon = await Coupon.findOne({
            where: { code: couponCode },
        });
        expect(updatedCoupon.timesUsed).toBe(coupon.timesUsed + 1);
    });

    test("Apply a coupon to the order throws error if coupon or order is not found", async () => {
        const couponCode = "INVALID_COUPON";
        const order = {};
        await expect(
            couponService.applyCoupon(order, couponCode)
        ).rejects.toThrow(ResourceNotFoundError);
    });

    test("Not apply a coupon if something went wrong", async () => {
        const couponCode = "WINTER10";
        const coupon = await Coupon.findOne({
            where: { code: couponCode },
        });
        const order = await orderService.getOrder({ userID: "1" }, "1");

        // Mock order.reload()
        order.update = jest.spyOn(order, "update").mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        try {
            await couponService.applyCoupon(order, couponCode);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
        expect(order.update).toHaveBeenCalled();

        // Verify that the coupon is not used
        const updatedCoupon = await Coupon.findOne({
            where: { code: couponCode },
        });
        const updatedOrder = await Order.findByPk(order.orderID);

        expect(updatedCoupon.timesUsed).toBe(coupon.timesUsed);
        expect(updatedOrder.finalTotal).toBe(order.finalTotal);
        expect(updatedOrder.couponID).toBe(order.couponID);

        jest.restoreAllMocks();
    });
});

describe("Concurrent Apply Coupon", () => {
    let orders;
    const orderIDs = ["8", "11", "10", "7"];
    beforeAll(async () => {
        await Coupon.create({
            couponID: "123",
            code: "TESTCODE",
            discountType: "percentage",
            discountValue: 10,
            target: "all",
            maxUsage: 10,
        });

        orders = await Order.findAll({
            where: {
                orderID: orderIDs,
            },
        });
    });

    test("should apply coupon concurrently", async () => {
        // Run test
        const results = await Promise.allSettled(
            orders.map(async (order) => {
                return await couponService.applyCoupon(order, "TESTCODE");
            })
        );
        for (const result of results) {
            if (result.status === "rejected") {
                expect(result.reason).toBeInstanceOf(OptimisticLockError);
            } else {
                expect(result.value).toBeInstanceOf(Order);
            }
        }
    });

    test("Assert apply coupon", async () => {
        // Assert
        const coupon = await Coupon.findOne({
            where: { code: "TESTCODE" },
        });

        const updatedOrders = await Order.findAll({
            where: {
                orderID: orderIDs,
            },
        });

        let count = 0;
        for (let i = 0; i < orders.length; i++) {
            if (updatedOrders[i].couponID === coupon.couponID) {
                count++;
            }
        }

        expect(coupon.timesUsed).toBe(count);
    });
});

describe("Concurrent Apply Coupon 2", () => {
    let orders;
    let coupons = [];
    const orderIDs = ["8", "11", "10", "7"];
    beforeAll(async () => {
        await Coupon.update(
            {
                timesUsed: 0,
            },
            {
                where: {
                    couponID: "123",
                },
            }
        );

        orders = await Order.findAll({
            where: {
                orderID: orderIDs,
            },
        });

        for (const order of orders) {
            order.couponID = "123";
            await Coupon.increment("timesUsed", {
                where: { couponID: "123" },
            });
            await order.save();
        }

        coupons[0] = await Coupon.findOne({
            where: { code: "20OFF_SHORTS" },
        });
        coupons[1] = await Coupon.findOne({
            where: { code: "5OFF_TOPS" },
        });
        coupons[2] = await Coupon.findOne({
            where: { code: "WINTER10" },
        });
        coupons[3] = await Coupon.findOne({
            where: { code: "WINTER5" },
        });
    });
    test("should decrement old coupon usage if applying new coupon", async () => {
        // Run test
        const results = await Promise.allSettled([
            couponService.applyCoupon(orders[0], coupons[0].code),
            couponService.applyCoupon(orders[1], coupons[1].code),
            couponService.applyCoupon(orders[2], coupons[2].code),
            couponService.applyCoupon(orders[3], coupons[3].code),
        ]);
        for (const result of results) {
            if (result.status === "rejected") {
                expect(result.reason).toBeInstanceOf(OptimisticLockError);
            } else {
                expect(result.value).toBeInstanceOf(Order);
            }
        }
    });

    test("assert decrement old coupon usage", async () => {
        // Check if new coupons are applied
        const newCoupons = await Coupon.findAll({
            where: {
                code: ["20OFF_SHORTS", "5OFF_TOPS", "WINTER10", "WINTER5"],
            },
        });
        expect(
            coupons.reduce((acc, coupon) => acc + coupon.timesUsed, 0) + 1
        ).toBe(newCoupons.reduce((acc, coupon) => acc + coupon.timesUsed, 0));

        // Assert
        const coupon = await Coupon.findOne({
            where: { code: "TESTCODE" },
        });

        const updatedOrders = await Order.findAll({
            where: {
                orderID: orderIDs,
            },
        });

        let count = 0;
        for (let i = 0; i < orders.length; i++) {
            if (updatedOrders[i].couponID === coupon.couponID) {
                count++;
            }
        }

        expect(coupon.timesUsed).toBe(count);
    });
});

describe("getRecommendedCoupons", () => {
    test("Get recommended coupons for the order", async () => {
        const order = {
            subTotal: 110,
            products: [
                {
                    variantID: "101",
                    productID: "1",
                    orderItem: {
                        price: 10,
                        quantity: 1,
                    },
                },
                {
                    variantID: "201",
                    productID: "2",
                    orderItem: {
                        price: 20,
                        quantity: 2,
                    },
                },
            ],
        };

        const recommendedCoupons = await couponService.getRecommendedCoupons(
            order
        );

        expect(recommendedCoupons).toBeDefined();
        expect(Array.isArray(recommendedCoupons)).toBe(true);
        expect(recommendedCoupons[0].finalTotal).toBeLessThan(order.subTotal);
        expect(recommendedCoupons[0].coupon).toBeInstanceOf(Coupon);
    });
});
