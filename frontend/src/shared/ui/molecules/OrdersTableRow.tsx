import React from "react";
import { TableRowItem, TableCell } from "./TableRowItem";
import { ProductCell } from "./ProductCell";
import { Badge } from "../atoms/Badge";
import { Order } from "@/shared/types/order";

interface OrdersTableRowProps {
  /** Order data */
  order: Order;
  /** Row click handler */
  onRowClick?: (order: Order) => void;
  /** Show checkbox */
  showCheckbox?: boolean;
  /** Checkbox checked state */
  checked?: boolean;
  /** Checkbox change handler */
  onCheckedChange?: (checked: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'Delivered':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Canceled':
      return 'error';
    default:
      return 'gray';
  }
};

const getStatusText = (status: Order['status']) => {
  switch (status) {
    case 'Delivered':
      return 'Доставлено';
    case 'Pending':
      return 'В ожидании';
    case 'Canceled':
      return 'Отменено';
    default:
      return status;
  }
};

export const OrdersTableRow: React.FC<OrdersTableRowProps> = ({
  order,
  onRowClick,
  showCheckbox = false,
  checked = false,
  onCheckedChange,
  className = '',
}) => {
  const handleOrderSelection = (checked: boolean) => {
    onCheckedChange?.(checked);
  };

  return (
    <TableRowItem
      onClick={() => onRowClick?.(order)}
      hoverable
      showCheckbox={showCheckbox}
      checked={checked}
      onCheckedChange={handleOrderSelection}
      className={className}
    >
      <TableCell className="py-3">
        <ProductCell
          imageUrl={order.image}
          title={order.name}
          description={order.variants}
          imageSize="sm"
          layout="horizontal"
        />
      </TableCell>
      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
        {order.category}
      </TableCell>
      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
        {order.price}
      </TableCell>
      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
        <Badge size="sm" color={getStatusColor(order.status)} variant="default">
          {getStatusText(order.status)}
        </Badge>
      </TableCell>
    </TableRowItem>
  );
};

export default OrdersTableRow;
