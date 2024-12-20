import { body, query, header } from "express-validator";
import {
    validateInteger,
    validateMinValue,
    validateNumber,
    validateUnexpectedFields,
    validateQueryNumber,
    validateSortingQuery,
    sanitizeSortingQuery,
    validateQueryInteger,
    validateQueryString,
    validateQueryDate,
} from "../utils.validator.js";
import variantService from "../../services/products/variant.service.js";

const validateDiscountPrice = (value) => {
    if (value.price && value.discountPrice > value.price) {
        throw new Error("Discount price should be less than or equal to price");
    }
    return true;
};

const validateCreateVariants = [
    body()
        .if(
            header("Content-Type").custom((value) => {
                return value.includes("multipart/form-data");
            })
        )
        .customSanitizer((value) => {
            return {
                variants: JSON.parse(value.variants),
            };
        }),

    body("variants")
        .notEmpty()
        .withMessage("Variants is required")
        .isArray()
        .withMessage("Variants should be an array")
        .custom((value) => {
            if (value.length === 0) {
                throw new Error("Variants should have at least one item");
            }
            return true;
        }),

    body("variants.*.name")
        .optional()
        .isString()
        .withMessage("Name should be a string"),

    // Validate variant price
    body("variants.*.price")
        .notEmpty()
        .withMessage("Price is required")
        .custom(validateNumber("Price"))
        .custom(validateMinValue("Price", 0)),

    // Validate variant discount price
    body("variants.*.discountPrice")
        .optional()
        .custom(validateNumber("Discount price"))
        .custom(validateMinValue("Discount price", 0)),

    // Validate variant stock
    body("variants.*.stock")
        .notEmpty()
        .withMessage("Stock is required")
        .custom(validateInteger("Stock"))
        .custom(validateMinValue("Stock", 0)),

    // Validate variant sku
    body("variants.*.sku")
        .notEmpty()
        .withMessage("SKU is required")
        .isString()
        .withMessage("SKU should be a string"),

    // Validate variant attributes
    body("variants.*.attributes")
        .optional()
        .isObject()
        .withMessage("Attributes should be an object"),

    // Validate variant image order
    body("variants.*.imageIndex")
        .optional()
        .custom(validateInteger("Image index"))
        .custom(validateMinValue("Image index", 0)),

    // Validate variant discount price compare to price
    body("variants.*")
        .custom(validateDiscountPrice)
        .custom(async (value, { req }) => {
            if (value.discountPrice && !value.price) {
                let variant;
                try {
                    variant = await variantService.getVariant(
                        req.params.variantID
                    );
                } catch (err) {
                    // If variant is not found, skip the validation
                    return true;
                }

                if (value.discountPrice > variant.price) {
                    throw new Error(
                        "Discount price should be less than or equal to price"
                    );
                }
            }
            return true;
        }),

    // Validate unexpected fields
    body("variants.*").custom(
        validateUnexpectedFields([
            "name",
            "price",
            "stock",
            "sku",
            "imageIndex",
            "discountPrice",
            "attributes",
        ])
    ),
];

const validatePatchVariant = [
    body("name").optional().isString().withMessage("Name should be a string"),

    body("price").optional().custom(validateNumber("Price")),

    body("stock")
        .optional()
        .custom(validateInteger("Stock"))
        .custom(validateMinValue("Stock", 0)),

    body("sku").optional().isString().withMessage("SKU should be a string"),

    body("imageID")
        .optional()
        .isString()
        .withMessage("ImageID should be a string"),

    body("discountPrice")
        .optional()
        .custom(validateNumber("Discount price"))
        .custom(validateMinValue("Discount price", 0)),

    body().custom(validateDiscountPrice),

    body().custom(
        validateUnexpectedFields([
            "name",
            "price",
            "stock",
            "sku",
            "imageID",
            "discountPrice",
        ])
    ),
];

const validatePutVariant = [
    body("name").optional().isString().withMessage("Name should be a string"),

    body("stock")
        .notEmpty()
        .withMessage("Stock is required")
        .custom(validateInteger("Stock"))
        .custom(validateMinValue("Stock", 0)),

    body("price")
        .notEmpty()
        .withMessage("Price is required")
        .custom(validateNumber("Price"))
        .custom(validateMinValue("Price", 0)),

    body("sku")
        .notEmpty()
        .withMessage("SKU is required")
        .isString()
        .withMessage("SKU should be a string"),

    body("imageID")
        .optional()
        .isString()
        .withMessage("ImageID should be a string"),

    body("discountPrice")
        .optional()
        .custom(validateNumber("Discount price"))
        .custom(validateMinValue("Discount price", 0)),

    body("attributes")
        .optional()
        .isObject()
        .withMessage("Attributes should be an object"),

    body().custom(validateDiscountPrice),

    body().custom(
        validateUnexpectedFields([
            "name",
            "stock",
            "price",
            "sku",
            "imageID",
            "discountPrice",
            "attributes",
        ])
    ),
];

const validateQueryGetVariant = [
    query("page").optional().custom(validateQueryInteger("Page")),

    query("size").optional().custom(validateQueryInteger("Size")),

    query("sort")
        .optional()
        .customSanitizer(sanitizeSortingQuery)
        .custom(
            validateSortingQuery([
                "variantID",
                "productID",
                "price",
                "name",
                "discountPrice",
                "stock",
                "createdAt",
                "updatedAt",
                "deletedAt",
            ])
        ),

    query("variantID").optional().custom(validateQueryString("VariantID")),

    query("name").optional().custom(validateQueryString("Name")),

    query("price").optional().custom(validateQueryNumber("Price")),

    query("discountPrice")
        .optional()
        .custom(validateQueryNumber("Discount price")),

    query("stock").optional().custom(validateQueryNumber("Stock")),

    query("sku").optional().custom(validateQueryString("SKU")),

    query("productID").optional().custom(validateQueryString("ProductID")),

    query("updatedAt").optional().custom(validateQueryDate("UpdatedAt")),

    query("createdAt").optional().custom(validateQueryDate("CreatedAt")),

    query("deletedAt").optional().custom(validateQueryDate("DeletedAt")),

    query("attributes")
        .optional()
        .isObject()
        .withMessage("Attributes should be an object"),
];

const validatePostVariantQuantity = [
    body("quantity")
        .notEmpty()
        .withMessage("Quantity is required")
        .custom(validateInteger("Quantity"))
        .custom(validateMinValue("Quantity", 1)),
];

export {
    validateCreateVariants,
    validatePutVariant,
    validatePatchVariant,
    validateQueryGetVariant,
    validatePostVariantQuantity,
};
