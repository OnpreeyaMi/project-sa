import React, { useEffect, useState } from "react";
import { Table, Input, DatePicker, Select, Tag, message } from "antd";
import axios from "axios";
import AdminSidebar from "../../component/layout/admin/AdminSidebar";

interface PromotionUsage {
  ID: number;
  CustomerName: string;
  PromotionCode: string;
  PromotionName: string;
  OrderID: number;
  UsageDate: string;
  Status: string;
}

const PromotionUsageHistory: React.FC = () => {
  const [usages, setUsages] = useState<PromotionUsage[]>([]);
  const [promotions, setPromotions] = useState<{ PromotionName: string }[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedPromotion, setSelectedPromotion] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [dateRange, setDateRange] = useState<any>(null);

  useEffect(() => {
    fetchUsages();
    fetchPromotions();
  }, []);

  const fetchUsages = async () => {
    try {
      const res = await axios.get("http://localhost:8000/promotion-usages");
      setUsages(res.data);
    } catch (err) {
      message.error("โหลดข้อมูลประวัติการใช้โปรโมชั่นล้มเหลว");
    }
  };

  const fetchPromotions = async () => {
    try {
      const res = await axios.get("http://localhost:8000/promotions");
      setPromotions(res.data);
    } catch (err) {
      // ไม่ต้องแจ้ง error
    }
  };

  // ฟิลเตอร์ข้อมูล
  const filteredUsages = usages.filter((usage) => {
    const matchText =
      usage.CustomerName.toLowerCase().includes(searchText.toLowerCase()) ||
      usage.PromotionName.toLowerCase().includes(searchText.toLowerCase()) ||
      usage.PromotionCode.toLowerCase().includes(searchText.toLowerCase());
    const matchPromotion = selectedPromotion ? usage.PromotionName === selectedPromotion : true;
    const matchStatus = selectedStatus ? usage.Status === selectedStatus : true;
    const matchDate = dateRange
      ? usage.UsageDate >= dateRange[0].format("YYYY-MM-DD") && usage.UsageDate <= dateRange[1].format("YYYY-MM-DD")
      : true;
    return matchText && matchPromotion && matchStatus && matchDate;
  });

  const columns = [
    { title: "ชื่อลูกค้า", dataIndex: "CustomerName", key: "CustomerName" },
    { title: "รหัส/ชื่อโปรโมชั่น", dataIndex: "PromotionName", key: "PromotionName", render: (_: any, record: PromotionUsage) => `${record.PromotionCode} / ${record.PromotionName}` },
    { title: "รหัสออเดอร์", dataIndex: "OrderID", key: "OrderID" },
    { title: "วันที่ใช้", dataIndex: "UsageDate", key: "UsageDate" },
    { title: "สถานะ", dataIndex: "Status", key: "Status", render: (status: string) => <Tag color={status === "ใช้แล้ว" ? "green" : status === "ยกเลิก" ? "red" : "default"}>{status}</Tag> },
  ];

  // promotionOptions = รายชื่อโปรโมชั่นทั้งหมดในระบบ
  const promotionOptions = Array.from(new Set(promotions.map(p => p.PromotionName)));
  const statusOptions = ["ใช้แล้ว", "ยกเลิก", "หมดอายุ"];

  return (
    <AdminSidebar>
      <div className="min-h-screen p-8 font-sans bg-gray-50">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ประวัติการใช้โปรโมชั่น</h1>
            <p className="text-gray-500">ดูประวัติการใช้โปรโมชั่นทั้งหมดในระบบ</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input.Search
              placeholder="ค้นหาชื่อ / โปรโมชั่น / รหัส"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: "100%" }}
              allowClear
            />
            <Select
              placeholder="เลือกโปรโมชั่น"
              value={selectedPromotion || undefined}
              onChange={v => setSelectedPromotion(v)}
              allowClear
              style={{ width: "100%" }}
            >
              {promotionOptions.map(promo => (
                <Select.Option key={promo} value={promo}>{promo}</Select.Option>
              ))}
            </Select>
            <Select
              placeholder="สถานะ"
              value={selectedStatus || undefined}
              onChange={v => setSelectedStatus(v)}
              allowClear
              style={{ width: "100%" }}
            >
              {statusOptions.map(status => (
                <Select.Option key={status} value={status}>{status}</Select.Option>
              ))}
            </Select>
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <Table columns={columns} dataSource={filteredUsages} rowKey="ID" />
        </div>
      </div>
    </AdminSidebar>
  );
};

export default PromotionUsageHistory;
