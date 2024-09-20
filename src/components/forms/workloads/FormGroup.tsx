import { AddWordloadGroup } from "@/services/workloads/groupService";
import { Checkbox, Input, Textarea } from "@nextui-org/react";
import { FormEvent, useEffect, useState } from "react";

interface FormGroupProps {
  onSubmit: (formData: Partial<AddWordloadGroup>) => void;
  initialData?: Partial<AddWordloadGroup>;
  mode: "add" | "edit";
}

const FormGroup: React.FC<FormGroupProps> = ({
  onSubmit,
  initialData,
  mode,
}) => {
  const [nhomCT, setNhomCT] = useState("");
  const [moTa, setMoTa] = useState("");
  const [kichHoat, setKichHoat] = useState(true);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setNhomCT(initialData.name || "");
      setMoTa(initialData.description || "");
      setKichHoat(initialData.isActived ?? true);
    }
  }, [initialData, mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formData: Partial<AddWordloadGroup> = {
      name: nhomCT,
      description: moTa,
      isActived: kichHoat,
    };
    onSubmit(formData);
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-row-1 gap-1">
        <Input
          isClearable
          isRequired
          key={"tennhomcongtac"}
          type="text"
          label="Nhóm công tác"
          variant="faded"
          labelPlacement="outside"
          placeholder=" "
          value={nhomCT}
          onChange={(e) => setNhomCT(e.target.value)}
          onClear={() => setNhomCT("")}
          className="py-2"
          classNames={{
            label: "text-[16px]",
          }}
        />
        <Textarea
          key={"mota"}
          label="Mô tả"
          variant="faded"
          value={moTa}
          labelPlacement="outside"
          placeholder=" "
          onChange={(e) => setMoTa(e.target.value)}
          onClear={() => {}}
          className="py-2"
          classNames={{
            label: "text-[16px]",
          }}
        />
        <Checkbox
          defaultSelected={kichHoat}
          onChange={(e) => setKichHoat(e.target.checked)}
          className="px-2 py-5"
        >
          Kích hoạt
        </Checkbox>
      </form>
    </>
  );
};

export default FormGroup;
