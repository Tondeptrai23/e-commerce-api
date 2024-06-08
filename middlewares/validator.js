import { body, query } from "express-validator";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

const comparisonQueryRegex = /(\[(lte|gte)\]\d+)|(\[(between)\]\d+,\d+)|(\d+)/i;

const validateUnexpectedQueryParams = (type) => {
    const allowedParams = {
        Product: ["name", "price"],
        User: ["name"],
    };

    return (value) => {
        const unexpectedParams = Object.keys(value).filter((param) => {
            return !allowedParams[type].includes(param);
        });

        if (unexpectedParams.length > 0) {
            throw new Error(
                "Unexpected query parameters: " + unexpectedParams.toString()
            );
        }

        return true;
    };
};

const validatePrice = (value) => {
    if (typeof value !== "number") {
        throw new Error("Price should be an integer");
    }
    if (value < 1000 || value > 100000000) {
        throw new Error("Price should be between 1000 and 100000000");
    }
    if (value % 1000 != 0) {
        throw new Error("Price should be divisible by 1000");
    }
    return true;
};

const validateCreateProduct = [
    body("id").optional(),

    body("name")
        .notEmpty()
        .withMessage("Name is required")
        .isString()
        .withMessage("Name should be a string"),

    body("imageURL")
        .notEmpty()
        .withMessage("ImageURL is required")
        .isURL()
        .withMessage("ImageURL should be an image URL"),

    body("description").optional().isString("Description should be a string"),

    body("price")
        .notEmpty()
        .withMessage("Price is required")
        .custom(validatePrice),
];

const validateUpdateProduct = [
    body("id").not().exists().withMessage("Id should not be provided"),

    body("name").optional().isString().withMessage("Name should be a string"),

    body("imageURL")
        .optional()
        .isURL()
        .withMessage("ImageURL should be an image URL"),

    body("description").optional().isString("Description should be a string"),

    body("price").optional().custom(validatePrice),
];

const validateRegisterUser = [
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email should be a valid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({
            min: 6,
        })
        .withMessage("Password should be longer than 6 characters"),

    body("name")
        .notEmpty()
        .withMessage("Name is required")
        .isAlphanumeric()
        .withMessage("Name should be an alphanumeric string"),

    body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["ROLE_USER", "ROLE_ADMIN"])
        .withMessage("Role should be valid"),
];

const validateSignInUser = [
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email should be a valid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({
            min: 6,
        })
        .withMessage("Password should be longer than 6 characters"),
];

const validateQuantity = body("quantity")
    .notEmpty()
    .withMessage("Quantity is required.")
    .isInt({
        min: 1,
        max: 1000,
    })
    .withMessage("Quantity should be an integer between 1 and 1000");

const validateOrder = [
    body("payment")
        .notEmpty()
        .withMessage("Payment is required")
        .isIn(["COD", "Visa", "Paypal"])
        .withMessage("Payment is invalid"),

    body("description").optional(),
];

const validateProductFilter = [
    query("name").optional().isString().withMessage("Name should be a string"),

    query("price")
        .optional()
        .custom((value) => {
            if (typeof value !== "string" && !Array.isArray(value)) {
                throw new Error("Price should be a string or array of strings");
            }

            if (typeof value === "string") {
                const searched = comparisonQueryRegex.exec(value)[0];

                if (searched !== value) {
                    throw new Error("Price has invalid format");
                }

                return true;
            }

            for (const item of value) {
                if (typeof item !== "string") {
                    throw new Error("Price array should contain only strings");
                }

                const searched = comparisonQueryRegex.exec(item)[0];
                if (searched !== item) {
                    throw new Error(
                        "Price array should contain only valid strings"
                    );
                }
            }

            return true;
        }),

    query().custom(validateUnexpectedQueryParams("Product")),
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            errors: errors.array(),
        });
    }
    next();
};

export {
    validateCreateProduct,
    validateRegisterUser,
    validateSignInUser,
    validateUpdateProduct,
    validateQuantity,
    validateOrder,
    validateProductFilter,
    handleValidationErrors,
};