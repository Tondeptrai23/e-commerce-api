import { Router } from "express";

import orderController from "../../../controllers/shopping/orders.controller.js";
import {
    verifyToken,
    isAdmin,
} from "../../../middlewares/authJwt.middleware.js";

import validator from "../../../validators/index.validator.js";

const adminOrderRoute = Router();

adminOrderRoute.get(
    "/orders",
    validator.validateQueryGetOrderAdmin,
    validator.handleValidationErrors,
    verifyToken,
    isAdmin,
    orderController.getOrdersAdmin
);

adminOrderRoute.get(
    "/orders/:orderID",
    verifyToken,
    isAdmin,
    orderController.getOrderAdmin
);

adminOrderRoute.put(
    "/orders/:orderID/status",
    validator.validateUpdateOrderStatus,
    validator.handleValidationErrors,
    verifyToken,
    isAdmin,
    orderController.updateOrderStatus
);

adminOrderRoute.post(
    "/orders",
    validator.validateCreateOrderAdmin,
    validator.handleValidationErrors,
    verifyToken,
    isAdmin,
    orderController.createOrderAdmin
);

export default adminOrderRoute;
