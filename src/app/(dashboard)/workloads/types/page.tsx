"use client";

import FormType from "@/components/forms/workloads/FormType";
import Icon from "@/components/Icon";
import Modals from "@/components/Modals";
import { getWorkloadGroups } from "@/services/workloads/groupService";
import {
  AddUpdateWorkloadType,
  columns,
  deleteWorkloadTypes,
  getWorkloadTypes,
  postAddWorkloadType,
  putUpdateWorkloadType,
  WorkloadTypeItem,
} from "@/services/workloads/typeService";
import { capitalize, convertTimestampToDate } from "@/ultils/Utility";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Chip,
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

interface WorkloadGroupProps {
  id: string;
  name: string;
  isActived: boolean;
}

const WorkloadType = () => {
  // Remove the type alias and directly use (typeof workloadTypes)[0]
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [selectedItem, setSelectedItem] = useState<
    Partial<WorkloadTypeItem> | undefined
  >(undefined);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [workloadTypes, setWorkloadTypes] = useState<WorkloadTypeItem[]>([]);
  const getAllWorkloadTypes = async () => {
    const response = await getWorkloadTypes();
    setWorkloadTypes(response.items);
  };
  const getAllWorkloadGroups = async () => {
    const response = await getWorkloadGroups();
    setWorkloadGroupItem(response.items);
  };
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [workloadGroupsFilter, setWorkloadGroupsFilter] =
    useState<Selection>("all");
  const [workloadGroupItem, setWorkloadGroupItem] = useState<
    WorkloadGroupProps[]
  >([]);

  const statusOptions = [
    { name: "Đang kích hoạt", uid: "true", isActived: true },
    { name: "Tạm khóa", uid: "false", isActived: false },
  ];

  const visibleColumns = useMemo(() => {
    const INITIAL_VISIBLE_COLUMNS = [
      "name",
      "groupName",
      "creationTime",
      "isActive",
    ];
    return new Set(INITIAL_VISIBLE_COLUMNS);
  }, []);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const [isOpen, setIsOpen] = useState(false);
  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredWorkloadGroups = [...workloadTypes];

    if (hasSearchFilter) {
      filteredWorkloadGroups = filteredWorkloadGroups.filter((workloadGroup) =>
        workloadGroup.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredWorkloadGroups = filteredWorkloadGroups.filter((workloadGroup) =>
        Array.from(statusFilter).includes(workloadGroup.isActived.toString())
      );
    }

    if (
      workloadGroupsFilter !== "all" &&
      Array.from(workloadGroupsFilter).length !== workloadGroupItem.length
    ) {
      filteredWorkloadGroups = filteredWorkloadGroups.filter((workloadGroup) =>
        Array.from(workloadGroupsFilter).includes(workloadGroup.workloadGroupId)
      );
    }

    return filteredWorkloadGroups;
  }, [
    workloadTypes,
    filterValue,
    hasSearchFilter,
    statusFilter,
    statusOptions.length,
    workloadGroupsFilter,
    workloadGroupItem.length,
  ]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: WorkloadTypeItem, b: WorkloadTypeItem) => {
      const first = a[
        sortDescriptor.column as keyof WorkloadTypeItem
      ] as string;
      const second = b[
        sortDescriptor.column as keyof WorkloadTypeItem
      ] as string;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (workloadGroup: WorkloadTypeItem, columnKey: Key) => {
      const cellValue = workloadGroup[columnKey as keyof WorkloadTypeItem];
      switch (columnKey) {
        case "name":
          return (
            <p
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(workloadGroup);
              }}
              className="cursor-pointer text-blue-500 font-medium"
            >
              {workloadGroup.name}
            </p>
          );
        case "groupName":
          return <p>{workloadGroup.groupName}</p>;
        case "creationTime":
          return <p>{convertTimestampToDate(workloadGroup.creationTime)}</p>;
        case "isActive":
          return (
            <Chip
              color={`${workloadGroup.isActived ? "success" : "danger"}`}
              variant="flat"
            >
              {workloadGroup.isActived ? "Đang kích hoạt" : "Tạm khóa"}
            </Chip>
          );
        default:
          return cellValue;
      }
    },
    []
  );

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

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const handleSubmit = async (formData: Partial<AddUpdateWorkloadType>) => {
    try {
      if (mode === "edit" && selectedItem) {
        const response = await putUpdateWorkloadType(
          selectedItem.id ?? "",
          formData
        );
        console.log(response);
      } else {
        await postAddWorkloadType(formData);
      }
      await getAllWorkloadTypes();
      setIsOpen(false);
      setSelectedItem(undefined);
      setMode("add");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleEdit = (item: WorkloadTypeItem) => {
    setSelectedItem(item);
    setMode("edit");
    setIsOpen(true);
  };

  const handleDelete = async () => {
    try {
      const selectedKeysArray = Array.from(selectedKeys) as string[];
      if (selectedKeysArray.length > 0) {
        await deleteWorkloadTypes(selectedKeysArray);
        await getAllWorkloadTypes();
        setSelectedKeys(new Set());
      }
    } catch (error) {
      console.error("Error deleting selected items:", error);
    }
  };

  useEffect(() => {
    getAllWorkloadTypes();
    getAllWorkloadGroups();
  }, []);
  return (
    <>
      <div className="flex flex-col gap-4 mt-1">
        <Breadcrumbs key="breadcumbsWorkloadTypes" radius="md" variant="solid">
          <BreadcrumbItem
            href="/"
            startContent={<Icon name="bx-home" size="20px" />}
          >
            Trang chủ
          </BreadcrumbItem>
          <BreadcrumbItem
            href="/workloads/types"
            startContent={<Icon name="bx-file" size="20px" />}
          >
            Quản lý biểu mẫu
          </BreadcrumbItem>
        </Breadcrumbs>
        <div className="flex justify-between gap-3">
          <Input
            isClearable
            className="w-1/4 sm:max-w-[44%]"
            placeholder="Tìm kiếm nhóm công tác..."
            startContent={<Icon name="bx-search-alt-2" />}
            value={filterValue}
            onClear={onClear}
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
                  Nhóm công tác
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Trạng thái"
                closeOnSelect={false}
                selectedKeys={workloadGroupsFilter}
                selectionMode="multiple"
                onSelectionChange={setWorkloadGroupsFilter}
              >
                {workloadGroupItem.map((group) => (
                  <DropdownItem key={group.id}>{group.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown placement="bottom-start">
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<Icon name="bx-chevron-down" />}
                  variant="flat"
                >
                  Trạng thái
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Trạng thái"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              onClick={() => setIsOpen(true)}
              endContent={<Icon name="bx-plus" color="white" size={"20px"} />}
            >
              Thêm mới
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
        <div className="flex justify-between items-center mb-6">
          <span className="text-default-400 text-small">
            Total {workloadTypes.length} item
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
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
        <Modals
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedItem(undefined);
            setMode("add");
          }}
          title={mode === "edit" ? "Cập nhật công tác" : "Thêm mới công tác"}
          size="md"
          actionLabel="Xác nhận"
          closeLabel="Quay lại"
          onAction={() => {
            const formElement = document.querySelector("form");
            formElement?.dispatchEvent(
              new Event("submit", { cancelable: true, bubbles: true })
            );
          }}
          bodyContent={
            <FormType
              onSubmit={handleSubmit}
              initialData={selectedItem}
              mode={mode}
            />
          }
        />
      </div>
      <Table
        aria-label="Danh sách nhóm công tác"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "h-fit",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={
                column.uid === "countryCode"
                  ? "center"
                  : column.uid === "isActive"
                  ? "center"
                  : "start"
              }
              allowsSorting={column.sortable}
              className="text-sm"
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={"Không có dữ liệu về nhóm công tác"}
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

export default WorkloadType;
