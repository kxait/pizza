import { Intent, UserRole } from "./enum/enum";

export const RoleAllowedIntents: { [key: string]: Intent[] } = {
  [UserRole.CLIENT]: [],
  [UserRole.COOK]: [
    Intent.ORDERS_LIST,
    Intent.CHANGE_ORDER_STATUS,
    Intent.COOK_SCREEN,
  ],
  [UserRole.DELIVERY]: [Intent.ORDERS_LIST, Intent.DELIVERY_SCREEN],
  [UserRole.MANAGER]: [
    Intent.ORDERS_LIST,
    Intent.INVENTORY,
    Intent.CHANGE_ORDER_STATUS,
  ],
};
