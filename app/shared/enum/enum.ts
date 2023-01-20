export enum OrderStatus {
  NEW = "NEW",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  DELIVERY = "DELIVERY",
  DELIVERED = "DELIVERED",
  ERROR = "ERROR",
}

export enum PaymentType {
  CARD = "CARD",
  BLIK = "BLIK",
  CASH = "CASH",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  FINISHED = "FINISHED",
}

export enum UserRole {
  CLIENT = "CLIENT",
  COOK = "COOK",
  MANAGER = "MANAGER",
  DELIVERY = "DELIVERY",
}

export enum Intent {
  INVENTORY = "INVENTORY",
  ORDERS_LIST = "ORDERS_LIST",
  CHANGE_ORDER_STATUS = "CHANGE_ORDER_STATUS",
}
