import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Upload,
  Input,
  Typography,
  Divider,
  Modal as AntdModal,
  Modal,
  Tooltip,
} from "antd";
import { UploadOutlined ,CheckCircleFilled ,InfoCircleOutlined} from "@ant-design/icons";
import CustomerSidebar from "../../../component/layout/customer/CusSidebar";
import { TbWashDrycleanOff, TbWash } from "react-icons/tb";
import { LuDroplet, LuWind } from "react-icons/lu";
import { createOrder, 
  fetchDetergentsByType, 
  fetchAddresses, 
  fetchCustomerNameById, 
  createNewAddress, 
  setMainAddress 
} from '../../../services/orderService';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import mieleWashingMachineImg from '../../../assets/washing-machine-miele.png';
import boschDryerImg from '../../../assets/dryer-bosch.png';

const descriptionsWashing: Record<number, string> =  {
  10: "เสื้อยืด ผ้าบาง 13 ชิ้น\n ผ้าหนา ยีนส์ 8 ชิ้น",
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [orderImage, setOrderImage] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addingNewAddress, setAddingNewAddress] = useState(false); // toggle โหมดเพิ่มที่อยู่ใหม่
  const [newAddress, setNewAddress] = useState("");
  const [newLat, setNewLat] = useState(14.979900);
  const [newLng, setNewLng] = useState(102.097771);
  const [isMapModal, setIsMapModal] = useState(false);
  const userId = localStorage.getItem("userId");
  const userObj = localStorage.getItem("user");
  let currentUserInit = null;
  if (userObj) {
    const parsed = JSON.parse(userObj);
    if (parsed.customer) {
      currentUserInit = {
        firstName: parsed.customer.firstName,
        lastName: parsed.customer.lastName,
        ID: Number(userId)
      };
    }
  }
  const [currentUser, setCurrentUser] = useState<any>(currentUserInit);
  // เพิ่ม state สำหรับ address หลัก
  const [primaryAddressId, setPrimaryAddressId] = useState<number | null>(null);
  const [detergentsWashing, setDetergentsWashing] = useState<any[]>([]);
  const [detergentsSoftener, setDetergentsSoftener] = useState<any[]>([]);
  const [selectedWashingId, setSelectedWashingId] = useState<number | null>(null);
  const [selectedSoftenerId, setSelectedSoftenerId] = useState<number | null>(null);
  const [newIsPrimary, setNewIsPrimary] = useState(false); // state สำหรับ checkbox ตั้งเป็นที่อยู่หลัก
  const [infoModal, setInfoModal] = useState<{visible: boolean, kg: number | null}>({visible: false, kg: null});
  const [infoDryerModal, setInfoDryerModal] = useState<{visible: boolean, kg: number | null}>({visible: false, kg: null});
  const mapRef = useRef<any>(null); // สำหรับ Leaflet map instance

  // Mapping KG → ServiceType ID
  const washerIdMap: Record<number, number> = { 10: 1, 14: 2, 18: 3, 28: 4 };
  const dryerIdMap: Record<number, number> = { 14: 5, 25: 6, 0: 7 }; // 0 = NO Dryer

  // เพิ่มฟังก์ชันดึงตำแหน่งปัจจุบันแบบเรียลไทม์
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      pos => setCurrentPosition([pos.coords.latitude, pos.coords.longitude]),
      err => console.error(err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ปุ่ม ยืนยัน ใน Modal
  const handleConfirm = async () => {
    setIsModalVisible(false);

    // serviceTypeIds: รวม id ของ washer และ dryer (mapping จากที่เลือก)
    const serviceTypeIds: number[] = [];
    if (selectedWasher) serviceTypeIds.push(washerIdMap[selectedWasher]);
    if (selectedDryer !== null) serviceTypeIds.push(dryerIdMap[selectedDryer] ?? 7);

    const detergentIds: number[] = [];
    if (selectedWashingId) detergentIds.push(selectedWashingId);
    if (selectedSoftenerId) detergentIds.push(selectedSoftenerId);

    const orderData = {
      customer_id: currentUser?.ID || 1,
      service_type_ids: serviceTypeIds, // เปลี่ยนชื่อ field ให้ตรง backend
      detergent_ids: detergentIds,
      order_image: orderImage,
      order_note: orderNote,
      address_id: selectedAddress ?? 0, // fallback เป็น 0 ถ้า null
    };

    try {
      await createOrder(orderData);
      console.log(orderData, "Order created successfully");
      AntdModal.success({ title: "สร้างออเดอร์สำเร็จ!" });
    } catch (err) {
      console.error(err);
      AntdModal.error({ title: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์" });
    } finally {
      setIsModalVisible(false);
    }
  };
  // โหลดที่อยู่เมื่อ currentUser เปลี่ยน
  useEffect(() => {
    if (currentUser && currentUser.ID) {
      // ดึง addresses จาก backend ทุกครั้ง ไม่ใช้ localStorage
      const fetch = async () => {
        const arrRaw = await fetchAddresses(currentUser.ID);
        const arr = normalizeAddresses(arrRaw);
        setAddresses(arr);
        const primary = arr.find((a: any) => a.isPrimary || a.isDefault);
        if (primary) {
          setPrimaryAddressId(primary.ID);
          setSelectedAddress(primary.ID);
        } else if (arr.length > 0) {
          setPrimaryAddressId(arr[0].ID);
          setSelectedAddress(arr[0].ID);
        }
      };
      fetch();
    }
    // eslint-disable-next-line
  }, [currentUser]);

  useEffect(() => {
    // ถ้า currentUser มีข้อมูลแล้ว ไม่ต้อง fetch ใหม่
    if (currentUser) return;
    const fetchUser = async () => {
      try {
        if (!userId) {
          setCurrentUser(null);
          return;
        }
        const res = await fetchCustomerNameById(Number(userId));
        setCurrentUser({ ...res, ID: Number(userId) });
      } catch (err) {
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, [userId, currentUser]);

  useEffect(() => {
    // โหลดน้ำยาซักผ้าและปรับผ้านุ่มแยกประเภท
    const fetchDetergentOptions = async () => {
      console.log("Washing:", detergentsWashing);
      console.log("Softener:", detergentsSoftener);
      try {
        const washing = await fetchDetergentsByType("detergent");
        const softener = await fetchDetergentsByType("softener");
        setDetergentsWashing(washing || []);
        setDetergentsSoftener(softener || []);
      } catch {}
    };
    fetchDetergentOptions();
  }, []);

  const customerName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : "-";

  useEffect(() => {
    if (isMapModal && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300); // รอ modal เปิด animation
    }
  }, [isMapModal]);

  return (
    <CustomerSidebar>
      <Row gutter={[24, 24]} justify="start" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
        {/* ซ้าย: รายการออเดอร์ */}
        <Col xs={24} >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EAF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TbWash size={28} style={{ color: '#6DA3D3' }} />
              </div>
              <Title level={4} style={{ margin: 0 }}>เลือกถังซักที่ต้องการ</Title>
            </div>
            {/* น้ำหนักผ้า */}
            <Row gutter={[16, 16]} style={{ marginBottom: 30 }} justify="space-between">
              {[10, 14, 18, 28].map((kg) => {
                return (
                  <Col key={kg} xs={24} sm={12} md={6} lg={6}>
                    <Card
                      hoverable
                      onClick={() => setSelectedWasher(kg)}
                      style={{
                        textAlign: "center",
                        borderRadius: 20,
                        boxShadow: selectedWasher === kg ? "0 4px 16px #6DA3D340" : "0 2px 8px #D9D9D980",
                        background: selectedWasher === kg ? "#F9FBFF" : "#fff",
                        border: selectedWasher === kg ? "2px solid #6DA3D3" : "1px solid #eee",
                        width: "100%",
                        minWidth: 160,
                        minHeight: 220,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.2s",
                      }}
                    >
                      <img src={mieleWashingMachineImg} alt="เครื่องซักผ้า" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 16, marginBottom: 12 }} />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                        <Text style={{ fontWeight: 600, fontSize: 22 }}>{kg} KG</Text>
                        <Tooltip title={<span style={{ whiteSpace: 'pre-line', fontSize: 15 }}>{descriptionsWashing[kg]}</span>} placement="bottom">
                          <Button
                            shape="circle"
                            icon={<InfoCircleOutlined />}
                            style={{ background: '#F6FBEA', border: '1px solid #E0E0E0', boxShadow: '0 1px 4px #D9D9D980' }}
                            onClick={e => { e.stopPropagation(); setInfoModal({visible: true, kg}); }}
                          />
                        </Tooltip>
                      </div>
                      <div style={{ position: "absolute", top: 12, left: 12, background: "#6DA3D3", color: "#fff", borderRadius: 8, padding: "2px 10px", fontWeight: 500, fontSize: 15 }}>
                        {pricesWashing[kg]}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
            <Modal
              open={infoModal.visible}
              onCancel={() => setInfoModal({visible: false, kg: null})}
              footer={null}
              centered
            >
              <Title level={5} style={{ marginBottom: 8 }}>รายละเอียดถังซัก {infoModal.kg} KG</Title>
              <Text style={{ whiteSpace: 'pre-line', fontSize: 16 }}>{infoModal.kg ? descriptionsWashing[infoModal.kg] : ''}</Text>
            </Modal>

            {/* ถังอบ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFF9E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LuWind size={28} style={{ color: '#F6D55C' }} />
              </div>
              <Title level={4} style={{ margin: 0 }}>เลือกถังอบที่ต้องการ</Title>
            </div>
            <Row gutter={[24, 24]} style={{ marginBottom: 30 }} justify="center">
              <Col xs={24} sm={12} md={6} lg={6}>
                <Card
                  hoverable
                  onClick={() => setSelectedDryer(null)}
                  style={{
                    width: "100%",
                    minWidth: 160,
                    minHeight: 275,
                    textAlign: "center",
                    borderRadius: 20,
                    boxShadow: selectedDryer === null ? "0 4px 16px #ED553B40" : "0 2px 8px #D9D9D980",
                    background: selectedDryer === null ? "#FFF9E5" : "#fff",
                    border: selectedDryer === null ? "2px solid #ED553B" : "1px solid #eee",
                    display: "flex",  
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    transition: "all 0.2s",
                  }}
                >
                  <TbWashDrycleanOff size={80} style={{ color: selectedDryer === null ? "#ED553B" : "#6DA3D3", marginBottom: 12 }} />
                  <Text style={{ fontWeight: 600, fontSize: 22, color: selectedDryer === null ? "#ED553B" : undefined }}>NO</Text>
                  <Text type="secondary" style={{ fontSize: 16, marginTop: 4, minHeight: "48px" }}>
                    ไม่อบแห้ง
                  </Text>
                </Card>
              </Col>
              {[14, 25].map((kg) => (
                <Col key={kg} xs={24} sm={12} md={6} lg={6}>
                  <Card
                    hoverable
                    onClick={() => setSelectedDryer(kg)}
                    style={{
                      width: "100%",
                      minWidth: 160,
                      minHeight: 220,
                      textAlign: "center",
                      borderRadius: 20,
                      boxShadow: selectedDryer === kg ? "0 4px 16px #F6D55C40" : "0 2px 8px #D9D9D980",
                      background: selectedDryer === kg ? "#FFF9E5" : "#fff",
                      border: selectedDryer === kg ? "2px solid #F6D55C" : "1px solid #eee",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      transition: "all 0.2s",
                    }}
                  >
                    <img src={boschDryerImg} alt="เครื่องอบผ้า" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 16, marginBottom: 12 }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                      <Text style={{ fontWeight: 600, fontSize: 22 }}>{kg} KG</Text>
                      <Tooltip title={<span style={{ whiteSpace: 'pre-line', fontSize: 15 }}>{descriptionsDryer[kg]}</span>} placement="bottom">
                        <Button
                          shape="circle"
                          icon={<InfoCircleOutlined />}
                          style={{ background: '#F6FBEA', border: '1px solid #E0E0E0', boxShadow: '0 1px 4px #D9D9D980' }}
                          onClick={e => { e.stopPropagation(); setInfoDryerModal({visible: true, kg}); }}
                        />
                      </Tooltip>
                    </div>
                    <div style={{ position: "absolute", top: 12, left: 12, background: "#F6D55C", color: "#fff", borderRadius: 8, padding: "2px 10px", fontWeight: 500, fontSize: 15 }}>
                      {pricesDryer[kg]}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <Modal
              open={infoDryerModal.visible}
              onCancel={() => setInfoDryerModal({visible: false, kg: null})}
              footer={null}
              centered
            >
              <Title level={5} style={{ marginBottom: 8 }}>รายละเอียดถังอบ {infoDryerModal.kg} KG</Title>
              <Text style={{ whiteSpace: 'pre-line', fontSize: 16 }}>{infoDryerModal.kg ? descriptionsDryer[infoDryerModal.kg] : ''}</Text>
            </Modal>

          {/* เลือกน้ำยาซักผ้า/ปรับผ้านุ่ม */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EAFBE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LuDroplet size={28} style={{ color: '#43A047' }} />
            </div>
            <Title level={4} style={{ margin: 0 }}>เลือกน้ำยาซักผ้า/ปรับผ้านุ่ม</Title>
          </div>
          <Row gutter={[16, 16]} justify="center">
            <Col xs={12} sm={12} md={8} lg={8}>
              <Card style={{ borderRadius: 8, padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: 600 }}>น้ำยาซักผ้า</Text>
                <Slider dots infinite speed={500} slidesToShow={1} slidesToScroll={1}>
                  {detergentsWashing.map((brand: any) => (
                    <div key={brand.ID || brand.id}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        {brand.Image || brand.image ? (
                          <img src={brand.Image || brand.image} alt={brand.Name || brand.name} style={{ width: 75, height: 75, objectFit: 'contain', borderRadius: 12, background: '#fff' }} />
                        ) : (
                          <span style={{ fontSize: 60 }}>🧴</span>
                        )}
                        <Text style={{ fontSize: 18, marginTop: 8 }}>{brand.Name || brand.name}</Text>
                        <Button
                          type={selectedWashingId === (brand.ID || brand.id) ? "primary" : "default"}
                          style={{ marginTop: 10, background: (brand.InStock === 0 || brand.inStock === 0) ? '#ED553B' : undefined, color: (brand.InStock === 0 || brand.inStock === 0) ? '#fff' : undefined }}
                          onClick={() => setSelectedWashingId(brand.ID || brand.id)}
                          disabled={brand.InStock === 0 || brand.inStock === 0}
                        >{(brand.InStock === 0 || brand.inStock === 0) ? "หมดแล้ว" : "เลือกน้ำยานี้"}</Button>
                        <div style={{ marginTop: 8, background: '#f6f6f6', borderRadius: 6, padding: 8 }}>
                          <b>คงเหลือ:</b> {brand.InStock || brand.inStock}
                          {brand.InStock === 0 || brand.inStock === 0 ? (
                            <span style={{ color: '#ED553B', fontWeight: 600, marginLeft: 8 }}>หมดแล้ว</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <Card style={{ borderRadius: 8, padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: 600 }}>น้ำยาปรับผ้านุ่ม</Text>
                <Slider dots infinite speed={500} slidesToShow={1} slidesToScroll={1}>
                  {detergentsSoftener.map((brand: any) => (
                    <div key={brand.ID || brand.id}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        {brand.Image || brand.image ? (
                          <img src={brand.Image || brand.image} alt={brand.Name || brand.name} style={{ width: 75, height: 75, objectFit: 'contain', borderRadius: 12, background: '#fff' }} />
                        ) : (
                          <span style={{ fontSize: 60 }}>🧴</span>
                        )}
                        <Text style={{ fontSize: 18, marginTop: 8 }}>{brand.Name || brand.name}</Text>
                        <Button
                          type={selectedSoftenerId === (brand.ID || brand.id) ? "primary" : "default"}
                          style={{ marginTop: 10, background: (brand.InStock === 0 || brand.inStock === 0) ? '#ED553B' : undefined, color: (brand.InStock === 0 || brand.inStock === 0) ? '#fff' : undefined }}
                          onClick={() => setSelectedSoftenerId(brand.ID || brand.id)}
                          disabled={brand.InStock === 0 || brand.inStock === 0}
                        >{(brand.InStock === 0 || brand.inStock === 0) ? "หมดแล้ว" : "เลือกน้ำยานี้"}</Button>
                        <div style={{ marginTop: 8, background: '#f6f6f6', borderRadius: 6, padding: 8 }}>
                          <b>คงเหลือ:</b> {brand.InStock || brand.inStock}
                          {brand.InStock === 0 || brand.inStock === 0 ? (
                            <span style={{ color: '#ED553B', fontWeight: 600, marginLeft: 8 }}>0</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      {/* การ์ดสร้างออเดอร์แบบใหม่ */}
      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        <Col xs={24} md={16}>
          <Card style={{ borderRadius: 16, marginBottom: 24, background: '#EAF1FF' }}>
            {/* ข้อมูลผู้รับ */}
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
              คุณ {customerName}
            </div>
            <Divider style={{ margin: '12px 0' }} />
            {/* ที่อยู่จัดส่ง */}
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
              ที่อยู่จัดส่ง
            </div>
            <div style={{ marginBottom: 8 }}>{selectedAddress ? addresses.find((address) => address.ID === selectedAddress)?.AddressDetails : <span style={{ color: '#aaa' }}>กรุณาเลือกที่อยู่จัดส่ง</span>}</div>
            <Button type="primary" style={{ background: '#ED553B', border: 'none', marginBottom: 8 }} onClick={() => setIsMapModal(true)}>
              เปลี่ยนที่อยู่
            </Button>
            <Divider style={{ margin: '12px 0' }} />
            {/* รูปภาพประกอบ */}
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
              รูปภาพประกอบ
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    setOrderImage(reader.result as string);
                  };
                  return false;
                }}
                onRemove={() => setOrderImage(null)}
              >
                {!orderImage && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>คลิกเพื่ออัปโหลดรูปภาพ</div>
                    <div style={{ fontSize: 12, color: '#888' }}>(ไฟล์ JPG, PNG ขนาดไม่เกิน 5MB)</div>
                  </div>
                )}
              </Upload>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            {/* หมายเหตุเพิ่มเติม */}
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
              หมายเหตุเพิ่มเติม
            </div>
            <Input.TextArea
              placeholder="เพิ่มหมายเหตุหรือคำแนะนำพิเศษ..."
              rows={2}
              style={{ marginBottom: 8 }}
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 16, background: '#FFF9E5', marginBottom: 24 }}>
            {/* รายการบริการ */}
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
              รายการบริการ
            </div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <img src={mieleWashingMachineImg} alt="ถังซัก" style={{ width: 32, height: 32, borderRadius: 8, marginRight: 8 }} />
                <span>ถังซัก: {selectedWasher ? `${selectedWasher} KG` : <span style={{ color: '#ED553B' }}>ไม่ได้เลือก</span>}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <img src={boschDryerImg} alt="ถังอบ" style={{ width: 32, height: 32, borderRadius: 8, marginRight: 8 }} />
                <span>ถังอบ: {selectedDryer ? `${selectedDryer} KG` : <span style={{ color: '#ED553B' }}>ไม่ได้เลือก</span>}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                {(() => {
                  const selected = detergentsWashing.find((d: any) => (d.ID || d.id) === selectedWashingId);
                  return selected && (selected.Image || selected.image) ? (
                    <img src={selected.Image || selected.image} alt="น้ำยาซักผ้า" style={{ width: 32, height: 32, borderRadius: 8, marginRight: 8 }} />
                  ) : (
                    <span style={{ fontSize: 24, marginRight: 8 }}>🧴</span>
                  );
                })()}
                <span>น้ำยาซักผ้า: {(() => {
                  const selected = detergentsWashing.find((d: any) => (d.ID || d.id) === selectedWashingId);
                  return selected ? selected.Name || selected.name : <span style={{ color: '#ED553B' }}>ไม่ได้เลือก</span>;
                })()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                {(() => {
                  const selected = detergentsSoftener.find((d: any) => (d.ID || d.id) === selectedSoftenerId);
                  return selected && (selected.Image || selected.image) ? (
                    <img src={selected.Image || selected.image} alt="น้ำยาปรับผ้านุ่ม" style={{ width: 32, height: 32, borderRadius: 8, marginRight: 8 }} />
                  ) : (
                    <span style={{ fontSize: 24, marginRight: 8 }}>🧴</span>
                  );
                })()}
                <span>น้ำยาปรับผ้านุ่ม: {(() => {
                  const selected = detergentsSoftener.find((d: any) => (d.ID || d.id) === selectedSoftenerId);
                  return selected ? selected.Name || selected.name : <span style={{ color: '#ED553B' }}>ไม่ได้เลือก</span>;
                })()}</span>
              </div>
            </div>
          <Card style={{ borderRadius: 16, background: '#FFF' }}>
            {/* สรุปยอดรวม */}
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
              สรุปยอดรวม
            </div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>ราคาถังซัก</span>
                <span>{selectedWasher ? pricesWashing[selectedWasher] : '฿ 0'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>ราคาถังอบ</span>
                <span>{selectedDryer ? pricesDryer[selectedDryer] : '฿ 0'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>ค่าส่ง</span>
                <span style={{ color: '#43A047', fontWeight: 600 }}>ฟรี</span>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: 18 }}>
                <span>รวมทั้งหมด</span>
                <span style={{ color: '#20639B' }}>{(() => {
                  const wash = selectedWasher ? parseInt(pricesWashing[selectedWasher].replace(/[^0-9]/g, '')) : 0;
                  const dry = selectedDryer ? parseInt(pricesDryer[selectedDryer].replace(/[^0-9]/g, '')) : 0;
                  return `฿ ${wash + dry}`;
                })()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>         
                <Button type="primary" style={{ background: '#43A047', border: 'none' }} onClick={handleConfirm} disabled={!selectedWasher || !selectedAddress}>
                  ✓ ยืนยันการสั่งซื้อ
                </Button>
              </div>
            </div>
          </Card>
          </Card>
        </Col>
      </Row>
      {/* Modal สำหรับเลือก/เปลี่ยนที่อยู่หลัก */}
      <Modal
        title="เลือกที่อยู่จัดส่ง"
        open={isMapModal}
        onCancel={() => {
          setIsMapModal(false);
          setAddingNewAddress(false);
          setNewAddress("");
          setNewLat(13.7563);
          setNewLng(100.5018);
        }}
        footer={
          !addingNewAddress ? [
            <Button key="ok" type="primary" onClick={() => {
              setIsMapModal(false);
            }} disabled={addresses.length === 0}>
              ยืนยันที่อยู่
            </Button>
          ] : null
        }
        width={480}
      >
        {!addingNewAddress ? (
          <>
            <div style={{ maxHeight: 350, overflowY: 'auto', marginBottom: 16 }}>
              {addresses.map((addr, idx) => {
                const isSelected = selectedAddress === addr.ID;
                const isPrimary = addr.isPrimary || addr.isDefault;
                return (
                  <div
                    key={addr.ID || addr.id || idx} // ปรับ key prop ให้ไม่ซ้ำ
                    onClick={() => setSelectedAddress(addr.ID)}
                    style={{
                      border: isSelected ? '2px solid #4CAF50' : '1px solid #ddd',
                      background: isSelected ? '#eafaf1' : '#fff',
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 12,
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 0 2px #4CAF50' : 'none',
                      position: 'relative',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{addr.Name || 'ที่อยู่'}</div>
                      <div style={{ color: '#888', fontSize: 15 }}>{addr.Phone || ''}</div>
                      {isSelected && (
                        <CheckCircleFilled style={{ color: '#4CAF50', fontSize: 22, marginLeft: 8 }} />
                      )}
                    </div>
                    <div style={{ margin: '8px 0 0 0', color: '#222', fontSize: 15, whiteSpace: 'pre-line' }}>{addr.AddressDetails}</div>
                    {isPrimary && (
                      <div style={{ color: '#43a047', fontWeight: 500, marginTop: 6 }}>ที่อยู่หลัก</div>
                    )}
                    {/* ปุ่มแก้ไข/ลบ/ตั้งเป็นที่อยู่หลัก */}
                    <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: 8 }}>
                        <input
                          type="checkbox"
                          checked={isPrimary}
                          onChange={async e => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setPrimaryAddressId(addr.ID);
                              setSelectedAddress(addr.ID);
                              try {
                                await setMainAddress(currentUser?.ID || 1, addr.ID);
                                const arrRaw = await fetchAddresses(currentUser?.ID || 1);
                                const arr = normalizeAddresses(arrRaw);
                                setAddresses(arr);
                                const primary = arr.find((a: any) => a.isPrimary || a.isDefault);
                                if (primary) {
                                  setPrimaryAddressId(primary.ID);
                                  setSelectedAddress(primary.ID);
                                } else if (arr.length > 0) {
                                  setPrimaryAddressId(arr[0].ID);
                                  setSelectedAddress(arr[0].ID);
                                }
                              } catch (err) {
                                AntdModal.error({ title: "ตั้งที่อยู่หลักไม่สำเร็จ" });
                              }
                            }
                          }}
                          style={{ marginRight: 4 }}
                        />
                        ตั้งเป็นที่อยู่หลัก
                      </label>
                    </div>
                  </div>
                );
              })}
              <div
                style={{
                  border: '1.5px dashed #43a047',
                  borderRadius: 8,
                  padding: 18,
                  textAlign: 'center',
                  color: '#43a047',
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: '#fafcf8',
                }}
                onClick={() => setAddingNewAddress(true)}
              >
                <span style={{ fontSize: 22, marginRight: 6 }}>+</span> เพิ่มที่อยู่ใหม่
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: 8 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>รายละเอียดที่อยู่</div>
            <Input.TextArea
              rows={2}
              placeholder="กรอกที่อยู่ใหม่"
              style={{ marginBottom: 12 }}
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
            />
            <div style={{ fontWeight: 500, marginBottom: 8 }}>ปักหมุดตำแหน่ง (Leaflet)</div>
            <div style={{ width: '100%', height: 250, marginBottom: 12 }}>
              <MapContainer
                center={currentPosition ? currentPosition : [13.7563, 100.5018]}
                zoom={13}
                style={{ height: 250, width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker setLat={setNewLat} setLng={setNewLng} setAddress={setNewAddress} />
                {currentPosition && (
                  <Marker position={currentPosition} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }) as L.Icon} />
                )}
              </MapContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => {
                setAddingNewAddress(false);
                setNewAddress("");
                setNewLat(13.7563);
                setNewLng(100.5018);
                setNewIsPrimary(false);
              }}>ยกเลิก</Button>
              <Button type="primary" onClick={async () => {
                if (!newAddress.trim()) return;
                try {
                  await createNewAddress({
                    addressDetails: newAddress,
                    latitude: newLat,
                    longitude: newLng,
                    customerId: currentUser?.ID || userId,
                  });
                  const arrRaw = await fetchAddresses(currentUser?.ID || userId);
                  let arr = normalizeAddresses(arrRaw);
                  // ถ้าไม่มี address หลัก ให้ตั้ง address ตัวแรกเป็นหลัก
                  if (!arr.some(a => a.isPrimary || a.isDefault) && arr.length > 0) {
                    arr = arr.map((a, idx) => idx === 0 ? { ...a, isPrimary: true, isDefault: true } : a);
                  }
                  setAddresses(arr);
                  setAddingNewAddress(false);
                  setNewAddress("");
                  setNewLat(13.7563);
                  setNewLng(100.5018);
                  setNewIsPrimary(false);
                  AntdModal.success({ title: "บันทึกที่อยู่สำเร็จ" });
                } catch (err) {
                  AntdModal.error({ title: "บันทึกที่อยู่ไม่สำเร็จ" });
                }
              }}>
                บันทึก
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </CustomerSidebar>
  );
};

// Helper: Normalize addresses ให้มี address หลักแค่ตัวเดียว
function normalizeAddresses(arrRaw: any[]): any[] {
  console.log('addresses raw:', arrRaw);
  let found = false;
  let hasPrimary = arrRaw.some(a => !!a.isPrimary || !!a.isDefault || !!a.IsPrimary || !!a.IsDefault);
  const arr = arrRaw.map((a, idx) => {
    let isPrimary = !!a.isPrimary || !!a.isDefault || !!a.IsPrimary || !!a.IsDefault;
    if (!hasPrimary && idx === 0) isPrimary = true; // ถ้าไม่มี address หลัก ให้ตัวแรกเป็นหลัก
    if (isPrimary && !found) {
      found = true;
      return { ...a, isPrimary: true, isDefault: true, ID: a.ID || a.id, AddressDetails: a.AddressDetails || a.detail };
    }
    return { ...a, isPrimary: false, isDefault: false, ID: a.ID || a.id, AddressDetails: a.AddressDetails || a.detail };
  });
  console.log('addresses normalized:', arr);
  return arr;
}

// เพิ่ม helper component สำหรับปักหมุดและ reverse geocode
function LocationMarker({ setLat, setLng, setAddress }: { setLat: (lat: number) => void, setLng: (lng: number) => void, setAddress: (addr: string) => void }) {
  useMapEvents({
    click(e: any) {
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
      // reverse geocode ด้วย Nominatim
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => {
          if (data.display_name) setAddress(data.display_name);
        });
    },
  });
  return null;
}

export default OrderPage;