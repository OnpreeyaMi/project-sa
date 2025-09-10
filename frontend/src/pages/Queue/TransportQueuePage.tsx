import React, { useState, useEffect } from "react";
import { Layout, Table, Button, Modal, Descriptions, message, Divider } from "antd";
import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import { queueService } from "../../services/queueService";
import type { Queue } from "../../services/queueService";
import "./TransportQueuePage.css";

const { Content } = Layout;

const EMPLOYEE_ID = 1; // สมมติพนักงานคนนี้คือ id=1
const EMPLOYEE_NAME = "สมชาย ใจดี";

const TransportQueuePage: React.FC = () => {
  const [pickupQueues, setPickupQueues] = useState<Queue[]>([]);
  const [deliveryQueues, setDeliveryQueues] = useState<Queue[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [isPickup, setIsPickup] = useState(true);
  const [showConfirmDelivery, setShowConfirmDelivery] = useState(false);
  const [showConfirmPickup, setShowConfirmPickup] = useState(false);

  const deliveryEmployee = {
    name: EMPLOYEE_NAME,
    phone: "081-234-5678",
    gender: "ชาย",
    position: "พนักงานขนส่ง",
  };

  // โหลดคิวจาก backend
  const loadQueues = async () => {
    try {
      const pickup = await queueService.getQueues("pickup");
      const delivery = await queueService.getQueues("delivery");
      setPickupQueues(pickup);
      console.log("pickup_queue",pickup);
      setDeliveryQueues(delivery);
      console.log("delivery_queue", delivery);
    } catch (err) {
      message.error("โหลดข้อมูลคิวไม่สำเร็จ");
    }
  };

  useEffect(() => {
    loadQueues();
  }, []);

  const handleAcceptQueue = (queue: Queue, type: "pickup" | "delivery") => {
    setSelectedQueue(queue);
    setIsPickup(type === "pickup");
  };

  const handleConfirmAccept = async () => {
    if (!selectedQueue) return;
    try {
      await queueService.acceptQueue(selectedQueue.ID, EMPLOYEE_ID);
      message.success(isPickup ? "รับคิวรับผ้าเรียบร้อยแล้ว" : "รับคิวส่งผ้าเรียบร้อยแล้ว");
      setSelectedQueue(null);
      loadQueues();
    } catch {
      message.error("ไม่สามารถรับคิวได้");
    }
  };

  const handleConfirmDeliveryDone = async (queue: Queue) => {
    try {
      await queueService.confirmDeliveryDone(queue.ID);
      message.success("ยืนยันส่งผ้าแล้ว");
      setShowConfirmDelivery(false);
      setSelectedQueue(null);
      loadQueues();
    } catch {
      message.error("ไม่สามารถยืนยันการส่งผ้าได้");
    }
  };

  const handleConfirmPickupDone = async (queue: Queue) => {
    try {
      await queueService.confirmPickupDone(queue.ID);
      message.success("ยืนยันรับผ้าแล้ว");
      setShowConfirmPickup(false);
      setSelectedQueue(null);
      loadQueues();
    } catch {
      message.error("ไม่สามารถยืนยันการรับผ้าได้");
    }
  };

  const getStatusText = (q: Queue) => {
    const type = q.Queue_type?.toLowerCase().trim();
    const status = q.Status?.toLowerCase().trim();
    if (type === "delivery") {
      if (status === "waiting") return "รอรับคิวส่งผ้า";
      if (status === "delivery_in_progress") return `${EMPLOYEE_NAME} กำลังไปส่งผ้า`;
      if (status === "delivered") return "ส่งผ้าเรียบร้อยแล้ว";
      return "สถานะไม่ระบุ";
    } else if (type === "pickup") {
      if (status === "waiting") return "รอรับคิวรับผ้า";
      if (status === "pickup_in_progress") return `${EMPLOYEE_NAME} กำลังไปรับผ้า`;
      if (status === "done") return "รอรับคิวส่งผ้า";
      return "สถานะไม่ระบุ";
    }
    return "สถานะไม่ระบุ";
  };

  const pickupColumns = [
    { title: "Order ID", dataIndex: ["Order", "ID"] },
    {
      title: "ชื่อลูกค้า",
      render: (_: any, record: Queue) => {
        const customer = record.Order?.Customer;
        return customer ? `${customer.FirstName ?? ""} ${customer.LastName ?? ""}` : "-";
      },
    },
    {
      title: "ที่อยู่",
      render: (_: any, record: Queue) => {
        const address = record.Order?.Address;
        return address?.AddressDetails ?? "-";
      },
    },
    { title: "สถานะ", render: (_: any, record: Queue) => getStatusText(record) },
    {
      title: "จัดการ",
      render: (_: any, record: Queue) => {
        const type = record.Queue_type?.toLowerCase().trim();
        const status = record.Status?.toLowerCase().trim();
        // debug log
        // eslint-disable-next-line no-console
        console.log("[DEBUG] pickup row: id=", record.ID, "type=", type, "status=", status);
        if (type === "pickup" && status === "waiting") {
          return (
            <Button type="primary" onClick={() => handleAcceptQueue(record, "pickup")}> 
              กดรับคิวรับผ้า
            </Button>
          );
        } else if (type === "pickup" && status === "pickup_in_progress") {
          return (
            <Button danger onClick={() => { setSelectedQueue(record); setShowConfirmPickup(true); }}>
              ยืนยันรับผ้าแล้ว
            </Button>
          );
        }
        return null;
      },
    },
  ];

  const deliveryColumns = [
    { title: "Order ID", dataIndex: ["Order", "ID"] },
    {
      title: "ชื่อลูกค้า",
      render: (_: any, record: Queue) => {
        const customer = record.Order?.Customer;
        return customer ? `${customer.FirstName ?? ""} ${customer.LastName ?? ""}` : "-";
      },
    },
    {
      title: "ที่อยู่",
      render: (_: any, record: Queue) => {
        const address = record.Order?.Address;
        return address?.AddressDetails ?? "-";
      },
    },
    { title: "สถานะ", render: (_: any, record: Queue) => getStatusText(record) },
    {
      title: "จัดการ",
      render: (_: any, record: Queue) => {
        const type = record.Queue_type?.toLowerCase().trim();
        const status = record.Status?.toLowerCase().trim();
        // debug log
        // eslint-disable-next-line no-console
        console.log("[DEBUG] delivery row: id=", record.ID, "type=", type, "status=", status);
        if (type === "delivery" && status === "waiting") {
          return (
            <Button type="primary" onClick={() => handleAcceptQueue(record, "delivery")}> 
              กดรับคิวส่งผ้า
            </Button>
          );
        } else if (type === "delivery" && status === "delivery_in_progress") {
          return (
            <Button danger onClick={() => { setSelectedQueue(record); setShowConfirmDelivery(true); }}>
              ยืนยันส่งผ้าแล้ว
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <EmployeeSidebar>
      <Layout className="transport-layout">
        <Content className="transport-content">
          <Descriptions title="👤 ข้อมูลพนักงานขนส่ง" bordered column={2} className="transport-employee">
            <Descriptions.Item label="ชื่อ-สกุล">{deliveryEmployee.name}</Descriptions.Item>
            <Descriptions.Item label="เบอร์ติดต่อ">{deliveryEmployee.phone}</Descriptions.Item>
            <Descriptions.Item label="เพศ">{deliveryEmployee.gender}</Descriptions.Item>
            <Descriptions.Item label="ตำแหน่ง">{deliveryEmployee.position}</Descriptions.Item>
          </Descriptions>

          <h1 className="transport-heading" >🚚 คิวรับผ้า</h1>
          <Table columns={pickupColumns} dataSource={pickupQueues} rowKey="id" pagination={false} />

          <Divider />

          <h1 className="transport-heading">📦 คิวส่งผ้า</h1>
          <Table columns={deliveryColumns} dataSource={deliveryQueues} rowKey="id" pagination={false} />

          {/* Modal รับคิว */}
          <Modal
            open={!!selectedQueue && !showConfirmDelivery && !showConfirmPickup}
            title={isPickup ? "รายละเอียดคิวรับผ้า" : "รายละเอียดคิวส่งผ้า"}
            onCancel={() => setSelectedQueue(null)}
            onOk={handleConfirmAccept}
            okText="ยืนยันรับคิว"
            cancelText="ยกเลิก"
          >
            {selectedQueue && (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Order ID">{selectedQueue.Order?.ID}</Descriptions.Item>
                <Descriptions.Item label="ชื่อลูกค้า">
                  {`${selectedQueue.Order?.Customer?.FirstName ?? ""} ${selectedQueue.Order?.Customer?.LastName ?? ""}`}
                </Descriptions.Item>
                <Descriptions.Item label="ที่อยู่">{selectedQueue.Order?.Address?.AddressDetails}</Descriptions.Item>
              </Descriptions>
            )}
          </Modal>

          {/* Modal ยืนยันส่งผ้า */}
          <Modal
            open={showConfirmDelivery}
            title="ยืนยันการส่งผ้า"
            onOk={() => selectedQueue && handleConfirmDeliveryDone(selectedQueue)}
            onCancel={() => { setSelectedQueue(null); setShowConfirmDelivery(false); }}
            okText="ยืนยันส่งผ้าแล้ว"
            cancelText="ยกเลิก"
          >
            {selectedQueue && (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Order ID">{selectedQueue.Order?.ID}</Descriptions.Item>
                <Descriptions.Item label="ชื่อลูกค้า">
                  {`${selectedQueue.Order?.Customer?.FirstName ?? ""} ${selectedQueue.Order?.Customer?.LastName ?? ""}`}
                </Descriptions.Item>
                <Descriptions.Item label="ที่อยู่">{selectedQueue.Order?.Address?.AddressDetails}</Descriptions.Item>
              </Descriptions>
            )}
          </Modal>

          {/* Modal ยืนยันรับผ้า */}
          <Modal
            open={showConfirmPickup}
            title="ยืนยันการรับผ้า"
            onOk={() => selectedQueue && handleConfirmPickupDone(selectedQueue)}
            onCancel={() => { setSelectedQueue(null); setShowConfirmPickup(false); }}
            okText="ยืนยันรับผ้าแล้ว"
            cancelText="ยกเลิก"
          >
            {selectedQueue && (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Order ID">{selectedQueue.Order?.ID}</Descriptions.Item>
                <Descriptions.Item label="ชื่อลูกค้า">
                  {`${selectedQueue.Order?.Customer?.FirstName ?? ""} ${selectedQueue.Order?.Customer?.LastName ?? ""}`}
                </Descriptions.Item>
                <Descriptions.Item label="ที่อยู่">{selectedQueue.Order?.Address?.AddressDetails}</Descriptions.Item>
              </Descriptions>
            )}
          </Modal>
        </Content>
      </Layout>
    </EmployeeSidebar>
  );
};

export default TransportQueuePage;
