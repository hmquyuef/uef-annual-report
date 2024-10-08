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
  Chip,
  Input,
  Link,
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

import { getDataExportById } from "@/services/exports/exportService";
import { saveAs } from "file-saver";
import { Key, useCallback, useEffect, useMemo, useState } from "react";
import * as XLSX from "sheetjs-style";

const Forms = () => {
  type Activities = (typeof activities)[0];
  const INITIAL_VISIBLE_COLUMNS = [
    "stt",
    "workloadTypeName",
    "name",
    "attendance",
    "determination",
    "number",
    "determinationsTime",
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
      filteredActivities = filteredActivities.filter(
        (activity) =>
          activity.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          activity.documentNumber
            ?.toLowerCase()
            .includes(filterValue.toLowerCase())
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
      case "stt":
        return (
          <>
            <p>{activity.stt}</p>
          </>
        );
      case "name":
        return (
          <>
            <p
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(activity);
              }}
              className={`cursor-pointer font-medium text-start ${
                activity.determinations.file.path === "" ||
                activity.determinations.file.path === undefined
                  ? "text-orange-500"
                  : "text-blue-500"
              }`}
            >
              {activity.name}
            </p>
          </>
        );
      case "workloadTypeName":
        return (
          <div className="text-start">
            <h1>{activity.workloadTypeName}</h1>
          </div>
        );
      case "determinationsTime":
        return (
          <>
            <p>
              {activity.determinations.entryDate
                ? convertTimestampToDate(activity.determinations.entryDate)
                : ""}
            </p>
          </>
        );
      case "attendance":
        return (
          <>
            <p>
              {activity.determinations.fromDate
                ? convertTimestampToDate(activity.determinations.fromDate)
                : ""}
            </p>
          </>
        );
      case "determination":
        return (
          <>
            {activity.determinations.file.path !== undefined &&
            activity.determinations.file.path !== "" ? (
              <>
                <Link
                  href={`${
                    "https://api-annual.uef.edu.vn/" +
                    activity.determinations.file.path
                  }`}
                  target="__blank"
                  size="sm"
                >
                  <Icon
                    name="bx-check"
                    size="20px"
                    className="text-green-600"
                  />
                </Link>
              </>
            ) : (
              <>
                <Icon name="bx-x" size="20px" className="text-orange-500" />
              </>
            )}
          </>
        );
      case "number":
        return (
          <>
            {activity.documentNumber && (
              <>
                <Chip color="primary" variant="flat">
                  {activity.documentNumber}
                </Chip>
              </>
            )}
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

  const handleExportExcel = useCallback(async () => {
    const results = await getDataExportById(
      "b46ee628-bfe3-4d27-a10b-9d0c47145613"
    );
    if (results) {
      const defaultInfo = [
        ["", "", "", "", "", "", "", "", "", "", "", "", "BM-05"],
        [
          "TRƯỜNG ĐẠI HỌC KINH TẾ - TÀI CHÍNH",
          "",
          "",
          "",
          "",
          "",
          "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
        ],
        [
          "THÀNH PHỐ HỒ CHÍ MINH",
          "",
          "",
          "",
          "",
          "",
          "Độc lập - Tự do - Hạnh phúc",
        ],
        ["(ĐƠN VỊ)", "", "", ""],
        ["TỔNG HỢP DANH SÁCH"],
        [
          "Tham gia Ban tổ chức các hoạt động báo cáo chuyên đề, Hội thảo khoa học; Các cuộc thi học thuật; Hướng dẫn/hỗ trợ sinh viên tham gia các cuộc thi, … được BĐH phê duyệt tiết chuẩn",
        ],
        [""], // Dòng 9 để trống
      ];

      const defaultFooterInfo = [
        ["Ghi chú:"],
        [
          "- Mã số CB-GV-NV yêu cầu cung cấp phải chính xác. Đơn vị có thể tra cứu Mã CB-GV-NV trên trang Portal UEF.",
        ],
        ["- Biểu mẫu này dành cho các khoa, viện, Phòng Đào tạo."],
        [
          "- Photo Tờ trình, Kế hoạch đã được BĐH phê duyệt tiết chuẩn nộp về VPT. Các trường hợp không được phê duyệt hoặc đã thanh toán thù lao thì không đưa vào biểu mẫu này.",
        ],
        [
          "- Mỗi cá nhân có thể có nhiều dòng dữ liệu tương ứng với các hoạt động đã thực hiện... được BĐH phê duyệt tiết chuẩn.",
        ],
        [
          "- Việc quy đổi tiết chuẩn căn cứ theo Phụ lục III, Quyết định số 720/QĐ-UEF ngày 01 tháng 9 năm 2023.								",
        ],
        [""],
        ["", "LÃNH ĐẠO ĐƠN VỊ", "", "", "", "", "", "", "", "NGƯỜI LẬP"],
      ];

      const dataArray = [
        [
          "STT",
          "Mã số CBGVNV",
          "Họ và chữ lót",
          "Tên",
          "Đơn vị",
          "Tên hoạt động đã thực hiện",
          "",
          "",
          "",
          "Số tiết chuẩn được BGH phê duyệt",
          "Minh chứng",
          "",
          "Ghi chú",
        ], // Tên cột ở dòng 10
        ...results.data.map((item, index) => [
          index + 1,
          item.userName,
          item.middleName,
          item.firstName,
          item.faculityName,
          item.activityName,
          "",
          "",
          "",
          item.standNumber,
          item.determination,
          "",
          item.note,
        ]),
      ];

      const combinedData = [...defaultInfo, ...dataArray];
      const combinedFooterData = [...combinedData, ...defaultFooterInfo];
      const worksheet = XLSX.utils.aoa_to_sheet(combinedFooterData);
      worksheet["!pageSetup"] = {
        paperSize: 9,
        orientation: "landscape",
        scale: 100,
        fitToWidth: 1,
        fitToHeight: 0,
        fitToPage: true,
      };
      worksheet["!margins"] = {
        left: 0.1,
        right: 0.1,
        top: 0.1,
        bottom: 0.1,
        header: 0,
        footer: 0,
      };
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      // Thiết lập chiều cao của hàng 6 (ô đã merge) thành 40 pixel
      worksheet["!rows"] = [];
      worksheet["!rows"][5] = { hpx: 40 }; // Chiều cao hàng thứ 6 là 40 pixel
      worksheet["!cols"] = [];
      worksheet["!cols"][0] = { wch: 4 };
      worksheet["!cols"][1] = { wch: 20 };
      worksheet["!cols"][2] = { wch: 20 };
      worksheet["!cols"][4] = { wch: 13 };
      worksheet["M1"].s = {
        fill: {
          fgColor: { rgb: "FFFF00" },
        },
        font: {
          name: "Times New Roman",
          sz: 11,
        },
        alignment: {
          wrapText: true,
          vertical: "center",
          horizontal: "center",
        },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
      worksheet["A2"].s = {
        font: {
          name: "Times New Roman",
          sz: 11,
        },
        alignment: {
          wrapText: true,
          vertical: "center",
          horizontal: "center",
        },
      };
      worksheet["G2"].s = {
        font: {
          name: "Times New Roman",
          sz: 11,
          bold: true,
        },
        alignment: {
          wrapText: true,
          vertical: "center",
          horizontal: "center",
        },
      };
      worksheet["A3"].s = {
        font: {
          name: "Times New Roman",
          sz: 11,
        },
        alignment: {
          wrapText: true,
          vertical: "center",
          horizontal: "center",
        },
      };
      worksheet["G3"].s = {
        font: {
          name: "Times New Roman",
          sz: 11,
          bold: true,
        },
        alignment: {
          wrapText: true,
          vertical: "center",
          horizontal: "center",
        },
      };
      worksheet["A4"].s = {
        font: {
          name: "Times New Roman",
          sz: 11,
          bold: true,
        },
        alignment: {
          wrapText: true,
          vertical: "center",
          horizontal: "center",
        },
      };
      worksheet["A5"].s = {
        font: {
          name: "Times New Roman",
          sz: 15,
          bold: true,
        },
        alignment: {
          wrapText: true,
          vertical: "center",
          horizontal: "center",
        },
      };
      worksheet["A6"].s = {
        font: {
          name: "Times New Roman",
          sz: 13,
          bold: true,
        },
        alignment: {
          wrapText: true,
          vertical: "center",
          horizontal: "center",
        },
      };
      // Merge các ô từ A6 đến M6
      worksheet["!merges"] = [];
      const temp = [];
      const range = XLSX.utils.decode_range(worksheet["!ref"]!);
      for (let row = 7; row <= results.data.length + 7; row++) {
        temp.push(
          { s: { r: row, c: 5 }, e: { r: row, c: 8 } },
          { s: { r: row, c: 10 }, e: { r: row, c: 11 } }
        );
        worksheet["!rows"][row + 1] = { hpx: 45 };
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          if (worksheet[cellRef]) {
            worksheet[cellRef].s = {
              font: {
                name: "Times New Roman",
                sz: 11,
                bold:
                  row === 7 || col === 1 || col === 2 || col === 3 || col === 4
                    ? true
                    : false,
              },
              alignment: {
                wrapText: true,
                vertical: "center",
                horizontal:
                  row > 7 &&
                  (col === 1 ||
                    col === 2 ||
                    col === 3 ||
                    col === 4 ||
                    col === 5)
                    ? "left"
                    : "center",
              },
              border: {
                top: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
                bottom: { style: "thin" },
              },
            };
          }
        }
      }

      const defaultMerges = [
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
        { s: { r: 1, c: 6 }, e: { r: 1, c: 12 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
        { s: { r: 2, c: 6 }, e: { r: 2, c: 12 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } },
        { s: { r: 4, c: 0 }, e: { r: 4, c: 12 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: 12 } },
        {
          s: { r: results.data.length + 15, c: 1 },
          e: { r: results.data.length + 15, c: 2 },
        },
        {
          s: { r: results.data.length + 15, c: 9 },
          e: { r: results.data.length + 15, c: 10 },
        },
      ];
      for (
        let row = results.data.length + 8;
        row < results.data.length + 14;
        row++
      ) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = {
            font: {
              name: "Times New Roman",
              sz: 11,
            },
          };
        }
      }
      const cellNote = XLSX.utils.encode_cell({
        r: results.data.length + 9,
        c: 0,
      });
      const cellHeadUnit = XLSX.utils.encode_cell({
        r: results.data.length + 15,
        c: 1,
      });
      const cellPersionCreate = XLSX.utils.encode_cell({
        r: results.data.length + 15,
        c: 9,
      });
      worksheet[`${cellNote}`].s = {
        font: {
          name: "Times New Roman",
          sz: 11,
          bold: true,
        },
      };
      worksheet[`${cellHeadUnit}`].s = {
        font: {
          name: "Times New Roman",
          sz: 11,
          bold: true,
        },
        alignment: {
          vertical: "center",
          horizontal: "center",
        },
      };
      worksheet[`${cellPersionCreate}`].s = {
        font: {
          name: "Times New Roman",
          sz: 11,
          bold: true,
        },
        alignment: {
          vertical: "center",
          horizontal: "center",
        },
      };
      worksheet["!merges"].push(...defaultMerges, ...temp);
      // Xuất file Excel
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, "0")}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${now.getFullYear()}-${String(
        now.getHours()
      ).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
      saveAs(blob, "BM05-" + formattedDate + ".xlsx");
    }
  }, []);

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
              color="success"
              onClick={handleExportExcel}
              className="text-white"
              startContent={<Icon name="bx-file" size="20px" />}
            >
              Xuất Excel
            </Button>
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
    handleExportExcel,
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
              numberActivity={activities.length}
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
                column.uid === "stt" ||
                column.uid === "workloadTypeName" ||
                column.uid === "name" ||
                column.uid === "determination" ||
                column.uid === "determinationsTime" ||
                column.uid === "number" ||
                column.uid === "attendance"
                  ? "center"
                  : "start"
              }
            >
              {column.label.toUpperCase()}
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
            <TableRow key={item.id} className="border-b-1">
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
