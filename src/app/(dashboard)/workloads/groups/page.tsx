"use client";

import FormGroup from "@/components/forms/workloads/FormGroup";
import Icon from "@/components/Icon";
import Modals from "@/components/Modals";
import SweetAlert from "@/components/sweetAlert/SweetAlert";
import {
  AddWordloadGroup,
  columns,
  deleteWorkloadGroup,
  getWorkloadGroups,
  postAddWorkloadGroup,
  putUpdateWorkloadGroup,
  WorkloadGroupItem,
} from "@/services/workloads/groupService";
import { convertTimestampToDate } from "@/ultils/Utility";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Chip,
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

const WorkloadGroup = () => {
  type WorkloadGroupType = (typeof workloadGroups)[0];
  const [selectedItem, setSelectedItem] = useState<
    Partial<WorkloadGroupItem> | undefined
  >(undefined);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [workloadGroups, setWorkloadGroups] = useState<WorkloadGroupItem[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [filterValue, setFilterValue] = useState("");
  const visibleColumns = useMemo(() => {
    const INITIAL_VISIBLE_COLUMNS = [
      "name",
      "description",
      "creationTime",
      "isActive",
    ];
    return new Set(INITIAL_VISIBLE_COLUMNS);
  }, []);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [titleAlert, setTitleAlert] = useState("");
  const [contentAlert, setContentAlert] = useState("");
  const [statusAlert, setStatusAlert] = useState<
    "add" | "update" | "delete" | "error" | "info" | ""
  >("");

  const getAllWorkloadGroups = async () => {
    const response = await getWorkloadGroups();
    setWorkloadGroups(response.items);
  };

  const handleCloseAlert = useCallback(() => {
    setAlertOpen(false);
  }, []);

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
    let filteredProvinces = [...workloadGroups];

    if (hasSearchFilter) {
      filteredProvinces = filteredProvinces.filter((workloadGroup) =>
        workloadGroup.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredProvinces;
  }, [workloadGroups, filterValue, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: WorkloadGroupType, b: WorkloadGroupType) => {
      const first = a[
        sortDescriptor.column as keyof WorkloadGroupType
      ] as string;
      const second = b[
        sortDescriptor.column as keyof WorkloadGroupType
      ] as string;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (workloadGroup: WorkloadGroupType, columnKey: Key) => {
      const cellValue = workloadGroup[columnKey as keyof WorkloadGroupType];
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
            // <Button
            //   color="primary"
            //   onClick={() => handleEdit(workloadGroup)}
            //   variant="bordered"
            // >
            //   {workloadGroup.name}
            // </Button>
          );
        case "description":
          return <p>{workloadGroup.description}</p>;
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
          onChange={(page) => setPage(page)}
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
    filteredItems.length,
    page,
    pages,
    onNextPage,
    onPreviousPage,
  ]);

  const handleSubmit = async (formData: Partial<AddWordloadGroup>) => {
    try {
      if (mode === "edit" && selectedItem) {
        const response = await putUpdateWorkloadGroup(
          selectedItem.id ?? "",
          formData
        );
        if (response) {
          setAlertOpen(true);
          setStatusAlert("update");
          setTitleAlert("Cập nhật nhóm công tác thành công!");
          setContentAlert("");
        }
      } else {
        const response = await postAddWorkloadGroup(formData);
        if (response) {
          setAlertOpen(true);
          setStatusAlert("add");
          setTitleAlert("Thêm nhóm công tác thành công!");
          setContentAlert("");
        }
      }
      await getAllWorkloadGroups();
      setIsOpen(false);
      setSelectedItem(undefined);
      setMode("add");
    } catch (error) {
      setStatusAlert("error");
      setTitleAlert("Đã xảy ra lỗi, vui lòng thử lại sau!");
      setContentAlert("");
    }
  };

  const handleEdit = (item: WorkloadGroupItem) => {
    setSelectedItem(item);
    setMode("edit");
    setIsOpen(true);
  };

  const handleDelete = async () => {
    try {
      const selectedKeysArray = Array.from(selectedKeys) as string[];
      if (selectedKeysArray.length > 0) {
        await deleteWorkloadGroup(selectedKeysArray);
        setAlertOpen(true);
        setStatusAlert("delete");
        setTitleAlert("Xóa nhóm công tác thành công!");
        setContentAlert(`Đã xóa ${selectedKeysArray.length} nhóm công tác!`);
        await getAllWorkloadGroups();
        setSelectedKeys(new Set());
      }
    } catch (error) {
      console.error("Error deleting selected items:", error);
    }
  };

  useEffect(() => {
    getAllWorkloadGroups();
  }, []);

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  return (
    <>
      <div className="flex flex-col gap-4 mt-1">
        <Breadcrumbs key="breadcumbsForms" radius="md" variant="solid">
          <BreadcrumbItem
            href="/"
            startContent={<Icon name="bx-home" size="20px" />}
          >
            Trang chủ
          </BreadcrumbItem>
          <BreadcrumbItem
            href="/workloads/groups"
            startContent={<Icon name="bx-file" size="20px" />}
          >
            Quản lý nhóm công tác
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
            <Button
              color="primary"
              onClick={() => setIsOpen(true)}
              endContent={<Icon name="bx-plus" color="white" size={"20px"} />}
            >
              Thêm mới
            </Button>
            <Button
              className="hover:text-white"
              isDisabled={Array.from(selectedKeys).length === 0}
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
          Số dòng dữ liệu: {workloadGroups.length}
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
        <Modals
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedItem(undefined);
            setMode("add");
          }}
          title={
            mode === "edit"
              ? "Cập nhật nhóm công tác"
              : "Thêm mới nhóm công tác"
          }
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
            <FormGroup
              onSubmit={handleSubmit}
              initialData={selectedItem}
              mode={mode}
            />
          }
        />
        <SweetAlert
          open={alertOpen}
          status={statusAlert}
          title={<>{titleAlert}</>}
          content={<>{contentAlert}</>}
          onClose={handleCloseAlert}
          confirmButtonText="Xác nhận"
          isSuccess={true}
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

export default WorkloadGroup;
