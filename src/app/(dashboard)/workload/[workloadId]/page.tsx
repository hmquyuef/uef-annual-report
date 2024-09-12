"use client";

import Icon from "@/components/Icon";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";

const WorkloadDetail = ({ params }: { params: { workloadId: string } }) => {
  return (
    <>
      <div className="flex flex-col gap-4 mt-1">
        <Breadcrumbs key="breadcumbsWorkloadTypes" radius="md" variant="solid">
          <BreadcrumbItem
            href="/"
            startContent={<Icon name="bx-file" size="20px" />}
          >
            Quá trình công tác
          </BreadcrumbItem>
          <BreadcrumbItem
            href={`/workloads/${params.workloadId}`}
            startContent={<Icon name="bx-file" size="20px" />}
          >
            Thông tin chi tiết
          </BreadcrumbItem>
        </Breadcrumbs>
        <h1>Workload Detail</h1>
        <h1>Workload Id {params.workloadId}</h1>
      </div>
    </>
  );
};

export default WorkloadDetail;
