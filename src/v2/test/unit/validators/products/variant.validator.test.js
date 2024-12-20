import validator from "../../../../validators/index.validator.js";
import { validationResult } from "express-validator";

describe("validateCreateVariants", () => {
    test("should return empty error array if all fields are valid", async () => {
        const req = {
            body: {
                variants: [
                    {
                        price: 100,
                        stock: 100,
                        sku: "example",
                        imageIndex: 0,
                        discountPrice: 90,
                    },
                    {
                        price: 100,
                        stock: 100,
                        sku: "example2",
                        imageIndex: 1,
                        discountPrice: 80,
                    },
                ],
            },
        };

        for (const validationChain of validator.validateCreateVariants) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(true);
    });

    test("should return empty error array if all fields are valid 2", async () => {
        const req = {
            headers: {
                "content-type": "multipart/form-data",
            },
            body: {
                variants: JSON.stringify([
                    {
                        price: 100,
                        stock: 100,
                        sku: "example",
                        imageIndex: 0,
                        discountPrice: 90,
                    },
                    {
                        price: 100,
                        stock: 100,
                        sku: "example2",
                        imageIndex: 1,
                        discountPrice: 80,
                    },
                ]),
            },
        };

        for (const validationChain of validator.validateCreateVariants) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(true);
    });

    test("should return errors if variants is empty array", async () => {
        const req = {
            body: {
                variants: [],
            },
        };

        for (const validationChain of validator.validateCreateVariants) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toContainEqual(
            expect.objectContaining({
                msg: "Variants should have at least one item",
            })
        );
    });

    test("should return errors if required fields are missing", async () => {
        const req = {
            body: {
                variants: [
                    {
                        stock: 100,
                        sku: "example",
                        discountPrice: 90,
                    },
                    {
                        price: 100,
                        sku: "example",
                        discountPrice: 90,
                    },
                    {
                        price: 100,
                        stock: 100,
                        discountPrice: 90,
                    },
                ],
            },
        };

        for (const validationChain of validator.validateCreateVariants) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Price is required",
                }),
                expect.objectContaining({
                    msg: "Stock is required",
                }),
                expect.objectContaining({
                    msg: "SKU is required",
                }),
            ])
        );
    });

    test("should return errors if fields are invalid types", async () => {
        const req = {
            body: {
                variants: [
                    {
                        name: 12345,
                        price: "invalid",
                        stock: -1.5,
                        sku: 12345,
                        imageIndex: [],
                        discountPrice: "invalid",
                        attributes: "invalid",
                    },
                ],
            },
        };

        for (const validationChain of validator.validateCreateVariants) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Name should be a string",
                }),
                expect.objectContaining({
                    msg: "Price should be a number",
                }),
                expect.objectContaining({
                    msg: "Stock should be an integer",
                }),
                expect.objectContaining({
                    msg: "SKU should be a string",
                }),
                expect.objectContaining({
                    msg: "Image index should be an integer",
                }),
                expect.objectContaining({
                    msg: "Discount price should be a number",
                }),
                expect.objectContaining({
                    msg: "Attributes should be an object",
                }),
            ])
        );
    });

    test("should return errors if fields are invalid values", async () => {
        const req = {
            body: {
                variants: [
                    {
                        price: -100,
                        stock: -100,
                        imageIndex: -1,
                        discountPrice: -90,
                    },
                ],
            },
        };

        for (const validationChain of validator.validateCreateVariants) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Price should be greater than or equal to 0",
                }),
                expect.objectContaining({
                    msg: "Stock should be greater than or equal to 0",
                }),
                expect.objectContaining({
                    msg: "Discount price should be greater than or equal to 0",
                }),
                expect.objectContaining({
                    msg: "Image index should be greater than or equal to 0",
                }),
            ])
        );
    });

    test("should return error if discount price is bigger than price", async () => {
        const req = {
            body: {
                variants: [
                    {
                        price: 100,
                        stock: 100,
                        sku: "example",
                        imageIndex: 0,
                        discountPrice: 120,
                    },
                ],
            },
        };

        for (const validationChain of validator.validateCreateVariants) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Discount price should be less than or equal to price",
                }),
            ])
        );
    });

    test("should return error if there are unexpected fields", async () => {
        const req = {
            body: {
                variants: [
                    {
                        price: 100,
                        stock: 100,
                        sku: "example",
                        imageIndex: 0,
                        discountPrice: 90,
                        unexpectedField: "unexpected",
                        unexpectedField2: "unexpected",
                    },
                ],
            },
        };

        for (const validationChain of validator.validateCreateVariants) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Unexpected field: unexpectedField, unexpectedField2",
                }),
            ])
        );
    });
});

describe("validatePutVariant", () => {
    test("should return empty error array if all fields are valid", async () => {
        const req = {
            body: {
                stock: 100,
                price: 100,
                sku: "example",
                imageID: "123",
                discountPrice: 90,
            },
        };

        for (const validationChain of validator.validatePutVariant) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(true);
    });

    test("should return errors if required fields are missing", async () => {
        const req = {
            body: {
                imageID: "123",
                discountPrice: 90,
            },
        };

        for (const validationChain of validator.validatePutVariant) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "SKU is required",
                }),
                expect.objectContaining({
                    msg: "Price is required",
                }),
                expect.objectContaining({
                    msg: "Stock is required",
                }),
            ])
        );
    });

    test("should return errors if fields are invalid", async () => {
        const req = {
            body: {
                name: 12345,
                stock: -10,
                price: "invalid",
                sku: 12345,
                imageID: 123,
                discountPrice: "invalid",
                attributes: [],
            },
        };

        for (const validationChain of validator.validatePutVariant) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Name should be a string",
                }),
                expect.objectContaining({
                    msg: "Stock should be greater than or equal to 0",
                }),
                expect.objectContaining({
                    msg: "Price should be a number",
                }),
                expect.objectContaining({
                    msg: "SKU should be a string",
                }),
                expect.objectContaining({
                    msg: "ImageID should be a string",
                }),
                expect.objectContaining({
                    msg: "Discount price should be a number",
                }),
                expect.objectContaining({
                    msg: "Attributes should be an object",
                }),
            ])
        );
    });

    test("should return error if discount price is bigger than price", async () => {
        const req = {
            body: {
                stock: 100,
                price: 100,
                sku: "example",
                imageID: "123",
                discountPrice: 120,
            },
        };

        for (const validationChain of validator.validatePutVariant) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Discount price should be less than or equal to price",
                }),
            ])
        );
    });

    test("should return error if there are unexpected fields", async () => {
        const req = {
            body: {
                stock: 100,
                price: 100,
                sku: "example",
                imageID: "123",
                discountPrice: 90,
                unexpectedField: "unexpected",
                unexpectedField2: "unexpected",
            },
        };

        for (const validationChain of validator.validatePutVariant) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Unexpected field: unexpectedField, unexpectedField2",
                }),
            ])
        );
    });
});

describe("validatePatchVariant", () => {
    test("should return empty error array if all fields are valid", async () => {
        const req = {
            body: {
                name: "example",
                price: 100,
                stock: 100,
                sku: "example",
                imageID: "123",
                discountPrice: 90,
            },
        };

        for (const validationChain of validator.validatePatchVariant) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(true);
    });

    test("should return errors if fields are invalid", async () => {
        const req = {
            body: {
                name: 12345,
                price: "invalid",
                stock: [],
                sku: 12345,
                imageID: 123,
                discountPrice: "invalid",
            },
        };

        for (const validationChain of validator.validatePatchVariant) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Name should be a string",
                }),
                expect.objectContaining({
                    msg: "Price should be a number",
                }),
                expect.objectContaining({
                    msg: "Stock should be an integer",
                }),
                expect.objectContaining({
                    msg: "SKU should be a string",
                }),
                expect.objectContaining({
                    msg: "ImageID should be a string",
                }),
                expect.objectContaining({
                    msg: "Discount price should be a number",
                }),
            ])
        );
    });

    test("should return error if discount price is bigger than price", async () => {
        const req = {
            body: {
                stock: 100,
                price: 100,
                sku: "example",
                imageID: "123",
                discountPrice: 120,
            },
        };

        for (const validationChain of validator.validatePatchVariant) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Discount price should be less than or equal to price",
                }),
            ])
        );
    });

    test("should return error if there are unexpected fields", async () => {
        const req = {
            body: {
                stock: 100,
                price: 100,
                sku: "example",
                imageID: "123",
                discountPrice: 90,
                unexpectedField: "unexpected",
                unexpectedField2: "unexpected",
            },
        };

        for (const validationChain of validator.validatePatchVariant) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Unexpected field: unexpectedField, unexpectedField2",
                }),
            ])
        );
    });
});

describe("validateQueryGetVariant", () => {
    test("should return empty error array if all fields are valid", async () => {
        const req = {
            query: {
                page: "1",
                size: "10",
                sort: [
                    "variantID",
                    "name",
                    "price",
                    "discountPrice",
                    "stock",
                    "productID",
                    "updatedAt",
                    "createdAt",
                    "deletedAt",
                ],
                name: "example",
                price: "100",
                discountPrice: "90",
                stock: "100",
                sku: "example",
                productID: "123",
                updatedAt: "2024-01-01",
                createdAt: "2024-01-01",
                deletedAt: "2024-01-01",
                attributes: {
                    color: "red",
                    size: "M",
                },
            },
        };

        for (const validationChain of validator.validateQueryGetVariant) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(true);
    });

    test("should return errors if fields are invalid", async () => {
        const req = {
            query: {
                variantID: ["[invalid]invalid"],
                page: "invalid",
                size: "invalid",
                sort: "invalid",
                name: "[invalid]invalid",
                price: "invalid",
                discountPrice: "invalid",
                stock: "invalid",
                sku: ["valid", "[invalid]invalid"],
                productID: "[invalid]invalid",
                updatedAt: "invalid",
                createdAt: ["01-01-2024"],
                deletedAt: "2024-01-01T00:00:00.000Z",
                attributes: "invalid",
            },
        };

        for (const validationChain of validator.validateQueryGetVariant) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Page should be a positive integer",
                }),
                expect.objectContaining({
                    msg: "Size should be a positive integer",
                }),
                expect.objectContaining({
                    msg: "Invalid sort field: invalid",
                }),
                expect.objectContaining({
                    msg: "Name should have valid string format",
                }),
                expect.objectContaining({
                    msg: "VariantID array should contain valid string formats",
                }),
                expect.objectContaining({
                    msg: "Price should have valid number format",
                }),
                expect.objectContaining({
                    msg: "Discount price should have valid number format",
                }),
                expect.objectContaining({
                    msg: "Stock should have valid number format",
                }),
                expect.objectContaining({
                    msg: "SKU array should contain valid string formats",
                }),
                expect.objectContaining({
                    msg: "ProductID should have valid string format",
                }),
                expect.objectContaining({
                    msg: "UpdatedAt should have valid date format ([operator]YYYY-MM-DD)",
                }),
                expect.objectContaining({
                    msg: "CreatedAt array should contain valid date formats ([operator]YYYY-MM-DD)",
                }),
                expect.objectContaining({
                    msg: "DeletedAt should have valid date format ([operator]YYYY-MM-DD)",
                }),
                expect.objectContaining({
                    msg: "Attributes should be an object",
                }),
            ])
        );
    });
});

describe("validatePostVariantQuantity", () => {
    test("should return empty error array if all fields are valid", async () => {
        const req = {
            body: {
                quantity: 100,
            },
        };

        for (const validationChain of validator.validatePostVariantQuantity) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(true);
    });

    test("should return errors if fields are invalid", async () => {
        const req = {
            body: {
                quantity: "invalid",
            },
        };

        for (const validationChain of validator.validatePostVariantQuantity) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Quantity should be an integer",
                }),
            ])
        );
    });

    test("should return errors if fields are invalid values", async () => {
        const req = {
            body: {
                quantity: -100,
            },
        };

        for (const validationChain of validator.validatePostVariantQuantity) {
            await validationChain.run(req);
        }
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "Quantity should be greater than or equal to 1",
                }),
            ])
        );
    });
});
