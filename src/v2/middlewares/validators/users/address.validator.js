import { body } from "express-validator";
import { validateUnexpectedFields } from "../utils.validator.js";

const validateCreateAddress = [
    body("address").notEmpty().withMessage("Address is required"),

    body("city").notEmpty().withMessage("City is required"),

    body("district").notEmpty().withMessage("District is required"),

    body("recipientName").notEmpty().withMessage("Recipient Name is required"),

    body("phoneNumber").notEmpty().withMessage("Phone Number is required"),

    body().custom(
        validateUnexpectedFields([
            "address",
            "city",
            "district",
            "recipientName",
            "phoneNumber",
        ])
    ),
];

const validatePutAddress = [
    body("address").notEmpty().withMessage("Address is required"),

    body("city").notEmpty().withMessage("City is required"),

    body("district").notEmpty().withMessage("District is required"),

    body("recipientName").notEmpty().withMessage("Recipient Name is required"),

    body("phoneNumber").notEmpty().withMessage("Phone Number is required"),

    body("isDefault")
        .optional()
        .isBoolean()
        .withMessage("isDefault should be a boolean"),

    body().custom(
        validateUnexpectedFields([
            "address",
            "city",
            "district",
            "recipientName",
            "phoneNumber",
        ])
    ),
];

export { validateCreateAddress, validatePutAddress };
