"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = exports.PeakRushLevel = exports.StationType = exports.PriorityLevel = exports.PaymentStatus = exports.PaymentMethod = exports.OrderType = exports.OrderStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "CUSTOMER";
    UserRole["KITCHEN_STAFF"] = "KITCHEN_STAFF";
    UserRole["KITCHEN_MANAGER"] = "KITCHEN_MANAGER";
    UserRole["DELIVERY_AGENT"] = "DELIVERY_AGENT";
    UserRole["CASHIER"] = "CASHIER";
    UserRole["INVENTORY_MANAGER"] = "INVENTORY_MANAGER";
    UserRole["CANTEEN_MANAGER"] = "CANTEEN_MANAGER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["CREATED"] = "CREATED";
    OrderStatus["PAYMENT_PENDING"] = "PAYMENT_PENDING";
    OrderStatus["PAID"] = "PAID";
    OrderStatus["QUEUED"] = "QUEUED";
    OrderStatus["ALLOCATING"] = "ALLOCATING";
    OrderStatus["ASSIGNED"] = "ASSIGNED";
    OrderStatus["ACCEPTED"] = "ACCEPTED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["QUALITY_CHECK"] = "QUALITY_CHECK";
    OrderStatus["READY"] = "READY";
    OrderStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUNDED"] = "REFUNDED";
    OrderStatus["REJECTED"] = "REJECTED";
    OrderStatus["FAILED"] = "FAILED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderType;
(function (OrderType) {
    OrderType["COUNTER_PICKUP"] = "COUNTER_PICKUP";
    OrderType["TABLE_DELIVERY"] = "TABLE_DELIVERY";
    OrderType["OFFICE_DELIVERY"] = "OFFICE_DELIVERY";
    OrderType["ROOM_DELIVERY"] = "ROOM_DELIVERY";
    OrderType["SCHEDULED"] = "SCHEDULED";
})(OrderType || (exports.OrderType = OrderType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["MOCK_UPI"] = "MOCK_UPI";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CORPORATE_SUBSIDY"] = "CORPORATE_SUBSIDY";
    PaymentMethod["WALLET"] = "WALLET";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCESS"] = "SUCCESS";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PriorityLevel;
(function (PriorityLevel) {
    PriorityLevel["LOW"] = "LOW";
    PriorityLevel["NORMAL"] = "NORMAL";
    PriorityLevel["HIGH"] = "HIGH";
    PriorityLevel["URGENT"] = "URGENT";
    PriorityLevel["VIP"] = "VIP";
})(PriorityLevel || (exports.PriorityLevel = PriorityLevel = {}));
var StationType;
(function (StationType) {
    StationType["GRILL"] = "GRILL";
    StationType["FRY"] = "FRY";
    StationType["BEVERAGE"] = "BEVERAGE";
    StationType["SOUTH_INDIAN"] = "SOUTH_INDIAN";
    StationType["NORTH_INDIAN"] = "NORTH_INDIAN";
    StationType["BAKERY"] = "BAKERY";
    StationType["PACKING"] = "PACKING";
    StationType["DISPATCH"] = "DISPATCH";
})(StationType || (exports.StationType = StationType = {}));
var PeakRushLevel;
(function (PeakRushLevel) {
    PeakRushLevel["LOW"] = "LOW";
    PeakRushLevel["MEDIUM"] = "MEDIUM";
    PeakRushLevel["HIGH"] = "HIGH";
    PeakRushLevel["CRITICAL"] = "CRITICAL";
})(PeakRushLevel || (exports.PeakRushLevel = PeakRushLevel = {}));
exports.SOCKET_EVENTS = {
    ORDER_CREATED: 'order:created',
    ORDER_QUEUED: 'order:queued',
    ORDER_ASSIGNED: 'order:assigned',
    ORDER_ACCEPTED: 'order:accepted',
    ORDER_PREPARING: 'order:preparing',
    ORDER_PROGRESS: 'order:progress',
    ORDER_READY: 'order:ready',
    ORDER_OUT_FOR_DELIVERY: 'order:out_for_delivery',
    ORDER_DELIVERED: 'order:delivered',
    ORDER_COMPLETED: 'order:completed',
    ORDER_CANCELLED: 'order:cancelled',
    QUEUE_UPDATED: 'queue:updated',
    QUEUE_PREDICTION: 'queue:prediction',
    KITCHEN_LOAD: 'kitchen:load',
    KITCHEN_ASSIGNMENT: 'kitchen:assignment',
    INVENTORY_LOW: 'inventory:low',
    NOTIFICATION_NEW: 'notification:new',
    AI_RECOMMENDATION: 'ai:recommendation'
};
