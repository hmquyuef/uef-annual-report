"use client";

import Icon from "@/components/Icon";
import {
  ActivityInput,
  AddUpdateActivityItem,
} from "@/services/forms/formService";
import { columns, getUsers, Users } from "@/services/users/userService";
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
  Input,
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

import { deleteFiles, postFiles } from "@/services/uploads/uploadService";
import { convertTimestampToYYYYMMDD } from "@/ultils/Utility";
import { DateValue, parseDate } from "@internationalized/date";
import Image from "next/image";
import { useDropzone } from "react-dropzone";

interface FormActivityProps {
  onSubmit: (formData: Partial<AddUpdateActivityItem>) => void;
  initialData?: Partial<AddUpdateActivityItem>;
  mode: "add" | "edit";
}

const FormActivity: React.FC<FormActivityProps> = ({
  onSubmit,
  initialData,
  mode,
}) => {
  const [workloadTypes, setWorkloadTypes] = useState<WorkloadTypeItem[]>([]);
  const [selectedWorkloadType, setSelectedWorkloadType] = useState<string>("");
  const [name, setName] = useState("");
  const [deterNumber, setDeterNumber] = useState("");
  const [deterTime, setDeterTime] = useState<number>(0);
  const [attendanceFromDate, setAttdanceFromDate] = useState<number | 0>(0);
  const [attendanceToDate, setAttendanceToDate] = useState<number | 0>(0);
  const [moTa, setMoTa] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<Users[]>([]);
  const [tableUsers, setTableUsers] = useState<ActivityInput[]>([]);
  const [inputSearch, setInputSearch] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [standardValues, setStandardValues] = useState<number | 0>(0);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [pathPicture, setPathPicture] = useState<string>("");
  const INITIAL_VISIBLE_COLUMNS = ["name", "unitName", "standard", "actions"];
  const [visibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  // Get all workload types
  const getAllWorkloadTypes = async () => {
    const response = await getWorkloadTypes();
    setWorkloadTypes(response.items);
  };
  // const getUserByCode = async (code: string) => {
  //   try {
  //     const response = await getUsers(code);
  //     console.log('response.items :>> ', response.items);
  //     setFilteredUsers(response.items);
  //   } catch (error) {
  //     setFilteredUsers([]);
  //   }
  // };

  const onAddUsers = (key: Key | null, standard: number | 0) => {
    const itemUser = filteredUsers.find((user) => user.id === key);
    if (itemUser) {
      itemUser.standardNumber = standard;
      setTableUsers((prevTableUsers) => [...prevTableUsers, itemUser]);
      setStandardValues(0);
      setSelectedKey(null);
      setFilteredUsers([]);
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

  const handleAttendanceDateChange = useCallback((date: DateValue) => {
    const temp = date.day + "/" + date.month + "/" + date.year;
    const [day, month, year] = temp.split("/").map(Number);
    const convertedDate = new Date(year, month - 1, day);
    if (!isNaN(convertedDate.getTime())) {
      setAttdanceFromDate(convertedDate.getTime() / 1000);
      setAttendanceToDate(convertedDate.getTime() / 1000);
    } else {
      setAttdanceFromDate(0);
      setAttendanceToDate(0);
    }
  }, []);

  const handleDateChange = useCallback((date: DateValue) => {
    const temp = date.day + "/" + date.month + "/" + date.year;
    const [day, month, year] = temp.split("/").map(Number);
    const convertedDate = new Date(year, month - 1, day);
    if (!isNaN(convertedDate.getTime())) {
      setDeterTime(convertedDate.getTime() / 1000);
    } else {
      setDeterTime(0);
    }
  }, []);

  useEffect(() => {
    getAllWorkloadTypes();
  }, []);

  const onSelectionChange = (key: Key | null) => {
    setSelectedKey(key);
  };

  const onInputChange = (value: string) => {
    setInputSearch(value);
  };

  // Gọi API mỗi khi query thay đổi
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (inputSearch) {
        try {
          const response = await getUsers(inputSearch);
          // console.log("response.items :>> ", response.items);
          setFilteredUsers(response.items);
        } catch (error) {
          setFilteredUsers([]);
        }
      }
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [inputSearch]);

  // Populate form data in edit mode
  useEffect(() => {
    const loadUsers = async () => {
      if (mode === "edit" && initialData) {
        // console.log("initialData: ", initialData);
        setSelectedWorkloadType(initialData.workloadTypeId || "");
        setName(initialData.name || "");
        setDeterNumber(initialData.determinations?.number || "");
        setDeterTime(initialData.determinations?.time || 0);
        setAttdanceFromDate(
          initialData.attendance?.fromDate
            ? new Date(initialData.attendance.fromDate * 1000).getTime() / 1000
            : 0
        );
        setAttendanceToDate(
          initialData.attendance?.toDate
            ? new Date(initialData.attendance.toDate * 1000).getTime() / 1000
            : 0
        );
        if (initialData.participants && initialData.participants.length > 0) {
          setTableUsers(initialData.participants);
        }
        if (
          initialData.determinations?.pathImg !== "" &&
          initialData.determinations?.pathImg !== null
        ) {
          setPathPicture(initialData.determinations?.pathImg || "");
          setIsUploaded(true);
        }
        setMoTa(initialData.description || "");
      }
    };

    loadUsers();
  }, [initialData, mode]);

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
                  src="avatar.jpg"
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
  const normalizeUrl = (url: string) => url.replace(/\\/g, '/');
  const onDrop = async (acceptedFiles: File[]) => {
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);
    if (pathPicture !== "") {
      await deleteFiles(pathPicture.replace("https://api-annual.uef.edu.vn/", ""));
      // await deleteFiles(pathPicture.replace("http://192.168.98.60:8081/", ""));
    }
    const results = await postFiles(formData);
    if (results) {
      setIsUploaded(true);
      setPathPicture("https://api-annual.uef.edu.vn/" + normalizeUrl(results.toString()));
      // setPathPicture("http://192.168.98.60:8081/" + normalizeUrl(results.toString()));
    }
  };
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formData: Partial<AddUpdateActivityItem> = {
      id: initialData?.id || "",
      name: name,
      workloadTypeId: selectedWorkloadType,
      determinations: {
        number: deterNumber,
        time: deterTime,
        pathImg: pathPicture,
      },
      attendance: { fromDate: attendanceFromDate, toDate: attendanceToDate },
      participants: tableUsers.map((user) => ({
        id: user.id,
        userName: user.userName,
        fullName: user.fullName,
        unitName: user.unitName,
        standardNumber: user.standardNumber,
      })),
      description: moTa,
    };
    // console.log("FORM DATA", formData);
    onSubmit(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-row-1 gap-1">
        <div className="grid grid-cols-2 gap-3 items-center mb-3">
          <Select
            isRequired
            items={workloadTypes}
            label="Loại biểu mẫu"
            placeholder="Chọn loại biểu mẫu"
            labelPlacement="outside"
            defaultSelectedKeys={[initialData?.workloadTypeId || ""]}
            onSelectionChange={handleSelectionChange}
          >
            {(type) => (
              <SelectItem key={type.id} textValue={type.name}>
                {type.name}
              </SelectItem>
            )}
          </Select>
          <DatePicker
            key="thoigianthamdu"
            label="Thời gian tham dự"
            variant="faded"
            labelPlacement="outside"
            value={
              attendanceFromDate != 0
                ? parseDate(convertTimestampToYYYYMMDD(attendanceFromDate))
                : undefined
            }
            onChange={handleAttendanceDateChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 items-center mb-3">
          <Input
            isClearable
            isRequired
            key={"soquyetdinh"}
            type="text"
            label="Tờ trình/Kết hoạch/Quyết định"
            variant="faded"
            labelPlacement="outside"
            placeholder=" "
            value={deterNumber}
            onChange={(e) => setDeterNumber(e.target.value)}
            onClear={() => setDeterNumber("")}
          />
          <DatePicker
            key="ngayquyetdinh"
            label="Ngày hiệu lực"
            variant="faded"
            labelPlacement="outside"
            value={
              deterTime != 0
                ? parseDate(convertTimestampToYYYYMMDD(deterTime))
                : undefined
            }
            onChange={handleDateChange}
          />
        </div>
        <div className="mb-3">
          <Input
            isClearable
            isRequired
            key={"tenhoatdong"}
            type="text"
            label="Tên hoạt động"
            variant="faded"
            labelPlacement="outside"
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
            onClear={() => setName("")}
          />
        </div>
        <div className="flex flex-col gap-3 mb-3">
          <div className="grid grid-cols-4 gap-3">
            <Autocomplete
              defaultItems={filteredUsers}
              label="Tìm kiếm nhân viên"
              labelPlacement="outside"
              variant="faded"
              placeholder="Tìm kiếm bằng mã nhân viên..."
              className="col-span-2"
              onSelectionChange={onSelectionChange}
              onInputChange={onInputChange}
              startContent={<Icon name="bx-search" size="20px" />}
              listboxProps={{
                emptyContent: "Vui lòng nhập mã nhân viên phù hợp!",
              }}
            >
              {filteredUsers.map((user) => (
                <AutocompleteItem key={user.id} textValue={user.fullName}>
                  <div className="flex gap-2 items-center">
                    <Avatar
                      alt={user.userName}
                      className="flex-shrink-0"
                      size="sm"
                      src="avatar.jpg"
                    />
                    <div className="flex flex-col">
                      <span className="text-small">{user.fullName}</span>
                      <span className="text-tiny text-default-400">
                        {user.userName}
                      </span>
                    </div>
                  </div>
                </AutocompleteItem>
              ))}
            </Autocomplete>
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
        </div>
        {tableUsers && tableUsers.length > 0 && (
          <>
            <div className="flex flex-col gap-3">
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
        <div className="mb-3">
          <Textarea
            key={"ghichu"}
            label="Ghi chú"
            variant="faded"
            value={moTa}
            labelPlacement="outside"
            placeholder=" "
            onChange={(e) => setMoTa(e.target.value)}
          />
        </div>
        {/* Upload file */}
        <div className="grid grid-rows-1 gap-2">
          <p className="text-[14px]">Tải lên minh chứng</p>
          <div
            {...getRootProps()}
            className="w-full min-h-20 h-fit border-2 border-dashed border-neutral-300 cursor-pointer flex justify-center items-center gap-3 rounded-xl"
          >
            <input {...getInputProps()} />
            {!isUploaded ? (
              <>
                <Image src="upload.svg" width={44} height={44} loading="lazy" alt="upload" />
                <p>Kéo thả tệp vào đây hoặc nhấp để chọn tệp</p>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2 py-3">
                  <Image
                    src={pathPicture}
                    width={120}
                    height={100}
                    loading="lazy"
                    alt="upload"
                  />
                  <p>Kéo thả tệp khác để thay thế</p>
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </>
  );
};

export default FormActivity;
