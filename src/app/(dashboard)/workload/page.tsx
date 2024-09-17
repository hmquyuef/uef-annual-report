"use client";
import { Key, useCallback, useEffect, useMemo, useState } from "react";

import Icon from "@/components/Icon";
import {
  UnitItem,
  getAllUnits,
} from "@/services/units/unitsService";
import {
  columnsUserActivities,
  getUsersActivities,
  UserActivity,
} from "@/services/users/userService";
import {
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
  User,
} from "@nextui-org/react";
import Link from "next/link";

const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "email",
  "unitName",
  "activitiesIds",
];

const Workload = () => {
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  type User = (typeof userActivities)[0];
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  // const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const rowsPerPage = 15;
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });

  const [page, setPage] = useState(1);

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
      filteredUsers = filteredUsers.filter((user) =>
        user.userName.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    // if (
    //   statusFilter !== "all" &&
    //   Array.from(statusFilter).length !== statusOptions.length
    // ) {
    //   filteredUsers = filteredUsers.filter((user) =>
    //     Array.from(statusFilter).includes(user.status)
    //   );
    // }

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
            <User
              avatarProps={{ radius: "lg", src: "avatar.jpg" }}
              description={user.userName}
              name={user.fullName}
              onClick={() => console.log("User ID: ", user.id)}
              className="cursor-pointer"
            >
              user.userName
            </User>
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
    const response = await getUsersActivities("");
    setUserActivities(response.items);
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
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
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
                  Status
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
            <Button
              color="primary"
              endContent={<Icon name="bx-plus" size="20px" />}
            >
              Add New
            </Button>
          </div>
        </div>
      </div>
    );
  }, [filterValue, onClear, onSearchChange, units]);

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
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
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
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={"No users found"} items={items}>
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
