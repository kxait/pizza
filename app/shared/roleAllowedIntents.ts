import { Intent, UserRole } from "./enum/enum";

export const RoleAllowedIntents: { [key: string]: Intent[] } = {
  [UserRole.CLIENT]: [],
  [UserRole.COOK]: [Intent.ORDERS_LIST, Intent.CHANGE_ORDER_STATUS],
  [UserRole.DELIVERY]: [Intent.ORDERS_LIST],
  [UserRole.MANAGER]: [
    Intent.ORDERS_LIST,
    Intent.INVENTORY,
    Intent.CHANGE_ORDER_STATUS,
  ],
};
