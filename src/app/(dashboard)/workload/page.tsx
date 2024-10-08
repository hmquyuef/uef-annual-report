"use client";
import { Key, useCallback, useEffect, useMemo, useState } from "react";
import Icon from "@/components/Icon";
import Loading from "@/components/Loading";
import { getAllUnits, UnitItem } from "@/services/units/unitsService";
import {
  columnsUserActivities,
  getUsersActivities,
  UserActivity,
} from "@/services/users/userService";
import {
  Avatar,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Selection,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import Link from "next/link";
const INITIAL_VISIBLE_COLUMNS = ["name", "email", "unitName", "activitiesIds"];
const Workload = () => {
  const [page, setPage] = useState(1);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  type User = (typeof userActivities)[0];
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [loading, setLoading] = useState(false);
  const [visibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  // const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columnsUserActivities;

    return columnsUserActivities.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...userActivities];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.userName.toLowerCase().includes(filterValue.toLowerCase()) ||
          user.fullName.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredUsers;
  }, [userActivities, filterValue, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const renderCell = useCallback((user: User, columnKey: Key) => {
    const cellValue = user[columnKey as keyof User];
    switch (columnKey) {
      case "name":
        return (
          <Link href={`workload/${user.id}`}>
            <div className="flex gap-2 items-center">
              <Avatar
                alt={user.userName}
                className="flex-shrink-0"
                size="sm"
                src="avatar.jpg"
              />
              <div className="flex flex-col">
                <span className="text-small text-blue-600">
                  {user.fullName}
                </span>
                <span className="text-tiny text-default-400">
                  {user.userName}
                </span>
              </div>
            </div>
          </Link>
        );
      case "email":
        return <div>{user.email}</div>;
      case "unitName":
        return <div>{user.unitName}</div>;
      case "activitiesIds":
        return <div>{user.activitiesIds.length.toString()}</div>;
      default:
        return cellValue;
    }
  }, []);

  const getAllUserActivities = async () => {
    setLoading(true);
    const response = await getUsersActivities("");
    setUserActivities(response.items);
    setLoading(false);
  };

  const getListUnits = async () => {
    const response = await getAllUnits();
    setUnits(response.items);
  };

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Button color="success" endContent={<Icon name="bx-exclude" size="20px"/>}>
            Xuất
          </Button>
          <Input
            isClearable
            className="w-1/4"
            placeholder="Tìm kiếm bằng mã nhân viên..."
            startContent={<Icon name="bx-search-alt-2" size="20px" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
            color="primary"
          />
          <div className="flex gap-3">
            <Dropdown placement="bottom-end">
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<Icon name="bx-chevron-down" size="20px" />}
                  variant="flat"
                >
                  Đơn vị
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                onScroll={(e) => e.stopPropagation()}
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                // selectedKeys={statusFilter}
                selectionMode="multiple"
                // onSelectionChange={setStatusFilter}
              >
                {units.map((unit) => (
                  <DropdownItem key={unit.id}>{unit.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            {/* <Button
              color="primary"
              endContent={<Icon name="bx-plus" size="20px" />}
            >
              Add New
            </Button> */}
          </div>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-default-400 text-small">
            Số dòng dữ liệu: {userActivities.length}
          </span>
          <label className="flex items-center text-default-400 text-small">
            Tổng số dòng/trang:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    onClear,
    onSearchChange,
    onRowsPerPageChange,
    userActivities,
    units,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          initialPage={1}
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Trang trước
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Trang sau
          </Button>
        </div>
      </div>
    );
  }, [
    selectedKeys,
    page,
    pages,
    filteredItems.length,
    onNextPage,
    onPreviousPage,
  ]);

  useEffect(() => {
    getAllUserActivities();
    getListUnits();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 mt-1">
        <Breadcrumbs key="breadcumbsWorkloadTypes" radius="md" variant="solid">
          <BreadcrumbItem
            href="/workloads/types"
            startContent={<Icon name="bx-file" size="20px" />}
          >
            Quá trình công tác
          </BreadcrumbItem>
        </Breadcrumbs>
        <Table
          aria-label="Example table with custom cells, pagination and sorting"
          isHeaderSticky
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          classNames={{
            wrapper: "h-fit",
          }}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement="outside"
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "activitiesIds" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.label.toUpperCase()}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            isLoading={loading}
            loadingContent={<Loading isOpen={loading} />}
            emptyContent={"No users found"}
            items={items}
          >
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default Workload;
