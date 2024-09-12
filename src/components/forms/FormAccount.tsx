import {
  Checkbox,
  DatePicker,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";

const sexOptions = [
  { id: 1, label: "Nam" },
  { id: 2, label: "Nữ" },
  { id: 3, label: "Khác" },
];

const FormAccount = () => {
  return (
    <>
      <div className="grid grid-cols-3 gap-6 mb-3">
        <Input
          isClearable
          isRequired
          type="text"
          label="Mã nhân viên"
          variant="bordered"
          onClear={() => console.log("input cleared")}
          className="max-w-xs"
        />
        <Select
          isRequired
          label="Giới tính"
          variant="bordered"
          className="max-w-xs"
        >
          {sexOptions.map((sex) => (
            <SelectItem key={sex.id}>{sex.label}</SelectItem>
          ))}
        </Select>
        <DatePicker
          isRequired
          label="Ngày sinh"
          variant="bordered"
          showMonthAndYearPickers
        />
      </div>
      <div className="grid grid-cols-3 gap-5">
        <Input
          isClearable
          isRequired
          type="text"
          label="Họ"
          variant="bordered"
          onClear={() => console.log("input cleared")}
          className="max-w-xs"
        />
        <Input
          isClearable
          isRequired
          type="text"
          label="Họ lót"
          variant="bordered"
          onClear={() => console.log("input cleared")}
          className="max-w-xs"
        />
        <Input
          isClearable
          isRequired
          type="text"
          label="Tên"
          variant="bordered"
          onClear={() => console.log("input cleared")}
          className="max-w-xs"
        />
      </div>
      <h1 className="text-lg font-semibold mt-2 mb-3">Thông tin lao động</h1>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-6">
          <Select
            isRequired
            label="Đơn vị"
            variant="bordered"
            className="max-w-xs"
          >
            {sexOptions.map((sex) => (
              <SelectItem key={sex.id}>{sex.label}</SelectItem>
            ))}
          </Select>
          <Select
            isRequired
            label="Chức vụ"
            variant="bordered"
            className="max-w-xs"
          >
            {sexOptions.map((sex) => (
              <SelectItem key={sex.id}>{sex.label}</SelectItem>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Select
            isRequired
            label="Loại hình lao động"
            variant="bordered"
            className="max-w-xs"
          >
            {sexOptions.map((sex) => (
              <SelectItem key={sex.id}>{sex.label}</SelectItem>
            ))}
          </Select>
          <DatePicker
            isRequired
            label="Ngày thử việc"
            variant="bordered"
            showMonthAndYearPickers
          />
        </div>
        <Checkbox defaultSelected>Yêu cầu tạo tài khoản</Checkbox>
      </div>
    </>
  );
};

export default FormAccount;
