"use client";

import Icon from "@/components/Icon";
import { AddUpdateActivityItem } from "@/services/forms/formService";
import {
  AddUpdateUsersTable,
  columns,
  getUsers,
  Users,
} from "@/services/users/userService";
import {
  getWorkloadTypes,
  WorkloadTypeItem,
} from "@/services/workloads/typeService";
import {
  Avatar,
  Button,
  DatePicker,
  Input,
  Listbox,
  ListboxItem,
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
  User,
} from "@nextui-org/react";
import {
  FormEvent,
  Key,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { convertTimestampToYYYYMMDD } from "@/ultils/Utility";
import { DateValue, parseDate } from "@internationalized/date";
import { postFiles } from "@/services/uploads/uploadService";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

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
  const [username, setUsername] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<Users[]>([]);
  const [tableUsers, setTableUsers] = useState<Users[]>([]);
  const [standardValues, setStandardValues] = useState<Record<string, number>>(
    {}
  );
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(
    new Set<string>()
  );
  const INITIAL_VISIBLE_COLUMNS = ["name", "standard", "actions"];
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );

  // Get all workload types
  const getAllWorkloadTypes = async () => {
    const response = await getWorkloadTypes();
    setWorkloadTypes(response.items);
  };

  const onAddUsers = () => {
    const selectedUserObjects = Array.from(selectedUsers).map((id) =>
      filteredUsers.find((user) => user.id === id)
    );
    // Thêm người dùng vào tableUsers (nếu chưa có trong danh sách)
    setTableUsers((prev) => [
      ...prev,
      ...(selectedUserObjects.filter(
        (user) => user && !prev.some((u) => u?.id === user?.id)
      ) as Users[]),
    ]);
    // Clear selections
    setSelectedUsers(new Set());
    onClear();
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

  const handleStandardChange = (userId: string, value: number) => {
    setTableUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, standardNumber: value } : user
      )
    );
    setStandardValues((prevValues) => ({ ...prevValues, [userId]: value }));
  };

  const onClear = useCallback(() => {
    setUsername("");
    setFilteredUsers([]);
  }, []);

  useEffect(() => {
    getAllWorkloadTypes();
  }, []);

  useEffect(() => {
    const getAllUsers = async (code: string) => {
      const response = await getUsers(code);
      setFilteredUsers(response.items);
      console.log(tableUsers);
    };

    if (username.trim()) {
      const timeoutId = setTimeout(() => {
        getAllUsers(username);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [username, tableUsers]);

  // Populate form data in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      console.log("INITIAL DATA", initialData);
      setName(initialData.name || "");
      setDeterNumber(initialData.determinations?.number || "");
      setDeterTime(initialData.determinations?.time || 0);
      setAttdanceFromDate(
        initialData.attendance?.fromDate
          ? new Date(initialData.attendance.fromDate * 1000).getTime() / 1000
          : 0
      );
      setMoTa(initialData.description || "");
      console.log("INITIAL DATA", initialData.participants);
    }
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
            <User
              avatarProps={{ radius: "lg", src: "avatar.jpg" }}
              description={user.email}
              name={cellValue}
            >
              {user.fullName}
              {user.email}
            </User>
          );
        case "standard":
          return (
            <div className="max-w-fit">
              <Input
                isClearable
                isRequired
                key={"sotietchuan" + user.id}
                type="number"
                variant="faded"
                labelPlacement="outside"
                placeholder=" "
                value={String(standardValues[user.id] || 0)} // Convert the value to a string
                onChange={(e) =>
                  handleStandardChange(user.id, Number(e.target.value))
                } // Convert the value to a number before passing it as an argument
                onClear={() => handleStandardChange(user.id, 0)} // Pass the value as a string
                className="py-2"
              />
            </div>
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
    [onRemoveUsers, standardValues]
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Xử lý tệp tin hình ảnh khi người dùng thả vào
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]); // Thêm tệp tin vào FormData

    // Gửi yêu cầu tải tệp lên API
    const results = postFiles(formData);
    console.log(results);
  });
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formData: Partial<AddUpdateActivityItem> = {
      name: name,
      workloadTypeId: selectedWorkloadType,
      determinations: { number: deterNumber, time: deterTime, pathImg: "" },
      attendance: { fromDate: attendanceFromDate, toDate: attendanceToDate },
      participants: tableUsers.map((user) => ({
        id: user.id,
        standardNumber: Number(standardValues[user.id] || 0),
      })),
      description: moTa,
    };
    console.log("FORM DATA", formData);
    onSubmit(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-row-1 gap-1">
        <div className="grid grid-cols-2 gap-3 items-center">
          <Select
            isRequired
            items={workloadTypes}
            label="Loại biểu mẫu"
            placeholder="Chọn loại biểu mẫu"
            labelPlacement="outside"
            defaultSelectedKeys={[initialData?.workloadTypeId || ""]}
            onSelectionChange={handleSelectionChange}
            classNames={{
              label: "text-[16px]",
            }}
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
            classNames={{
              label: "text-[16px]",
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 items-center">
          <Input
            isClearable
            isRequired
            key={"soquyetdinh"}
            type="text"
            label="Số quyết định"
            variant="faded"
            labelPlacement="outside"
            placeholder=" "
            value={deterNumber}
            onChange={(e) => setDeterNumber(e.target.value)}
            onClear={() => {}}
            className="py-2"
            classNames={{
              label: "text-[16px]",
            }}
          />
          <DatePicker
            key="ngayquyetdinh"
            label="Ngày quyết định"
            variant="faded"
            labelPlacement="outside"
            value={
              deterTime != 0
                ? parseDate(convertTimestampToYYYYMMDD(deterTime))
                : undefined
            }
            onChange={handleDateChange}
            classNames={{
              label: "text-[16px]",
            }}
          />
        </div>
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
          onClear={() => {}}
          className="py-2"
          classNames={{
            label: "text-[16px]",
          }}
        />
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              key={"timkiemnhanvien"}
              type="text"
              label="Tìm kiếm nhân viên"
              variant="faded"
              startContent={<Icon name="bx-search-alt-2" size="20px" />}
              labelPlacement="outside"
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onClear={() => {}}
              className="py-2"
              classNames={{
                label: "text-[16px]",
              }}
            />
          </div>
          {filteredUsers && filteredUsers.length > 0 && (
            <>
              <div className="w-full">
                <Listbox
                  classNames={{
                    base: "w-full",
                    list: "h-fit no-scrollbar",
                    emptyContent: "text-center",
                  }}
                  items={filteredUsers}
                  variant="faded"
                  color="primary"
                  label="Danh sách nhân viên"
                  selectionMode="multiple"
                  onSelectionChange={(keys) =>
                    setSelectedUsers(new Set(Array.from(keys).map(String)))
                  }
                >
                  {(item) => (
                    <ListboxItem key={item.id} textValue={item.userName}>
                      <div className="flex gap-2 items-center">
                        <Avatar
                          alt={item.fullName}
                          className="flex-shrink-0"
                          size="sm"
                          src="avatar.jpg"
                        />
                        <div className="flex flex-col">
                          <span className="text-small">{item.fullName}</span>
                          <span className="text-tiny text-default-400">
                            {item.userName}
                          </span>
                        </div>
                      </div>
                    </ListboxItem>
                  )}
                </Listbox>
                <div className="w-full flex justify-center">
                  <Button size="sm" onClick={() => onAddUsers()}>
                    Thêm nhân viên
                  </Button>
                </div>
              </div>
            </>
          )}
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
                      // align={column.uid === "standard" ? "center" : "start"}
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
        <Textarea
          key={"ghichu"}
          label="Ghi chú"
          variant="faded"
          value={moTa}
          labelPlacement="outside"
          placeholder=" "
          onChange={(e) => setMoTa(e.target.value)}
          className="py-2"
          classNames={{
            label: "text-[16px]",
          }}
        />
        <div className="grid grid-rows-1 gap-2">
          <p>Tải lên minh chứng</p>
          <div
            {...getRootProps()}
            className="w-full h-20 border-2 border-dashed border-neutral-300 cursor-pointer flex justify-center items-center gap-3 rounded-xl"
          >
            <input {...getInputProps()} />
            <Image src="upload.svg" width={44} height={44} alt="upload" />
            <p>Kéo thả file vào đây hoặc nhấp để chọn file</p>
          </div>
        </div>
      </form>
    </>
  );
};

export default FormActivity;
