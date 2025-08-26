import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Select,
  Input,
  Button,
  Space,
  message,
  Divider,
  Typography,
  Row,
  Col,
} from "antd";
import EmpSidebar from "../../../component/layout/Sidebar/EmpSidebar";
import StatusCard from "../componemts/StatusCard";
import { GiWashingMachine, GiClothes } from "react-icons/gi";
import { FaCheckCircle } from "react-icons/fa";

const { TextArea } = Input;
const { Title } = Typography;

const OrderDetail: React.FC = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState({
    orderId,
    customerName: "สมชาย ใจดี",
    address: "123/45 ถนนมิตรภาพ นครราชสีมา",
    phone: "081-234-5678",
    weight: 12,
    totalItems: 20,
    status: "รอดำเนินการ",
    machine: "",
    note: "",
  });

  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const handleStatusUpdate = (newStatus: string) => {
    setOrder((prev) => ({
      ...prev,
      status: newStatus,
    }));
    message.success(`✅ อัปเดตสถานะเป็น: ${newStatus}`);
  };

  const handleSaveMachineNote = () => {
    setOrder((prev) => ({
      ...prev,
      machine: selectedMachine || "",
      note: note || "",
    }));
    message.success("✅ บันทึกเครื่องซักผ้าและหมายเหตุเรียบร้อย");
  };

  
return (
  <EmpSidebar>
    <div className="p-6">
      {/* หัวข้อหลัก */}
      <div className="mb-6">
        <Title level={2} className="!text-[#000000] !mb-1 flex items-center gap-2">
          🧺 รายละเอียดออเดอร์ <span className="text-gray-500 text-lg">#{orderId}</span>
        </Title>
        <Divider className="!my-2 !border-blue-400" />
      </div>

      <Row gutter={[24, 24]}>
        {/* กล่องรายละเอียดออเดอร์ */}
        <Col xs={24} md={12}>
          <Card
            bordered
            className="shadow-lg rounded-2xl h-full bg-gradient-to-br from-blue-50 to-white"
            bodyStyle={{ padding: 28 }}
            title={
              <div className="flex items-center gap-2 text-[#20639B] font-bold text-2xl">
                ข้อมูลลูกค้าและออเดอร์
              </div>
            }
          >
            <div className="space-y-4">
              {/* ชื่อลูกค้า */}
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-gray-700" style={{ fontWeight: 'bold' }}>👤 ชื่อลูกค้า  </span>
                <span className="text-lg font-medium">{order.customerName}</span>
              </div>
              {/* เบอร์โทร */}
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-gray-700" style={{ fontWeight: 'bold' }}>📞 เบอร์โทร  </span>
                <span className="text-lg font-medium">{order.phone}</span>
              </div>
              {/* ที่อยู่ */}
              <div className="flex items-start justify-between border-b pb-2">
                <span className="font-bold text-gray-700" style={{ fontWeight: 'bold' }}>🏠 ที่อยู่  </span>
                <span className="text-right max-w-[60%]">{order.address}</span>
              </div>
              {/* สถานะ */}
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-gray-700" style={{ fontWeight: 'bold' }}>📌 สถานะ  </span>
                <span
                  className={`px-4 py-1 rounded-full text-white text-base font-semibold shadow-sm transition-colors ${
                    order.status === "รอดำเนินการ"
                      ? "bg-orange-500"
                      : order.status === "กำลังซัก"
                      ? "bg-blue-500"
                      : order.status === "กำลังอบ"
                      ? "bg-purple-500"
                      : "bg-green-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              {/* น้ำหนักผ้า */}
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-gray-700" style={{ fontWeight: 'bold' }}>⚖️ น้ำหนักผ้า  </span>
                <span className="text-lg">{order.weight} kg</span>
              </div>
              {/* จำนวนชิ้น */}
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-gray-700" style={{ fontWeight: 'bold' }}>🧺 จำนวนชิ้น  </span>
                <span className="text-lg">{order.totalItems} ชิ้น</span>
              </div>
              {/* เครื่องซักผ้า */}
              {order.machine && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-gray-700" style={{ fontWeight: 'bold' }}>🧭 เครื่องซักผ้า  </span>
                  <span className="text-lg">{order.machine}</span>
                </div>
              )}
              {/* หมายเหตุ */}
              {order.note && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700" style={{ fontWeight: 'bold' }}>📝 หมายเหตุ  </span>
                  <span className="text-lg max-w-[60%] text-right">{order.note}</span>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* กล่องเลือกเครื่อง + หมายเหตุ + อัปเดตสถานะ */}
        <Col xs={24} md={12}>
          <Card
            bordered
            className="shadow-lg rounded-2xl h-full bg-gradient-to-br from-white to-blue-50"
            bodyStyle={{ padding: 28 }}
          >
            <Title level={4} className="!text-[#20639B] !mb-2">🧭 เลือกเครื่องซักผ้า</Title>
            <Select
              placeholder="เลือกเครื่อง"
              style={{ width: "100%", maxWidth: 240 }}
              onChange={(value) => setSelectedMachine(value)}
              options={[
                { value: "เครื่องที่ 1", label: "เครื่องที่ 1" },
                { value: "เครื่องที่ 2", label: "เครื่องที่ 2" },
                { value: "เครื่องที่ 3", label: "เครื่องที่ 3" },
              ]}
              className="mb-4"
            />
            <Divider className="!my-3" />
            <Title level={4} className="!text-[#20639B] !mb-2">📝 หมายเหตุ</Title>
            <TextArea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เพิ่มหมายเหตุ..."
              style={{ marginBottom: 16 }}
            />
            <Button
              type="primary"
              onClick={handleSaveMachineNote}
              disabled={!selectedMachine}
              className="mb-4"
              block
            >
              💾 บันทึกข้อมูล
            </Button>
            <Divider className="!my-3" />
            {/* Section: อัปเดตสถานะ */}
            <Title level={4} className="!text-[#20639B] !mb-2">🔄 อัปเดตสถานะการซัก</Title>
            <Space wrap>
              <StatusCard
                icon={<GiWashingMachine size={30} />}
                label="กำลังซัก"
                value="กำลังซัก"
                isSelected={order.status === "กำลังซัก"}
                onClick={handleStatusUpdate}
              />
              <StatusCard
                icon={<GiClothes size={30} />}
                label="กำลังอบ"
                value="กำลังอบ"
                isSelected={order.status === "กำลังอบ"}
                onClick={handleStatusUpdate}
              />
              <StatusCard
                icon={<FaCheckCircle size={30} />}
                label="เสร็จสิ้น"
                value="เสร็จสิ้น"
                isSelected={order.status === "เสร็จสิ้น"}
                onClick={handleStatusUpdate}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  </EmpSidebar>
);
};

export default OrderDetail;
