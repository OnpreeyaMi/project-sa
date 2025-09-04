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
  Modal,
} from "antd";
import EmpSidebar from  "../../component/layout/employee/empSidebar";
import StatusCard from "../../component/StatusCard"; 
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
    washMachine: "",
    dryMachine: "",
    statusNote: "",
  });

  const [selectedWashMachine, setSelectedWashMachine] = useState<string | null>(null);
  const [selectedDryMachine, setSelectedDryMachine] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState("");

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    newStatus: string | null;
  }>({ open: false, newStatus: null });

  // แสดง Modal ก่อนอัปเดตสถานะ
  const handleStatusUpdate = (newStatus: string) => {
    setConfirmModal({ open: true, newStatus });
  };

  // ยืนยันอัปเดตสถานะ
  const confirmStatusUpdate = () => {
    if (confirmModal.newStatus) {
      setOrder((prev) => ({
        ...prev,
        status: confirmModal.newStatus!,
      }));
      message.success(`✅ อัปเดตสถานะเป็น: ${confirmModal.newStatus}`);
    }
    setConfirmModal({ open: false, newStatus: null });
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
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-gray-700">👤 ชื่อลูกค้า</span>
                  <span className="text-lg font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-gray-700">📞 เบอร์โทร</span>
                  <span className="text-lg font-medium">{order.phone}</span>
                </div>
                <div className="flex items-start justify-between border-b pb-2">
                  <span className="font-bold text-gray-700">🏠 ที่อยู่</span>
                  <span className="text-right max-w-[60%]">{order.address}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-gray-700">📌 สถานะ</span>
                  <span
                    className={`px-4 py-1 rounded-full text-white text-base font-semibold shadow-sm ${
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
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-gray-700">⚖️ น้ำหนักผ้า</span>
                  <span className="text-lg">{order.weight} kg</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-gray-700">🧺 จำนวนชิ้น</span>
                  <span className="text-lg">{order.totalItems} ชิ้น</span>
                </div>
                {order.washMachine && (
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-gray-700">🧭 ถังซัก</span>
                    <span className="text-lg">{order.washMachine}</span>
                  </div>
                )}
                {order.dryMachine && (
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-gray-700">🔥 ถังอบ</span>
                    <span className="text-lg">{order.dryMachine}</span>
                  </div>
                )}
                {order.statusNote && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">📝 หมายเหตุสถานะ</span>
                    <span className="text-lg max-w-[60%] text-right">{order.statusNote}</span>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          {/* กล่องจัดการถังซัก-อบ และอัปเดตสถานะ */}
          <Col xs={24} md={12}>
            <Row gutter={[16, 16]}>
              {/* กล่องเครื่องซักและอบ */}
              <Col span={24}>
                <Card bordered className="shadow-lg rounded-2xl bg-white" bodyStyle={{ padding: 20 }}>
                  <div className="flex flex-col space-y-3">
                    <Title level={4} className="!text-[#20639B] !mb-4">🧺 เครื่องซักและอบ</Title>

                    <Title level={5} className="!mb-2" style={{ fontSize: 14}}>เลือกถังซัก</Title>
                    <Select
                      placeholder="เลือกถังซัก"
                      style={{ width: "100%", maxWidth: 240, marginBottom: 12 }}
                      onChange={(value) => setSelectedWashMachine(value)}
                      options={[
                        { value: "ถังซัก 1", label: "ถังซัก 1" },
                        { value: "ถังซัก 2", label: "ถังซัก 2" },
                        { value: "ถังซัก 3", label: "ถังซัก 3" },
                        { value: "ถังซัก 4", label: "ถังซัก 4" },
                        { value: "ถังซัก 5", label: "ถังซัก 5" },
                        
                      ]}
                    />

                    <Title level={5} className="!mb-2" style={{ fontSize: 14}}>เลือกถังอบ</Title>
                    <Select
                      placeholder="เลือกถังอบ"
                      style={{ width: "100%", maxWidth: 240, marginBottom: 12 }}
                      onChange={(value) => setSelectedDryMachine(value)}
                      options={[
                        { value: "ถังอบ 1", label: "ถังอบ 1" },
                        { value: "ถังอบ 2", label: "ถังอบ 2" },
                        { value: "ถังอบ 3", label: "ถังอบ 3" },
                        { value: "ถังอบ 4", label: "ถังอบ 4" },
                        { value: "ถังอบ 5", label: "ถังอบ 5" },
                      ]}
                    />

                    <Button
                      type="primary"
                      block
                      onClick={() => {
                        setOrder(prev => ({
                          ...prev,
                          washMachine: selectedWashMachine || "",
                          dryMachine: selectedDryMachine || "",
                        }));
                        message.success("✅ บันทึกถังซักและถังอบเรียบร้อย");
                      }}
                      disabled={!selectedWashMachine && !selectedDryMachine}
                    >
                      💾 บันทึก
                    </Button>
                  </div>
                </Card>
              </Col>

              {/* กล่องอัปเดตสถานะ */}
              <Col span={24}>
                <Card bordered className="shadow-lg rounded-2xl bg-white" bodyStyle={{ padding: 20 }}>
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

                  <Title level={5} className="!mt-4 !mb-2" style={{ fontSize: 14 }}>หมายเหตุ</Title>
                  <TextArea
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="โปรดระบุหมายเหตุการอัปเดตสถานะ (ถ้ามี)"
                    className="mb-4"
                  />
                  <Button
                    type="primary"
                    block
                    style={{  
                      height: 44,
                      marginTop: 8,
                    }}
                    onClick={() => {
                      setOrder(prev => ({ ...prev, statusNote }));
                      message.success("✅ บันทึกหมายเหตุสถานะเรียบร้อย");
                    }}
                  >
                    💾 บันทึกหมายเหตุ
                  </Button>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Modal ยืนยันการอัปเดตสถานะ */}
        <Modal
          title="ยืนยันการอัปเดตสถานะ"
          open={confirmModal.open}
          onOk={confirmStatusUpdate}
          onCancel={() => setConfirmModal({ open: false, newStatus: null })}
          okText="ยืนยัน"
          cancelText="ยกเลิก"
        >
          <p>คุณต้องการอัปเดตสถานะเป็น <b>{confirmModal.newStatus}</b> ใช่หรือไม่?</p>
        </Modal>
      </div>
    </EmpSidebar>
  );
};

export default OrderDetail;
