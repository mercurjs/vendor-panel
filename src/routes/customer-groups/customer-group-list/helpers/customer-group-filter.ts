import { CustomerGroupData } from '../../../orders/common/customerGroupFiltering';

export const customerGroupFilter = (
  customerGroups: CustomerGroupData[],
  order?: string,
  q?: string
) => {
  let res = customerGroups?.filter(group => group.customer_group);

  if (q) {
    res = res?.filter(group => group.customer_group?.name?.toLowerCase().includes(q.toLowerCase()));
  }

  if (order) {
    const isDesc = order.startsWith('-');
    const rawKey = isDesc ? order.slice(1) : order;

    res = [...res].sort((a, b) => {
      const aGroup = a?.customer_group;
      const bGroup = b?.customer_group;

      if (rawKey === 'name') {
        const aName = String(aGroup?.name || '');
        const bName = String(bGroup?.name || '');
        const cmp = aName.localeCompare(bName, undefined, { sensitivity: 'base' });
        return isDesc ? -cmp : cmp;
      }

      if (rawKey === 'customers') {
        const aCount = Array.isArray(aGroup?.customers) ? aGroup.customers.length : 0;
        const bCount = Array.isArray(bGroup?.customers) ? bGroup.customers.length : 0;
        const cmp = aCount - bCount;
        return isDesc ? -cmp : cmp;
      }

      return 0;
    });
  }
  return res;
};
