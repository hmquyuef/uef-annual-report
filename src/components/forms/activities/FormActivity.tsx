"use client";

import Icon from "@/components/Icon";
import {
  ActivityInput,
  AddUpdateActivityItem,
} from "@/services/forms/formService";
import {
  columns,
  getUsersFromHRMbyId,
  UsersFromHRM,
  UsersFromHRMResponse,
} from "@/services/users/userService";
import {
  getWorkloadTypes,
  WorkloadTypeItem,
} from "@/services/workloads/typeService";
import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Button,
  DatePicker,
  Image,
  Input,
  Link,
  Select,
  Selection,
  SelectItem,
  SharedSelection,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from "@nextui-org/react";
import {
  FormEvent,
  Key,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getListUnitsFromHrm,
  UnitsHRMResponse,
} from "@/services/units/unitsService";
import {
  deleteFiles,
  FileItem,
  postFiles,
} from "@/services/uploads/uploadService";
import { convertTimestampToYYYYMMDD } from "@/ultils/Utility";
import {
  CalendarDate,
  DateValue,
  now,
  parseDate,
  toZoned,
} from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import { useDropzone } from "react-dropzone";

interface FormActivityProps {
  onSubmit: (formData: Partial<AddUpdateActivityItem>) => void;
  initialData?: Partial<AddUpdateActivityItem>;
  mode: "add" | "edit";
  numberActivity?: number;
}

const FormActivity: React.FC<FormActivityProps> = ({
  onSubmit,
  initialData,
  mode,
  numberActivity,
}) => {
  const [workloadTypes, setWorkloadTypes] = useState<WorkloadTypeItem[]>([]);
  const [selectedWorkloadType, setSelectedWorkloadType] = useState<string>("");
  const [stt, setStt] = useState<number>(0);
  const [documentNumber, setDocumentNumber] = useState<string>("");
  const [name, setName] = useState("");
  const [deterNumber, setDeterNumber] = useState("");
  const [deterFromDate, setDeterFromDate] = useState<number | 0>(0);
  const [deterEntryDate, setDeterEntryDate] = useState<number | 0>(0);
  const [moTa, setMoTa] = useState("");
  // const [filteredUsers, setFilteredUsers] = useState<Users[]>([]);
  const [filteredUsersFromHRM, setFilteredUsersFromHRM] = useState<
    UsersFromHRM[]
  >([]);
  // const [filteredUsersTemp, setFilteredUsersTemp] = useState<Users[]>([]);
  const [filteredUsersFromHRMTemp, setFilteredUsersFromHRMTemp] =
    useState<UsersFromHRMResponse | null>(null);
  // const [filteredUnits, setFilteredUnits] = useState<UnitItem[]>([]);
  const [filteredUnitsHRM, setFilteredUnitsHRM] = useState<
    UnitsHRMResponse | undefined
  >(undefined);
  const [tableUsers, setTableUsers] = useState<ActivityInput[]>([]);
  const [inputSearch, setInputSearch] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [standardValues, setStandardValues] = useState<number | 0>(0);
  const [listPicture, setListPicture] = useState<FileItem[]>([]);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const INITIAL_VISIBLE_COLUMNS = ["name", "unitName", "standard", "actions"];
  const [visibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );

  // Get all workload types
  const getAllWorkloadTypes = async () => {
    const response = await getWorkloadTypes();
    setWorkloadTypes(response.items);
  };

  const getAllUsersFromHRM = async (id: string) => {
    const response = await getUsersFromHRMbyId(id);
    setFilteredUsersFromHRMTemp(response);
  };

  const getAllListUnits = async () => {
    const response = await getListUnitsFromHrm();
    setFilteredUnitsHRM(response);
  };

  const onAddUsers = (key: Key | null, standard: number | 0) => {
    const itemUser =
      filteredUsersFromHRMTemp?.items?.find((user) => user.id === key) ?? null;
    if (itemUser) {
      // itemUser.standardNumber = standard;
      setTableUsers((prevTableUsers) => {
        const updatedUsers = prevTableUsers.map((user) => {
          if (user.id === itemUser.id) {
            return { ...user, standardNumber: standard };
          }
          return user;
        });
        const newUser: ActivityInput = {
          id: itemUser.id,
          userName: itemUser.userName,
          fullName: itemUser.fullName,
          unitName: itemUser.unitName,
          standardNumber: standard,
        };
        return [...updatedUsers, newUser];
      });
      setStandardValues(0);
      setSelectedKey(null);
    }
  };

  const onRemoveUsers = useCallback((id: string) => {
    setTableUsers((prevTableUsers) =>
      prevTableUsers.filter((user) => user.id !== id)
    );
  }, []);

  const handleSelectionChange = useCallback(
    (keys: SharedSelection) => {
      const selectedKey = Array.from(keys)[0];
      const selectedItem = workloadTypes.find(
        (type) => type.id === selectedKey
      );
      if (selectedItem) {
        setSelectedWorkloadType(selectedItem.id);
      }
    },
    [workloadTypes]
  );

  const handleDateChange = useCallback(
    (date: DateValue, setState: (value: number) => void) => {
      const temp = `${date.day}/${date.month}/${date.year}`;
      const [day, month, year] = temp.split("/").map(Number);
      const convertedDate = new Date(year, month - 1, day);
      setState(
        !isNaN(convertedDate.getTime()) ? convertedDate.getTime() / 1000 : 0
      );
    },
    []
  );

  const handleDeterFromDateChange = useCallback(
    (date: DateValue) => {
      try {
        handleDateChange(date, setDeterFromDate);
      } catch (error) {
        console.error("Error handling attendance from date change:", error);
      }
    },
    [handleDateChange]
  );

  const handleSetDeterEntryDateChange = useCallback(
    (date: DateValue) => {
      try {
        handleDateChange(date, setDeterEntryDate);
      } catch (error) {
        console.error("Error handling determination time change:", error);
      }
    },
    [handleDateChange]
  );

  useEffect(() => {
    getAllWorkloadTypes();
    getAllListUnits();
  }, []);

  const onSelectionUnitChange = async (key: Key | null) => {
    // console.log("key :>> ", key);
    if (key) {
      getAllUsersFromHRM(key.toString());
    }
  };

  const onSelectionChange = (key: Key | null) => {
    setSelectedKey(key);
  };

  const onInputChange = (value: string) => {
    setInputSearch(value.trim().toUpperCase());
  };

  // Gọi API mỗi khi query thay đổi

  useEffect(() => {
    try {
      const filtered = filteredUsersFromHRMTemp?.items?.filter(
        (user: UsersFromHRM) =>
          user.userName.toUpperCase().includes(inputSearch) ||
          user.fullName.toUpperCase().includes(inputSearch) ||
          user.fullNameUnsigned.toUpperCase().includes(inputSearch)
      );
      setFilteredUsersFromHRM(filtered ?? []);
    } catch (error) {
      setFilteredUsersFromHRM([]);
    }
  }, [inputSearch, filteredUsersFromHRMTemp]);

  // Populate form data in edit mode
  useEffect(() => {
    const loadUsers = async () => {
      if (mode === "edit" && initialData) {
        // console.log("initialData: ", initialData);
        setStt(initialData.stt || 0);
        setSelectedWorkloadType(initialData.workloadTypeId || "");
        setName(initialData.name || "");
        setDeterNumber(initialData.determinations?.number || "");
        setDeterEntryDate(initialData.determinations?.entryDate || 0);
        setDeterFromDate(
          initialData.determinations?.fromDate
            ? new Date(initialData.determinations.fromDate * 1000).getTime() /
                1000
            : 0
        );
        if (initialData.participants && initialData.participants.length > 0) {
          setTableUsers(initialData.participants);
        }
        if (initialData.determinations?.file !== null) {
          setListPicture(
            initialData.determinations?.file
              ? [initialData.determinations.file]
              : []
          );
          setIsUploaded(true);
        }
        if (initialData.determinations?.file.type === "") setIsUploaded(false);
        setDocumentNumber(initialData.documentNumber || "");
        setMoTa(initialData.description || "");
      } else {
        setStt(Number(numberActivity) + 1);
      }
    };

    loadUsers();
  }, [initialData, mode, numberActivity]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  type User = (typeof tableUsers)[0];
  const renderCell = useCallback(
    (user: User, columnKey: Key) => {
      const cellValue = user[columnKey as keyof User];
      switch (columnKey) {
        case "name":
          return (
            <>
              <div className="flex gap-2 items-center">
                <Avatar
                  alt={user.fullName}
                  className="flex-shrink-0"
                  size="sm"
                  src="user.png"
                />
                <div className="flex flex-col">
                  <span className="text-small">{user.fullName}</span>
                  <span className="text-tiny text-default-400">
                    {user.userName}
                  </span>
                </div>
              </div>
            </>
          );
        case "unitName":
          return (
            <>
              <p>{user.unitName}</p>
            </>
          );
        case "standard":
          return (
            <>
              <p>{user.standardNumber}</p>
            </>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <p
                className="cursor-pointer"
                onClick={() => onRemoveUsers(user.id)}
              >
                <Icon name="bx-trash" size="20px" className="text-red-600" />
              </p>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [onRemoveUsers]
  );

  const handleDeletePicture = async () => {
    if (listPicture[0].path !== "") {
      await deleteFiles(
        listPicture[0].path.replace("https://api-annual.uef.edu.vn/", "")
        // listPicture[0].path.replace("http://192.168.98.60:8081/", "")
      );
      // Cập nhật lại trạng thái sau khi xóa
      setIsUploaded(false);
      setListPicture([{ type: "", path: "", name: "", size: 0 }]);
    } else {
      console.log("Không có file nào để xóa.");
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);
    // console.log("acceptedFiles[0] :>> ", acceptedFiles[0]);
    if (listPicture[0]?.path !== "") {
      await deleteFiles(
        listPicture[0]?.path.replace("https://api-annual.uef.edu.vn/", "")
        // listPicture[0]?.path.replace("http://192.168.98.60:8081/", "")
      );
    }
    const results = await postFiles(formData);
    // console.log("results :>> ", results);
    if (results.length > 0) {
      setIsUploaded(true);
      setListPicture(results);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formData: Partial<AddUpdateActivityItem> = {
      id: initialData?.id || "",
      stt: stt,
      name: name,
      workloadTypeId: selectedWorkloadType,
      determinations: {
        number: deterNumber,
        fromDate: deterFromDate,
        entryDate: deterEntryDate,
        file: {
          type: listPicture[0]?.type ?? "",
          path: listPicture[0]?.path ?? "",
          name: listPicture[0]?.name ?? "",
          size: listPicture[0]?.size ?? 0,
        },
      },
      participants: tableUsers.map((user) => ({
        id: user.id,
        userName: user.userName,
        fullName: user.fullName,
        unitName: user.unitName,
        standardNumber: user.standardNumber,
      })),
      documentNumber: documentNumber,
      description: moTa,
    };
    // console.log("FORM DATA", formData);
    onSubmit(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-row-1 gap-1">
        <div className="grid grid-cols-5 gap-6 items-center mb-3">
          <Input
            isClearable
            key={"sothutu"}
            type="number"
            label="STT"
            variant="faded"
            labelPlacement="outside"
            placeholder=" "
            value={stt.toString()}
            onChange={(e) => setStt(Number(e.target.value))}
            onClear={() => setStt(0)}
          />
          <Select
            isRequired
            items={workloadTypes}
            label="Loại biểu mẫu"
            placeholder="Chọn loại biểu mẫu"
            variant="faded"
            labelPlacement="outside"
            defaultSelectedKeys={[initialData?.workloadTypeId || ""]}
            onSelectionChange={handleSelectionChange}
            className="col-span-4"
          >
            {(type) => (
              <SelectItem key={type.id} textValue={type.name}>
                {type.name}
              </SelectItem>
            )}
          </Select>
        </div>
        <Textarea
          isRequired
          key={"tenhoatdong"}
          minRows={1}
          label="Tên hoạt động đã thực hiện"
          variant="faded"
          labelPlacement="outside"
          placeholder=" "
          value={name}
          onChange={(e) => setName(e.target.value)}
          onClear={() => setName("")}
          className="mb-3"
        />
        <div className="grid grid-cols-2 gap-6 items-center mb-3">
          <Input
            isClearable
            isRequired
            key={"soquyetdinh"}
            type="text"
            label="Số Tờ trình/Kế hoạch/Quyết định"
            variant="faded"
            labelPlacement="outside"
            placeholder=" "
            value={deterNumber}
            onChange={(e) => setDeterNumber(e.target.value)}
            onClear={() => setDeterNumber("")}
          />
          <I18nProvider locale="vi-VN">
            <DatePicker
              shouldForceLeadingZeros
              showMonthAndYearPickers
              key="ngayky"
              label="Ngày ký"
              variant="faded"
              granularity="day"
              labelPlacement="outside"
              placeholderValue={now("Asia/Ho_Chi_Minh")}
              value={
                deterFromDate !== 0
                  ? (() => {
                      try {
                        const dateString =
                          convertTimestampToYYYYMMDD(deterFromDate);
                        const calendarDate: CalendarDate =
                          parseDate(dateString);
                        return toZoned(calendarDate, "Asia/Ho_Chi_Minh");
                      } catch (error) {
                        console.error(error);
                        return undefined;
                      }
                    })()
                  : undefined
              }
              onChange={(date) => {
                try {
                  handleDeterFromDateChange(date);
                } catch (error) {
                  console.error("Error setting deter entry date:", error);
                }
              }}
            />
          </I18nProvider>
        </div>
        <div className="flex flex-col gap-3 mb-3">
          <div className="grid grid-cols-2 gap-6">
            <Autocomplete
              defaultItems={filteredUnitsHRM?.model}
              label="Đơn vị"
              labelPlacement="outside"
              variant="faded"
              placeholder=" "
              onSelectionChange={onSelectionUnitChange}
              startContent={<Icon name="bx-search-alt-2" size="20px" />}
              listboxProps={{
                emptyContent: "Vui lòng nhập đơn vị phù hợp!",
              }}
            >
              {filteredUnitsHRM?.model?.map((unit) => (
                <AutocompleteItem key={unit.id} textValue={unit.name}>
                  {unit.name}
                </AutocompleteItem>
              )) ?? []}
            </Autocomplete>
            <Autocomplete
              defaultItems={filteredUsersFromHRM}
              label="Tra cứu mã CB-GV-NV"
              labelPlacement="outside"
              variant="faded"
              placeholder=" "
              onSelectionChange={onSelectionChange}
              onInputChange={onInputChange}
              startContent={<Icon name="bx-search-alt-2" size="20px" />}
              listboxProps={{
                emptyContent: "Vui lòng nhập mã nhân viên phù hợp!",
              }}
            >
              {filteredUsersFromHRM?.map((user) => (
                <AutocompleteItem
                  key={user.id}
                  textValue={`${user.fullName} - ${user.userName}`}
                >
                  <div className="flex gap-2 items-center">
                    <Avatar
                      alt={user.userName}
                      className="flex-shrink-0"
                      size="sm"
                      src="user.png"
                    />
                    <div className="flex flex-col">
                      <span className="text-small">{user.fullName}</span>
                      <span className="text-tiny text-default-400">
                        {user.userName}
                      </span>
                    </div>
                  </div>
                </AutocompleteItem>
              )) ?? null}
            </Autocomplete>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6 mb-3">
          <Input
            key={"sotietchuan"}
            type="number"
            label="Số tiết chuẩn"
            variant="faded"
            labelPlacement="outside"
            placeholder=" "
            value={standardValues.toString()}
            onChange={(e) => setStandardValues(Number(e.target.value))}
          />
          <DatePicker
            showMonthAndYearPickers
            key="ngaynhaphdd"
            label="Ngày nhập"
            variant="faded"
            granularity="day"
            labelPlacement="outside"
            placeholderValue={now("Asia/Ho_Chi_Minh")}
            onClick={() => console.log("Click")}
            value={
              deterEntryDate !== 0
                ? (() => {
                    try {
                      const dateString =
                        convertTimestampToYYYYMMDD(deterEntryDate);
                      const calendarDate: CalendarDate = parseDate(dateString); // Chuyển đổi chuỗi thành CalendarDate
                      return toZoned(calendarDate, "Asia/Ho_Chi_Minh");
                    } catch (error) {
                      console.error(error);
                      return undefined;
                    }
                  })()
                : undefined
            }
            onChange={(date) => {
              try {
                handleSetDeterEntryDateChange(date); // Hàm xử lý khi giá trị ngày thay đổi
              } catch (error) {
                console.error("Error setting deter entry date:", error);
              }
            }}
            className="text-[14px] flex justify-end"
          />
          <Input
            isClearable
            key={"sovbhc"}
            type="text"
            label="Số lưu HC"
            variant="faded"
            labelPlacement="outside"
            placeholder=" "
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            onClear={() => setDocumentNumber("")}
            className="text-[14px]"
            classNames={{
              mainWrapper: "h-10",
            }}
          />
          <div className="flex justify-end items-end">
            <Button
              color="primary"
              className="w-full"
              startContent={<Icon name="bx-plus" size="20px" />}
              onClick={() => onAddUsers(selectedKey, standardValues)}
            >
              Thêm nhân viên
            </Button>
          </div>
        </div>
        {tableUsers && tableUsers.length > 0 && (
          <>
            <div className="flex flex-col gap-3 mb-3">
              <h1>Danh sách các thành viên tham gia</h1>
              <Table removeWrapper aria-label="Danh sách nhân viên tham gia">
                <TableHeader columns={headerColumns}>
                  {(column) => (
                    <TableColumn
                      key={column.uid}
                      align={
                        column.uid === "standard" || column.uid == "actions"
                          ? "center"
                          : "start"
                      }
                      className="max-w-14"
                    >
                      {column.name}
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody items={tableUsers}>
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
        )}
        {/* Upload file */}
        <div className="grid grid-rows-1 gap-2 mb-3">
          <p className="text-[14px]">Tải lên minh chứng</p>
          <div
            {...getRootProps()}
            className="w-full min-h-20 h-fit border-2 border-dashed border-neutral-300 cursor-pointer flex justify-center items-center gap-3 rounded-xl"
          >
            <input {...getInputProps()} />
            {!isUploaded ? (
              <>
                <Image
                  src="upload.svg"
                  width={40}
                  height={40}
                  loading="lazy"
                  alt="upload"
                />
                <p className="text-sm">
                  Kéo và thả một tập tin vào đây hoặc nhấp để chọn một tập tin
                </p>
              </>
            ) : (
              <>
                {listPicture &&
                  listPicture.map((item) => (
                    <>
                      <div className="flex flex-col items-center gap-2 py-3">
                        <div className="grid grid-cols-3 gap-2">
                          <Image
                            src={
                              item.type === "image/jpeg" ||
                              item.type === "image/png"
                                ? "https://api-annual.uef.edu.vn/" +
                                  listPicture[0].path
                                : "file-pdf.svg"
                            }
                            width={60}
                            height={60}
                            loading="lazy"
                            alt="file-preview"
                          />
                          <div className="col-span-2 text-center content-center">
                            <p className="text-sm">{listPicture[0].name}</p>
                            <p className="text-sm flex">
                              ({(item.size / (1024 * 1024)).toFixed(2)} MB -
                              <Link
                                href={`${
                                  "https://api-annual.uef.edu.vn/" +
                                  listPicture[0].path
                                }`}
                                target="__blank"
                                size="sm"
                              >
                                <p className="text-sm ms-1">xem chi tiết</p>
                              </Link>
                              )
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 items-center mt-2">
                          <Button
                            color="danger"
                            size="sm"
                            variant="bordered"
                            onClick={handleDeletePicture}
                            startContent={<Icon name="bx-trash" size="16px" />}
                          >
                            Hủy tệp
                          </Button>
                          <Button
                            color="secondary"
                            size="sm"
                            variant="bordered"
                            startContent={
                              <Icon name="bx-cloud-upload" size="16px" />
                            }
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.onchange = (event) => {
                                const files = (event.target as HTMLInputElement)
                                  .files;
                                if (files && files.length > 0) {
                                  onDrop(Array.from(files));
                                }
                              };
                              input.click();
                            }}
                          >
                            Chọn tệp thay thế
                          </Button>
                        </div>
                      </div>
                    </>
                  ))}
              </>
            )}
          </div>
        </div>

        <Textarea
          key={"ghichu"}
          label="Ghi chú"
          variant="faded"
          minRows={1}
          value={moTa}
          labelPlacement="outside"
          placeholder=" "
          onChange={(e) => setMoTa(e.target.value)}
          className="mb-3"
        />
      </form>
    </>
  );
};

export default FormActivity;
