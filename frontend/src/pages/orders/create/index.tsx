import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Upload,
  Input,
  Radio,
  Typography,
  Divider,
  Modal,
  Tooltip,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import CustomerSidebar from "../../../component/layout/customer/CusSidebar";
import { BiSolidWasher, BiSolidDryer } from "react-icons/bi";
import { FaJugDetergent } from "react-icons/fa6";
import { createOrder } from '../../../services/orderService';

const descriptionsWashing: Record<number, string> =  {
  10: `เสื้อยืด ผ้าบาง 13 ชิ้น\n ผ้าหนา ยีนส์ 8 ชิ้น`,
  14: "เสื้อยืด ผ้าบาง 20 ชิ้น\n ผ้าหนา ยีนส์ 10 ชิ้น\n ชุดเครื่องนอน 3 ฟุต",
  18: "เสื้อยืด ผ้าบาง 25 ชิ้น\n ผ้าหนา ยีนส์ 15 ชิ้น\n ชุดเครื่องนอน 5 ฟุต",
  28: "เสื้อยืด ผ้าบาง 35 ชิ้น\n ผ้าหนา ยีนส์ 20 ชิ้น\n ชุดเครื่องนอน 6 ฟุต",
};
const pricesWashing: Record<number, string> = {
  10: "฿ 50",
  14: "฿ 70",
  18: "฿ 90",
  28: "฿ 120",
};

const descriptionsDryer: Record<number, string> = {
  14: "อบแห้งได้ประมาณ 20 ชิ้น \nหรือผ้าหนา 10 ชิ้น",
  25: "อบแห้งได้ประมาณ 30 ชิ้น \nหรือผ้าหนา 15 ชิ้น",
};
const pricesDryer: Record<number, string> = {
  14: "฿ 50",
  25: "฿ 70",
};

const { Title, Text } = Typography;

const OrderPage: React.FC = () => {
  const [selectedWasher, setSelectedWasher] = useState<number | null>(null);
  const [selectedDryer, setSelectedDryer] = useState<number | null>(null);
  const [selectDetergent, setSelectDetergent] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [orderImage, setOrderImage] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);

  const handleConfirm = () => {
    if (!selectedAddress) {
      AntdModal.error({ title: "กรุณาเลือกที่อยู่ก่อน" });
      return;
    }
    setIsModalVisible(true);
  };

  // ปุ่ม OK ใน Modal
  const handleModalOk = async () => {
    setIsModalVisible(false);

    const orderData = {
      customer_id: 1,
      servicetype_ids: selectedWasher ? [selectedWasher] : [],
      detergent_ids: selectDetergent === "home" ? [1] : selectDetergent === "shop" ? [2] : [],
      order_image: orderImage,
      order_note: orderNote,
      address_id: 1,
    };

    try {
      await createOrder(orderData);
      console.log(orderData, "Order created successfully");
      Modal.success({ title: "สร้างออเดอร์สำเร็จ!" });
      
    } catch (err) {
      console.error(err);
      Modal.error({ title: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์" });
    } finally {
      setIsModalVisible(false);
    }
  };

  return (
    <CustomerSidebar>
      <Row gutter={[16, 16]} justify="center">
        {/* ซ้าย: รายการออเดอร์ */}
        <Col xs={24} lg={16}>
            <Title level={4}>เลือกถังซักที่ต้องการ</Title>
            {/* น้ำหนักผ้า */}
            <Row gutter={[16, 16]} style={{ marginBottom: 30 }} justify="center">
              {[10, 14, 18, 28].map((kg) => {
              const iconSize =
                kg === 10 ? 50 :
                kg === 14 ? 60 :
                kg === 18 ? 80 :
                90; // 28kg ใหญ่สุด

                return (
                <Col key={kg} xs={12} sm={12} md={6} lg={6}>
                  <Tooltip title={pricesWashing[kg]} placement="bottom">
                  <Card
                    hoverable
                    onClick={() => setSelectedWasher(kg)}
                    style={{
                      textAlign: "center",
                      borderRadius: 8,
                      background: selectedWasher === kg ? "#F9FBFF" : "#D9D9D9",
                      width: "auto",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                    }}                    
                    >
                      <div style={{ height: 75, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <BiSolidWasher size={iconSize} style={{ color: selectedWasher === kg ? "#ED553B" : "#6DA3D3" }} />
                  </div>
                      <Text style={{ display: "block", fontSize: 16 }}>{kg} KG</Text>
                      <Text type="secondary" style={{ fontSize: 14, marginTop: 6, whiteSpace: "pre-line", minHeight: "50px" }}>
                      {descriptionsWashing[kg]}
                    </Text>
                  </Card>
                  </Tooltip>
                </Col>
              );
            })}
            </Row>

            {/* ถังอบ */}
            <Title level={4}>เลือกถังอบที่ต้องการ</Title>
            <Row gutter={[16, 16]} style={{ marginBottom: 30 }} justify="center">
              <Col xs={12} sm={12} md={6} lg={6}>
                <Card
                  hoverable
                  onClick={() => setSelectedDryer(null)}
                  style={{
                    width: "100%",
                    maxWidth: "200px",
                    height: 215,
                    textAlign: "center",
                    borderRadius: 8,
                    background: selectedDryer === null ? "#F9FBFF" : "#D9D9D9",
                    display: "flex",  
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                <Text type="danger" style={{ fontSize: 16 }}>NO</Text>
                </Card>
              </Col>
            {[14, 25].map((kg) => (
              <Col key={kg} xs={12} sm={12} md={6} lg={6}>
                  <Tooltip title={pricesDryer[kg]} placement="bottom">
                  <Card
                    hoverable
                    onClick={() => setSelectedDryer(kg)}
                    style={{
                      width: "100%",
                      maxWidth: "200px",
                      textAlign: "center",
                      borderRadius: 8,
                      background: selectedDryer === kg ? "#F9FBFF" : "#D9D9D9",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ height: 75, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      <BiSolidDryer size={kg === 14 ? 60 : 80} style={{ color: selectedDryer === kg ? "#F6D55C" : "#6DA3D3" }} />
                  </div>
                    <Text style={{ display: "block", fontSize: 16 }}>{kg} KG</Text>
                    <Text type="secondary" style={{ fontSize: 14, marginTop: 6, whiteSpace: "pre-line", minHeight: "50px" }}>
                      {descriptionsDryer[kg]}
                    </Text>
                  </Card>
                  </Tooltip>
                </Col>
            ))}
            </Row>

            {/* น้ำยาซักผ้า */}
            <Title level={4}>เลือกน้ำยาซักผ้าที่ต้องการ</Title>
            <Row gutter={[16, 16]} justify="center">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  onClick={() => setSelectDetergent("home")}
                  style={{
                    width: "100%",
                    maxWidth: "200px",
                    textAlign: "center",
                    borderRadius: 8,
                    background: selectDetergent === "home" ? "#F9FBFF" : "#D9D9D9",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  }}
                >
                <FaJugDetergent size={75} style={{ color: selectDetergent === "home" ? "#3CAEA3" : "#6DA3D3" }} />
                <Text style={{ fontSize: 16 }}>ทางบ้าน</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  onClick={() => setSelectDetergent("shop")}
                  style={{
                    width: "100%",
                    maxWidth: "200px",
                    textAlign: "center",
                    borderRadius: 8,
                    background: selectDetergent === "shop" ? "#F9FBFF" : "#D9D9D9",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  }}
                >
                  <FaJugDetergent size={75} style={{ color: selectDetergent === "shop" ? "#ED553B" : "#6DA3D3" }} />
                <Text style={{ fontSize: 16 }}>ทางร้าน</Text>
                </Card>
              </Col>
            </Row>
        </Col>

        {/* ขวา: ฟอร์มสร้างออเดอร์ */}
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 10 }}>
            <Title level={4} style={{ textAlign: "center" }}>สร้างออเดอร์</Title>
            <Divider />

            {/* ชื่อผู้รับ {receiverName} */}
            <Title level={5}>คุณ สมใจ</Title>
            {/*<Text style={{ display: "block", marginBottom: 15 }}>สมใจ</Text>*/}

            {/* ที่อยู่ */}
            <Title level={5}>ที่อยู่</Title>
            <Radio.Group
              style={{ display: "block", marginBottom: 15 }}
              onChange={(e) => setSelectedAddress(e.target.value)}
              value={selectedAddress}
            >
              <Radio value={1}>ที่อยู่เดิมบ้าน</Radio>
              <Radio value={2}>เลือกที่อยู่ใหม่ บ้านใหม่</Radio>
            </Radio.Group>

            {/* รูปภาพ */}
            <Title level={5}>รูปภาพ</Title>
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                  setOrderImage(reader.result as string); // เก็บ Base64 ใน state
                };
                return false; // ป้องกัน Upload อัตโนมัติ
              }}
              onRemove={() => setOrderImage(null)}
            >
              {!orderImage && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>อัปโหลด</div>
              </div>
              )}
            </Upload>

            {/* หมายเหตุ */}
            <Title level={5}>หมายเหตุ</Title>
            <Input.TextArea
              placeholder="หมายเหตุ"
              rows={2}
              style={{ marginBottom: 20 }}
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
            />

            {/* ปุ่มยืนยัน */}
            <Button type="primary" block style={{ height: 40, fontSize: 16 }} onClick={handleConfirm}>
              ยืนยัน
            </Button>
          </Card>
        </Col>
      </Row>
      {/* Modal แสดงสรุป */}
      <Modal
        title={<span style={{ color: "#20639B", fontWeight: "bold", fontSize: "20px" }}>สรุปรายการออเดอร์</span>}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="ยืนยัน"
        cancelText="แก้ไข"
        footer={
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <Button onClick={() => setIsModalVisible(false)}>แก้ไข</Button>
            <Button type="primary" onClick={handleModalOk}>
              ยืนยัน
            </Button>
          </div>
        }
        style={{ top: "20%", textAlign: "center" }}
        width={400}
      >
        <div style={{ textAlign: "left" }}>
          <p><b>คุณ:</b> สมใจ</p>
          <p><b>ที่อยู่:</b> {selectedAddress || "ไม่ได้เลือก"}</p>
          <p><b>ถังซัก:</b> {selectedWasher ? `${selectedWasher} KG` : "ไม่ได้เลือก"}</p>
          <p><b>ถังอบ:</b> {selectedDryer ? `${selectedDryer} KG` : "NO"}</p>
          <p><b>น้ำยาซักผ้า:</b> {selectDetergent === "home" ? "ทางบ้าน" : selectDetergent === "shop" ? "ทางร้าน" : "ไม่ได้เลือก"}</p>
          <p><b>หมายเหตุ:</b> {orderNote || "ไม่มีหมายเหตุ"}</p>
        </div>
      </Modal>
      {/* Modal เลือกที่อยู่บน Google Map
      <Modal
        title="เลือกตำแหน่งบนแผนที่"
        open={isMapModal}
        onOk={() => setIsMapModal(false)}
        onCancel={() => setIsMapModal(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={800}
        centered
      >
        {isLoaded ? (
          <GoogleMap
            center={markerPosition}
            zoom={15}
            mapContainerStyle={{ width: "100%", height: "400px" }}
            onClick={(e) => {
              if (e.latLng) {
                setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
              } 
            }}
          >
            <Marker position={markerPosition} />
          </GoogleMap>
        ) : (
          <p>Loading map...</p>
        )}
        <Input.TextArea
          rows={2}
          placeholder="รายละเอียดที่อยู่ (เช่น ซอย ถนน)"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          style={{ marginTop: 10 }}
        />
      </Modal> */}
    </CustomerSidebar>
  );
};

export default OrderPage;
