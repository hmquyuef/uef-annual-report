"use client";

import Icon from "@/components/Icon";
import Loading from "@/components/Loading";
import Modals from "@/components/Modals";
import FormActivity from "@/components/forms/activities/FormActivity";
import SweetAlert from "@/components/sweetAlert/SweetAlert";
import {
  ActivityInput,
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
import { convertTimestampToDate } from "@/ultils/Utility";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
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
  type Activities = (typeof activities)[0];
  const INITIAL_VISIBLE_COLUMNS = [
    "name",
    "workloadTypeName",
    "attendance",
    "description",
  ];
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [workloadTypesFilter] = useState<Selection>("all");
  const [workloadTypes, setWorkloadTypes] = useState<WorkloadTypeItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    Partial<AddUpdateActivityItem> | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const hasSearchFilter = Boolean(filterValue);
  const [alertOpen, setAlertOpen] = useState(false);
  const [titleAlert, setTitleAlert] = useState("");
  const [contentAlert, setContentAlert] = useState("");
  const [statusAlert, setStatusAlert] = useState<
    "add" | "update" | "delete" | "error" | "info" | ""
  >("");
  // Get all activities
  const getListActivities = async () => {
    setLoading(true);
    const response = await getAllActivities();
    setActivities(response.items);
    setLoading(false);
  };

  const getAllWorkloadTypes = async () => {
    const response = await getWorkloadTypes();
    setWorkloadTypes(response.items);
  };

  const handleCloseAlert = useCallback(() => {
    setAlertOpen(false);
  }, []);

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
    const updatedActivity: Partial<AddUpdateActivityItem> = {
      ...activity,
      participants: activity.participants.map((participant) => ({
        ...participant,
        unitName: participant.unitName.toString(),
        userName: participant.userName, // Ensure userName is included
      })),
    };
    setSelectedItem(updatedActivity);
    setMode("edit");
    setIsOpen(true);
  };

  const handleSubmit = async (formData: Partial<AddUpdateActivityItem>) => {
    try {
      if (mode === "edit" && selectedItem) {
        const updatedFormData: Partial<AddUpdateActivityItem> = {
          ...formData,
          participants: formData.participants as ActivityInput[],
        };
        const response = await putUpdateActivity(
          formData.id as string,
          updatedFormData
        );
        if (response) {
          setAlertOpen(true);
          setStatusAlert("update");
          setTitleAlert("Cập nhật hoạt động thành công!");
          setContentAlert("");
        }
      } else {
        const newFormData: Partial<AddUpdateActivityItem> = {
          ...formData,
          participants: formData.participants as ActivityInput[],
        };
        const response = await postAddActivity(newFormData);
        if (response) {
          setAlertOpen(true);
          setStatusAlert("add");
          setTitleAlert("Thêm hoạt động thành công!");
          setContentAlert("");
        }
      }
      await getListActivities();
      setIsOpen(false);
      setSelectedItem(undefined);
      setMode("add");
    } catch (error) {
      setStatusAlert("error");
      setTitleAlert("Đã xảy ra lỗi, vui lòng thử lại sau!");
      setContentAlert("");
    }
  };

  const handleDelete = useCallback(async () => {
    try {
      const selectedKeysArray = Array.from(selectedKeys) as string[];
      if (selectedKeysArray.length > 0) {
        await deleteActivities(selectedKeysArray);
        setAlertOpen(true);
        setStatusAlert("delete");
        setTitleAlert("Xóa hoạt động thành công!");
        setContentAlert(`Đã xóa ${selectedKeysArray.length} hoạt động!`);
        await getListActivities();
        setSelectedKeys(new Set());
      }
    } catch (error) {
      console.error("Error deleting selected items:", error);
    }
  }, [selectedKeys]);

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const topContent = useMemo(() => {
    return (
      <div className="w-full flex flex-col justify-between items-center gap-3">
        <div className="w-full flex justify-between items-center gap-3 mb-1">
          <Input
            isClearable
            className="w-1/4"
            placeholder="Tìm kiếm hoạt động..."
            startContent={<Icon name="bx-search-alt-2" size="20px" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
            color="primary"
          />
          <div className="flex gap-3">
            <Button
              color="primary"
              onClick={() => setIsOpen(true)}
              endContent={<Icon name="bx-plus" />}
            >
              Thêm hoạt động
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
          {/* <div className="grid grid-cols-2 gap-3"> */}
          {/* <Dropdown placement="bottom-start">
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
            </Dropdown> */}

          {/* </div> */}
        </div>
        <div className="w-full flex flex-row justify-between items-center gap-3 mb-2">
          <span className="text-default-400 text-small">
            Số dòng dữ liệu: {activities.length}
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
    activities.length,
    selectedKeys,
    onRowsPerPageChange,
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
        {page !== 1 && (
          <>
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
          </>
        )}
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
  }, [onRowsPerPageChange]);

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
            // const temp =
            //   selectedItem?.determinations?.pathImg?.replace(
            //     "http://192.168.98.60:8081/",
            //     ""
            //   ) ?? "";
            // if (temp !== "") {
            //   await deleteFiles(temp);
            // }
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
              initialData={selectedItem as Partial<AddUpdateActivityItem>}
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
          isLoading={loading}
          loadingContent={<Loading isOpen={loading} />}
          emptyContent={"Không tìm thấy các hoạt động!"}
          items={sortedItems}
        >
          {(item: ActivityItem) => (
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
