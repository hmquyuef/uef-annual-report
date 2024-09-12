"use client";

import Icon from "@/components/Icon";
import Modals from "@/components/Modals";
import FormActivity from "@/components/forms/activities/FormActivity";
import {
  ActivityItem,
  AddUpdateActivityItem,
  columns,
  deleteActivities,
  getAllActivities,
  postAddActivity,
  putUpdateActivity,
} from "@/services/forms/formService";
import {
  getWorkloadTypes,
  WorkloadTypeItem,
} from "@/services/workloads/typeService";
import { capitalize, convertTimestampToDate } from "@/ultils/Utility";
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
} from "@nextui-org/react";
import { Key, useCallback, useEffect, useMemo, useState } from "react";

const Forms = () => {
  const INITIAL_VISIBLE_COLUMNS = [
    "name",
    "workloadTypeName",
    "attendance",
    "description",
  ];

  const rowsPerPage = 15;

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [workloadTypesFilter, setWorkloadTypesFilter] =
    useState<Selection>("all");
  const [workloadTypes, setWorkloadTypes] = useState<WorkloadTypeItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  type Activities = (typeof activities)[0];

  // Get all activities
  const getListActivities = async () => {
    const response = await getAllActivities();
    setActivities(response.items);
  };

  const getAllWorkloadTypes = async () => {
    const response = await getWorkloadTypes();
    setWorkloadTypes(response.items);
  };
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });

  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    Partial<ActivityItem> | undefined
  >(undefined);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredActivities = [...activities];

    if (hasSearchFilter) {
      filteredActivities = filteredActivities.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      workloadTypesFilter !== "all" &&
      Array.from(workloadTypesFilter).length !== workloadTypes.length
    ) {
      filteredActivities = filteredActivities.filter((user) =>
        Array.from(workloadTypesFilter).includes(user.name)
      );
    }

    return filteredActivities;
  }, [
    hasSearchFilter,
    filterValue,
    workloadTypesFilter,
    workloadTypes.length,
    activities,
  ]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Activities, b: Activities) => {
      const first = a[sortDescriptor.column as keyof Activities] as number;
      const second = b[sortDescriptor.column as keyof Activities] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((activity: Activities, columnKey: Key) => {
    const cellValue = activity[columnKey as keyof Activities];

    switch (columnKey) {
      case "name":
        return (
          <>
            <p
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(activity);
              }}
              className="cursor-pointer text-blue-500 font-medium"
            >
              {activity.name}
            </p>
          </>
        );
      case "workloadTypeName":
        return <h1>{activity.workloadTypeName}</h1>;
      case "attendance":
        return (
          <>
            <p>
              {activity.attendance.fromDate === activity.attendance.toDate
                ? convertTimestampToDate(activity.attendance.fromDate)
                : `${convertTimestampToDate(
                    activity.attendance.fromDate
                  )} - ${convertTimestampToDate(activity.attendance.toDate)}`}
            </p>
          </>
        );
      case "description":
        return <h1>{activity.description}</h1>;
      default:
        return String(cellValue);
    }
  }, []);

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

  const handleEdit = (activity: ActivityItem) => {
    setSelectedItem(activity);
    setMode("edit");
    setIsOpen(true);
  };

  const handleSubmit = async (formData: Partial<AddUpdateActivityItem>) => {
    try {
      if (mode === "edit" && selectedItem) {
        const response = await putUpdateActivity(
          selectedItem.id ?? "",
          formData
        );
        console.log(response);
      } else {
        await postAddActivity(formData);
      }
      await getListActivities();
      setIsOpen(false);
      setSelectedItem(undefined);
      setMode("add");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = useCallback(async () => {
    try {
      const selectedKeysArray = Array.from(selectedKeys) as string[];
      if (selectedKeysArray.length > 0) {
        await deleteActivities(selectedKeysArray);
        await getListActivities();
        setSelectedKeys(new Set());
      }
    } catch (error) {
      console.error("Error deleting selected items:", error);
    }
  }, [selectedKeys]);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-1/3 sm:max-w-[44%]"
            placeholder="Tìm kiếm hoạt động..."
            startContent={<Icon name="bx-search-alt-2" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
            color="primary"
          />
          <div className="flex gap-3">
            <Dropdown placement="bottom-start">
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<Icon name="bx-chevron-down" />}
                  variant="flat"
                >
                  Loại biểu mẫu
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={workloadTypesFilter}
                selectionMode="multiple"
                onSelectionChange={setWorkloadTypesFilter}
              >
                {workloadTypes.map((type) => (
                  <DropdownItem key={type.id} className="capitalize">
                    {capitalize(type.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              onClick={() => setIsOpen(true)}
              endContent={<Icon name="bx-plus" />}
            >
              Thêm hoạt động
            </Button>
            <Button
              className="hover:text-white"
              color="danger"
              variant="ghost"
              onClick={handleDelete}
              endContent={<Icon name="bx-trash" size={"20px"} />}
            >
              Xóa
            </Button>
          </div>
        </div>
      </div>
    );
  }, [
    filterValue,
    workloadTypes,
    workloadTypesFilter,
    handleDelete,
    onClear,
    onSearchChange,
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
    getListActivities();
  }, []);

  useEffect(() => {
    getAllWorkloadTypes();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 mt-1 mb-4">
        <Breadcrumbs key="breadcumbsForms" radius="md" variant="solid">
          <BreadcrumbItem
            href="/"
            startContent={<Icon name="bx-home" size="20px" />}
          >
            Trang chủ
          </BreadcrumbItem>
          <BreadcrumbItem
            href="/forms"
            startContent={<Icon name="bx-medal" size="20px" />}
          >
            Quản lý hoạt động
          </BreadcrumbItem>
        </Breadcrumbs>
        <Modals
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedItem(undefined);
            setMode("add");
          }}
          title={mode === "edit" ? "Cập nhật hoạt động" : "Thêm mới hoạt động"}
          size="3xl"
          actionLabel="Xác nhận"
          closeLabel="Quay lại"
          onAction={() => {
            const formElement = document.querySelector("form");
            formElement?.dispatchEvent(
              new Event("submit", { cancelable: true, bubbles: true })
            );
          }}
          bodyContent={
            <FormActivity
              onSubmit={handleSubmit}
              initialData={selectedItem}
              mode={mode}
            />
          }
        />
      </div>
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
              align={
                column.uid === "actions" || column.uid === "attendance"
                  ? "center"
                  : "start"
              }
              allowsSorting={column.sortable}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={"Không tìm thấy các hoạt động!"}
          items={sortedItems}
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
    </>
  );
};

export default Forms;
