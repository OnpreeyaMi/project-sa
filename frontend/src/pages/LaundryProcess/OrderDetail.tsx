import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Select,
  Input,
  Button,
  Space,
  message,
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
import { DeleteOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Title } = Typography;

interface Machine {
  ID: number;
  Machine_type: string;
  Status?: string;
}

const OrderDetail: React.FC = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingMachines, setSavingMachines] = useState(false);
  const [laundryProcesses, setLaundryProcesses] = useState<any[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedWashMachine, setSelectedWashMachine] = useState<number | null>(null);
  const [selectedDryMachine, setSelectedDryMachine] = useState<number | null>(null);
  const [statusNote, setStatusNote] = useState("");

  const latestProcessId = order?.LaundryProcesses?.length
    ? order.LaundryProcesses[order.LaundryProcesses.length - 1].ID
    : null;

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    newStatus: string | null;
  }>({ open: false, newStatus: null });

  // โหลดข้อมูลออเดอร์
  const loadOrder = async () => {
    if (!orderId) {
      message.error("ไม่พบ orderId");
      return;
    }
    try {
      setLoading(true);
      const data = await orderdeailService.getOrder(orderId);
      setOrder(data);

      const processRes = await orderdeailService.getProcessesByOrder(orderId);
      setLaundryProcesses(processRes);

      if (processRes.length) {
        const latestProcess = processRes[processRes.length - 1];
        if (latestProcess.Machine?.length) {
          const washMachine = latestProcess.Machine.find((m: any) => m.Machine_type === "washing");
          const dryMachine = latestProcess.Machine.find((m: any) => m.Machine_type === "drying");
          setSelectedWashMachine(washMachine?.ID || null);
          setSelectedDryMachine(dryMachine?.ID || null);
        }
        setStatusNote(latestProcess.Description || "");
      } else {
        message.warning("ไม่พบข้อมูล LaundryProcess สำหรับออเดอร์นี้");
      }
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถโหลดข้อมูลออเดอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  // โหลดข้อมูลเครื่องซัก/อบ
  useEffect(() => {
    const loadMachines = async () => {
      try {
        const machineData = await orderdeailService.getMachines();
        setMachines(machineData);
      } catch (err) {
        console.error("Error loading machines:", err);
        message.error("ไม่สามารถโหลดข้อมูลเครื่องซัก/อบได้");
      }
    };
    loadMachines();
  }, []);

  // เปลี่ยนการเลือกเครื่อง
  const handleWashMachineChange = (value: number | undefined) => {
    setSelectedWashMachine(value || null);
  };
  const handleDryMachineChange = (value: number | undefined) => {
    setSelectedDryMachine(value || null);
  };

  // บันทึกการเลือกเครื่อง
  const saveMachines = async () => {
    if (!latestProcessId) return;
    try {
      setSavingMachines(true);
      await orderdeailService.saveMachines(latestProcessId, [
        ...(selectedWashMachine ? [selectedWashMachine] : []),
        ...(selectedDryMachine ? [selectedDryMachine] : []),
      ]);
      message.success("บันทึกเครื่องซัก/อบ สำเร็จ");
      console.log(selectedWashMachine, selectedDryMachine);
      loadOrder();
    } catch (err) {
      console.error(err);
      message.error("บันทึกเครื่องซัก/อบ ไม่สำเร็จ");
    } finally {
      setSavingMachines(false);
    }
  };

  // บันทึกหมายเหตุ
  const saveStatusNote = async () => {
    if (!latestProcessId) return;
    try {
      await orderdeailService.updateStatus(latestProcessId, order.LaundryProcesses.slice(-1)[0]?.Status, statusNote);
      message.success("บันทึกหมายเหตุเรียบร้อย");
      loadOrder();
    } catch (err) {
      console.error(err);
      message.error("บันทึกหมายเหตุไม่สำเร็จ");
    }
  };

  // เลือกสถานะใหม่
  const handleStatusUpdate = (status: string) => {
    setConfirmModal({ open: true, newStatus: status });
  };

  // ยืนยันการอัปเดตสถานะ
  const confirmStatusUpdate = async () => {
    if (!latestProcessId || !confirmModal.newStatus) return;
    try {
      const updated = await orderdeailService.updateStatus(latestProcessId, confirmModal.newStatus, statusNote);
      setOrder((prev: any) => ({
        ...prev,
        LaundryProcesses: prev.LaundryProcesses.map((p: any) =>
          p.ID === latestProcessId ? { ...p, ...updated } : p
        ),
      }));
      message.success(`อัปเดตสถานะเป็น: ${confirmModal.newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      message.error("อัปเดตไม่สำเร็จ");
    } finally {
      setConfirmModal({ open: false, newStatus: null });
    }
  };

  if (loading) return <p>กำลังโหลด...</p>;
  if (!order) return <p>ไม่พบข้อมูลออเดอร์</p>;

  return (
    <EmployeeSidebar>
      <div className="p-6">
        <Row gutter={[24, 24]}>
          {/* ข้อมูลลูกค้า */}
          <Col xs={24} md={12}>
            <Card
              variant="outlined"
              styles={{ body: { padding: 28 } }}
              title={<div className="text-[#20639B] font-bold text-2xl">ข้อมูลลูกค้าและออเดอร์</div>}
            >
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-bold">👤 ชื่อลูกค้า</span>
                  <span>{order.Customer ? `${order.Customer.FirstName} ${order.Customer.LastName}` : "-"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-bold">📞 เบอร์โทร</span>
                  <span>{order.Customer?.PhoneNumber || "-"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-bold">🏠 ที่อยู่</span>
                  <span className="text-right max-w-[60%]">
                    {order.Address?.AddressDetails || order.Address?.address_details || "-"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-bold">📌 สถานะ</span>
                  <span
                    className={`px-4 py-1 rounded-full text-white font-semibold ${
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
                {/* 🧭 เครื่องซัก */}
                <div className="flex justify-between border-b pb-2 items-center">
                  <span className="font-bold">🧭 เครื่องซัก</span>
                  <span className="flex items-center gap-2">
                    {order.LaundryProcesses?.slice(-1)[0]?.Machines?.find((m: any) => m.Machine_type === "washing")
                      ? `ถังซัก ${order.LaundryProcesses.slice(-1)[0].Machines.find((m: any) => m.Machine_type === "washing").ID}`
                      : "-"}
                    {order.LaundryProcesses?.slice(-1)[0]?.Machines?.find((m: any) => m.Machine_type === "washing") && (
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={async () => {
                          try {
                            const washingMachine = order.LaundryProcesses?.slice(-1)[0]?.Machines?.find((m: any) => m.Machine_type === "washing");
                            if (!washingMachine) return;
                            setSelectedWashMachine(null);
                            await orderdeailService.deleteMachine(latestProcessId, washingMachine.ID);
                            message.success("ลบเครื่องซักออกเรียบร้อย");
                            loadOrder();
                          } catch (err) {
                            console.error(err);
                            message.error("ลบเครื่องซักไม่สำเร็จ");
                          }
                        }}
                      />
                    )}
                  </span>
                </div>
                {/* 🔥 เครื่องอบ */}
                <div className="flex justify-between border-b pb-2 items-center">
                  <span className="font-bold">🔥 เครื่องอบ</span>
                  <span className="flex items-center gap-2">
                    {order.LaundryProcesses?.slice(-1)[0]?.Machines?.find((m: any) => m.Machine_type === "drying")
                      ? `ถังอบ ${order.LaundryProcesses.slice(-1)[0].Machines.find((m: any) => m.Machine_type === "drying").ID}`
                      : "-"}
                    {order.LaundryProcesses?.slice(-1)[0]?.Machines?.find((m: any) => m.Machine_type === "drying") && (
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={async () => {
                          try {
                            const dryingMachine = order.LaundryProcesses?.slice(-1)[0]?.Machines?.find((m: any) => m.Machine_type === "drying");
                            if (!dryingMachine) return;
                            setSelectedDryMachine(null);
                            await orderdeailService.deleteMachine(latestProcessId, dryingMachine.ID);
                            message.success("ลบเครื่องอบออกเรียบร้อย");
                            loadOrder();
                          } catch (err) {
                            console.error(err);
                            message.error("ลบเครื่องอบไม่สำเร็จ");
                          }
                        }}
                      />
                    )}
                  </span>
                </div>
              </div>
            </Card>
          </Col>
          {/* เครื่องซัก/อบ + อัปเดตสถานะ */}
          <Col xs={24} md={12}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card variant="outlined" styles={{ body: { padding: 20 } }}>
                  <Title level={4} className="!text-[#20639B]">🧺 เครื่องซักและอบ</Title>
                  <Title level={5} style={{ fontSize: 14 }}>เลือกถังซัก</Title>
                  <Select
                    placeholder="เลือกถังซัก"
                    style={{ width: "100%", maxWidth: 240, marginBottom: 12 }}
                    value={selectedWashMachine || undefined}
                    onChange={handleWashMachineChange}
                    allowClear
                    options={machines
                      .filter(m => m.Machine_type === "washing" && (m.Status === "available" || m.ID === selectedWashMachine))
                      .map(m => ({ value: m.ID, label: `ถังซัก ${m.ID}` }))}
                  />
                  <Title level={5} style={{ fontSize: 14 }}>เลือกถังอบ</Title>
                  <Select
                    placeholder="เลือกถังอบ"
                    style={{ width: "100%", maxWidth: 240, marginBottom: 12 }}
                    value={selectedDryMachine || undefined}
                    onChange={handleDryMachineChange}
                    allowClear
                    options={machines
                      .filter(m => m.Machine_type === "drying" && (m.Status === "available" || m.ID === selectedDryMachine))
                      .map(m => ({ value: m.ID, label: `ถังอบ ${m.ID}` }))}
                  />
                  <Button
                    type="primary"
                    block
                    onClick={saveMachines}
                    loading={savingMachines}
                    disabled={selectedWashMachine === null && selectedDryMachine === null}
                  >
                    💾 {savingMachines ? "กำลังบันทึก..." : "บันทึก"}
                  </Button>
                </Card>
              </Col>

              <Col span={24}>
                <Card variant="outlined" styles={{ body: { padding: 20 } }}>
                  <Title level={4} className="!text-[#20639B]">🔄 อัปเดตสถานะการซัก</Title>
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
                  <Button type="primary" block onClick={saveStatusNote}>
                    💾 บันทึกหมายเหตุ
                  </Button>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

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