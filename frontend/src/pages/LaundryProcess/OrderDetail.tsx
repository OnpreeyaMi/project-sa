import React, { useState, useEffect } from "react";
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
import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import StatusCard from "../../component/StatusCard";
import { GiWashingMachine, GiClothes } from "react-icons/gi";
import { FaCheckCircle } from "react-icons/fa";
import { orderdeailService } from "../../services/orderdetailService";

const { TextArea } = Input;
const { Title } = Typography;

interface Machine {
  ID: number;
  Machine_type: string;
  status?: string;
}

const OrderDetail: React.FC = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedWashMachine, setSelectedWashMachine] = useState<number | null>(null);
  const [selectedDryMachine, setSelectedDryMachine] = useState<number | null>(null);
  const [statusNote, setStatusNote] = useState("");

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    newStatus: string | null;
  }>({ open: false, newStatus: null });

  // โหลดข้อมูลออเดอร์
  useEffect(() => {
    if (!orderId) return;
    orderdeailService.getOrder(orderId)
      .then(data => {
        setOrder(data);
        setLoading(false);
        if (data.LaundryProcesses?.length) {
          const latestProcess = data.LaundryProcesses[data.LaundryProcesses.length - 1];
          setSelectedWashMachine(latestProcess.Machine?.find((m: any) => m.Machine_type === "washing")?.ID || null);
          setSelectedDryMachine(latestProcess.Machine?.find((m: any) => m.Machine_type === "drying")?.ID || null);
        }
      })
      .catch(err => {
        console.error("Error fetching order:", err);
        setLoading(false);
      });
  }, [orderId]);

  // โหลดเครื่องซัก/อบ
  useEffect(() => {
    orderdeailService.getMachines()
      .then(setMachines)
      .catch(console.error);
  }, []);

  // Modal ยืนยันสถานะ
  const handleStatusUpdate = (newStatus: string) => {
    setConfirmModal({ open: true, newStatus });
  };

  // บันทึกเครื่องซัก/อบ
  const saveMachines = () => {
  if (!order || !order.LaundryProcesses?.length) return;
  const latestProcessId = order.LaundryProcesses[order.LaundryProcesses.length - 1].ID;
  const machine_ids = [selectedWashMachine, selectedDryMachine].filter(Boolean) as number[];
  orderdeailService.saveMachines(latestProcessId, machine_ids)
    .then(() => {
      message.success("✅ บันทึกถังซักและถังอบเรียบร้อย");
      // reload order ใหม่
      return orderdeailService.getOrder(orderId).then(setOrder);
    })
    .catch(() => message.error("❌ บันทึกไม่สำเร็จ"));
};

  // บันทึกหมายเหตุอย่างเดียว
  const saveStatusNote = async () => {
    if (!order || !order.LaundryProcesses?.length) return;
    const latestProcessId = order.LaundryProcesses[order.LaundryProcesses.length - 1].ID;
    try {
      await orderdeailService.updateStatus(
        latestProcessId,
        order.LaundryProcesses.slice(-1)[0]?.Status,
        statusNote
      );
      message.success("✅ บันทึกหมายเหตุเรียบร้อย");
      setOrder((prev: any) => ({
        ...prev,
        LaundryProcesses: prev.LaundryProcesses.map((p: any) =>
          p.ID === latestProcessId ? { ...p, status_note: statusNote } : p
        ),
      }));
    } catch {
      message.error("❌ บันทึกหมายเหตุไม่สำเร็จ");
    }
  };

  // ยืนยันอัปเดตสถานะ + หมายเหตุ
  const confirmStatusUpdate = () => {
    if (!order || !order.LaundryProcesses?.length || !confirmModal.newStatus) return;
    const latestProcessId = order.LaundryProcesses[order.LaundryProcesses.length - 1].ID;
    orderdeailService.updateStatus(latestProcessId, confirmModal.newStatus, statusNote)
      .then(updated => {
        setOrder((prev: any) => ({
          ...prev,
          LaundryProcesses: prev.LaundryProcesses.map((p: any) =>
            p.ID === latestProcessId ? { ...p, ...updated } : p
          ),
        }));
        message.success(`✅ อัปเดตสถานะเป็น: ${confirmModal.newStatus}`);
      })
      .catch(() => message.error("❌ อัปเดตไม่สำเร็จ"))
      .finally(() => setConfirmModal({ open: false, newStatus: null }));
  };

  if (loading) return <p>กำลังโหลด...</p>;
  if (!order) return <p>ไม่พบข้อมูลออเดอร์</p>;

  return (
    <EmployeeSidebar>
      <div className="p-6">
        <div className="mb-6">
          <Title level={2} className="!text-[#000000] !mb-1 flex items-center gap-2">
            🧺 รายละเอียดออเดอร์ <span className="text-gray-500 text-lg">#{orderId}</span>
          </Title>
          <Divider className="!my-2 !border-blue-400" />
        </div>

        <Row gutter={[24, 24]}>
          {/* ข้อมูลออเดอร์ */}
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
                  <span className="text-lg font-medium">
                    {order.Customer
                      ? `${order.Customer.FirstName || ""} ${order.Customer.LastName || ""}`.trim()
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-gray-700">📞 เบอร์โทร</span>
                  <span className="text-lg font-medium">
                    {order.Customer?.PhoneNumber || "-"}
                  </span>
                </div>
                <div className="flex items-start justify-between border-b pb-2">
                  <span className="font-bold text-gray-700">🏠 ที่อยู่</span>
                  <span className="text-right max-w-[60%]">{order.Address?.AddressDetails || "-"}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-gray-700">📌 สถานะ</span>
                  <span
                    className={`px-4 py-1 rounded-full text-white text-base font-semibold shadow-sm ${
                      order.LaundryProcesses?.slice(-1)[0]?.Status === "รอดำเนินการ"
                        ? "bg-orange-500"
                        : order.LaundryProcesses?.slice(-1)[0]?.Status === "กำลังซัก"
                        ? "bg-blue-500"
                        : order.LaundryProcesses?.slice(-1)[0]?.Status === "กำลังอบ"
                        ? "bg-purple-500"
                        : "bg-green-600"
                    }`}
                  >
                    {order.LaundryProcesses?.slice(-1)[0]?.Status || "รอดำเนินการ"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-gray-700">🧭 เครื่องซัก</span>
                  <span className="text-lg font-medium">
                    {order.LaundryProcesses?.slice(-1)[0]?.Machine?.find((m: any) => m.Machine_type === "washing")
                      ? `ถังซัก ${order.LaundryProcesses.slice(-1)[0].Machine.find((m: any) => m.Machine_type === "washing").ID}`
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-gray-700">🔥 เครื่องอบ</span>
                  <span className="text-lg font-medium">
                    {order.LaundryProcesses?.slice(-1)[0]?.Machine?.find((m: any) => m.Machine_type === "drying")
                      ? `ถังอบ ${order.LaundryProcesses.slice(-1)[0].Machine.find((m: any) => m.Machine_type === "drying").ID}`
                      : "-"}
                  </span>
                </div>
              </div>
            </Card>
          </Col>

          {/* เครื่องซัก/อบ + อัปเดตสถานะ */}
          <Col xs={24} md={12}>
            <Row gutter={[16, 16]}>
              {/* เครื่องซัก/อบ */}
              <Col span={24}>
                <Card bordered className="shadow-lg rounded-2xl bg-white" bodyStyle={{ padding: 20 }}>
                  <Title level={4} className="!text-[#20639B] !mb-4">🧺 เครื่องซักและอบ</Title>
                  <Title level={5} style={{ fontSize: 14 }}>เลือกถังซัก</Title>
                    <Select
                      placeholder="เลือกถังซัก"
                      style={{ width: "100%", maxWidth: 240, marginBottom: 12 }}
                      value={selectedWashMachine || undefined}
                      onChange={val => setSelectedWashMachine(Number(val))}
                      options={machines
                        .filter(m => m.Machine_type === "washing" && m.status !== "in_use")
                        .map(m => ({ value: m.ID, label: `ถังซัก ${m.ID}` }))}
                    />
                    <Title level={5} style={{ fontSize: 14 }}>เลือกถังอบ</Title>
                    <Select
                      placeholder="เลือกถังอบ"
                      style={{ width: "100%", maxWidth: 240, marginBottom: 12 }}
                      value={selectedDryMachine || undefined}
                      onChange={val => setSelectedDryMachine(Number(val))}
                      options={machines
                        .filter(m => m.Machine_type === "drying" && m.status !== "in_use")
                        .map(m => ({ value: m.ID, label: `ถังอบ ${m.ID}` }))}
                    />
                    <Button
                      type="primary"
                      block
                      onClick={saveMachines}
                      disabled={!selectedWashMachine && !selectedDryMachine}
                    >
                      💾 บันทึก
                    </Button>
                </Card>
              </Col>

              {/* อัปเดตสถานะ */}
              <Col span={24}>
                <Card bordered className="shadow-lg rounded-2xl bg-white" bodyStyle={{ padding: 20 }}>
                  <Title level={4} className="!text-[#20639B] !mb-2">🔄 อัปเดตสถานะการซัก</Title>
                  <Space wrap>
                    {["กำลังซัก", "กำลังอบ", "เสร็จสิ้น"].map(status => (
                      <StatusCard
                        key={status}
                        icon={status === "กำลังซัก" ? <GiWashingMachine size={30} /> : status === "กำลังอบ" ? <GiClothes size={30} /> : <FaCheckCircle size={30} />}
                        label={status}
                        value={status}
                        isSelected={order.LaundryProcesses?.slice(-1)[0]?.Status === status}
                        onClick={() => handleStatusUpdate(status)}
                      />
                    ))}
                  </Space>
                  <Title level={5} style={{ fontSize: 14, marginTop: 16 }}>หมายเหตุ</Title>
                  <TextArea
                    rows={2}
                    value={statusNote}
                    onChange={e => setStatusNote(e.target.value)}
                    placeholder="โปรดระบุหมายเหตุการอัปเดตสถานะ (ถ้ามี)"
                    className="mb-4"
                  />
                  <Button
                    type="primary"
                    block
                    onClick={saveStatusNote}
                    style={{ marginBottom: 8 }}
                  >
                    💾 บันทึกหมายเหตุ
                  </Button>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Modal ยืนยัน */}
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
    </EmployeeSidebar>
  );
};

export default OrderDetail;