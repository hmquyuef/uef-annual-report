"use client";

import { getWorkloadGroups } from "@/services/workloads/groupService";
import { AddUpdateWorkloadType } from "@/services/workloads/typeService";
import {
  Button,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Selection,
} from "@nextui-org/react";
import { FormEvent, useEffect, useState } from "react";

interface FormTypeProps {
  onSubmit: (formData: Partial<AddUpdateWorkloadType>) => void;
  initialData?: Partial<AddUpdateWorkloadType>;
  mode: "add" | "edit";
}

type WorkloadGroup = {
  id: string;
  name: string;
};

const FormType: React.FC<FormTypeProps> = ({ onSubmit, initialData, mode }) => {
  const [workloadGroups, setWorkloadGroups] = useState<WorkloadGroup[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [selectedValue, setSelectedValue] = useState("");

  const getAllWorkloadGroups = async () => {
    const response = await getWorkloadGroups();
    setWorkloadGroups(response.items);
    // Set default selected value as the first item
    if (response.items.length > 0) {
      const defaultGroup = response.items[0];
      setSelectedKeys(new Set([defaultGroup.id]));
      setSelectedValue(defaultGroup.name);
      setNhomCTID(defaultGroup.id);
    }
  };

  const [name, setName] = useState("");
  const [nhomCTID, setNhomCTID] = useState("");
  const [kichHoat, setKichHoat] = useState(true);

  useEffect(() => {
    getAllWorkloadGroups();
  }, []);

  // Update selected value and id when selection changes
  useEffect(() => {
    const selectedKey = Array.from(selectedKeys)[0]; // Extract the first value from Set (single selection)
    const selectedGroup = workloadGroups.find(
      (group) => group.id === selectedKey
    );
    if (selectedGroup) {
      setSelectedValue(selectedGroup.name);
      setNhomCTID(selectedGroup.id); // Set the ID based on selection
    }
  }, [selectedKeys, workloadGroups]);

  // Populate form data in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setName(initialData.name || "");
      setNhomCTID(initialData.workloadGroupId || "");
      setKichHoat(initialData.isActived ?? true);
    }
  }, [initialData, mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formData: Partial<AddUpdateWorkloadType> = {
      name: name,
      workloadGroupId: nhomCTID,
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
          label="Tên công tác"
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
        <div className="flex flex-col gap-1 mb-2">
          <p>Nhóm công tác</p>
          <Dropdown
            showArrow
            classNames={{
                base: "w-full",
            }}
            // backdrop="blur"
          >
            <DropdownTrigger>
              <Button variant="faded" className="capitalize">
                {selectedValue}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="danh mục nhóm công tác"
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
            >
              {workloadGroups.map((group) => (
                <DropdownItem key={group.id} className="w-full">
                  {group.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
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

export default FormType;
