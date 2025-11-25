export const roleEnum = {
    Customer: 0,
    Staff: 2,
    Admin: 3
}

export const routes = [
  {
    title: 'Tổng quan',
    path: '/admin',
    exactly: true,
    permissions: [roleEnum.Staff, roleEnum.Admin]

  },
  {
    title: 'Quản lý sách',
    path: '/admin/book',
    subMenu: [
       {
        title: 'Thêm sách mới',
        path: '/admin/book/add',
       },
       {
        title: 'Quản lý tác giả',
        path: '/admin/author',
      },
    ],
    permissions: [roleEnum.Staff, roleEnum.Admin]
  },
  {
    title: 'Quản lý đơn hàng',
    path: '/admin/order',
    permissions: [roleEnum.Staff, roleEnum.Admin]
  },
  {
    title: 'Mã giảm giá',
    path: '/admin/voucher',
    permissions: [roleEnum.Staff, roleEnum.Admin]
  },
  {
    title: 'Khách hàng',
    path: '/admin/customer',
    permissions: [roleEnum.Staff, roleEnum.Admin]
  },
  {
    title: 'Nhân viên',
    path: '/admin/staff',
    permissions: [roleEnum.Admin]
  },
];