import { Intent, UserRole } from "./enum/enum";

export const RoleAllowedIntents: { [key: string]: Intent[] } = {
  [UserRole.CLIENT]: [],
  [UserRole.COOK]: [
    Intent.ORDERS_LIST,
    Intent.CHANGE_ORDER_STATUS,
    Intent.COOK_SCREEN,
  ],
  [UserRole.DELIVERY]: [
    Intent.ORDERS_LIST,
    Intent.DELIVERY_SCREEN,
    Intent.CHANGE_ORDER_STATUS,
  ],
  [UserRole.MANAGER]: [
    Intent.ORDERS_LIST,
    Intent.INVENTORY,
    Intent.COOK_SCREEN,
    Intent.DELIVERY_SCREEN,
    Intent.CHANGE_ORDER_STATUS,
  ],
};
