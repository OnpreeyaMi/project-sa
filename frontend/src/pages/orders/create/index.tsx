import React, { useState, useEffect } from 'react';
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
import { UploadOutlined } from "@ant-design/icons";
import CustomerSidebar from "../../../component/layout/customer/CusSidebar";
import { BiSolidWasher, BiSolidDryer } from "react-icons/bi";
import { FaJugDetergent } from "react-icons/fa6";
import { TbWashDrycleanOff } from "react-icons/tb";
import { createOrder, fetchDetergentsByType } from '../../../services/orderService';
import { fetchAddresses, fetchCustomerNameById,  createAddress, setMainAddress } from '../../../services/orderService';
import { CheckCircleFilled } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
  const [newLat, setNewLat] = useState(13.7563);
  const [newLng, setNewLng] = useState(100.5018);
  const [isMapModal, setIsMapModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  // เพิ่ม state สำหรับ address หลัก
  const [primaryAddressId, setPrimaryAddressId] = useState<number | null>(null);
  const [detergentsWashing, setDetergentsWashing] = useState<any[]>([]);
  const [detergentsSoftener, setDetergentsSoftener] = useState<any[]>([]);
  const [selectedWashingId, setSelectedWashingId] = useState<number | null>(null);
  const [selectedSoftenerId, setSelectedSoftenerId] = useState<number | null>(null);
  const [newIsPrimary, setNewIsPrimary] = useState(false); // state สำหรับ checkbox ตั้งเป็นที่อยู่หลัก

  // Mapping KG → ServiceType ID
  const washerIdMap: Record<number, number> = { 10: 1, 14: 2, 18: 3, 28: 4 };
  const dryerIdMap: Record<number, number> = { 14: 5, 25: 6, 0: 7 }; // 0 = NO Dryer

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

    // serviceTypeIds: รวม id ของ washer และ dryer (mapping จากที่เลือก)
    const serviceTypeIds: number[] = [];
    if (selectedWasher) serviceTypeIds.push(washerIdMap[selectedWasher]);
    if (selectedDryer !== null) serviceTypeIds.push(dryerIdMap[selectedDryer] ?? 7);

    const detergentIds: number[] = [];
    if (selectedWashingId) detergentIds.push(selectedWashingId);
    if (selectedSoftenerId) detergentIds.push(selectedSoftenerId);

    const orderData = {
      customer_id: currentUser?.ID || 1,
      service_type_ids: serviceTypeIds, // ส่งเป็น array ของ id จริง
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

  const handleSaveNewAddress = async () => {
    if (!newAddress.trim()) return;
    try {
      await createAddress({
        addressDetails: newAddress,
        latitude: newLat,
        longitude: newLng,
        customerId: currentUser?.ID || 1,
      });
      // ดึง address ใหม่จาก backend
      const arr = await fetchAddresses(currentUser?.ID || 1);
      setAddresses(arr);
      setAddingNewAddress(false);
      setNewAddress("");
      setNewLat(13.7563);
      setNewLng(100.5018);
    } catch (err) {
      AntdModal.error({ title: "บันทึกที่อยู่ไม่สำเร็จ" });
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const arr = await fetchAddresses(currentUser?.ID || 1);
      const customerId = currentUser?.ID || 1;
      const filtered = arr.filter((a: any) => a.CustomerID === customerId);
      setAddresses(filtered);
      // หา address หลัก (isPrimary === true)
      const primary = filtered.find((a: any) => a.isPrimary);
      if (primary) {
        setPrimaryAddressId(primary.ID);
        setSelectedAddress(primary.ID);
      } else if (filtered.length > 0) {
        setPrimaryAddressId(filtered[0].ID);
        setSelectedAddress(filtered[0].ID);
      }
    };
    fetch();
    // eslint-disable-next-line
  }, [currentUser]);

  useEffect(() => {
    // สมมุติใช้ customer id 1 (หรือดึงจาก auth จริง)
    const fetchUser = async () => {
      try {
        const res = await fetchCustomerNameById(1);
        // ถ้า response เป็น { firstName, lastName, ... }
        if (res && (res.firstName || res.lastName)) {
          setCurrentUser(res);
        } else if (res && res.data && (res.data.firstName || res.data.lastName)) {
          setCurrentUser(res.data);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

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
                  <div style={{ height: 75, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <TbWashDrycleanOff size={60} style={{ color: selectedDryer === null ? "#ED553B" : "#6DA3D3" }} />
                  </div>
                  <Text style={{ fontSize: 16, color: selectedDryer === null ? "#ED553B" : undefined }}>NO</Text>
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

            {/* น้ำยาซักผ้า/ปรับผ้านุ่ม */}
            <Title level={4}>เลือกน้ำยาซักผ้า/ปรับผ้านุ่มที่ต้องการ</Title>
            <Row gutter={[16, 16]} justify="center">
              <Col xs={12} sm={12} md={8} lg={8}>
                <Card style={{ borderRadius: 8, padding: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: 600 }}>น้ำยาซักผ้า</Text>
                  <Slider dots infinite speed={500} slidesToShow={1} slidesToScroll={1}>
                    {detergentsWashing.map((brand: any) => (
                      <div key={brand.ID || brand.id}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <FaJugDetergent size={75} style={{ color: "#3CAEA3" }} />
                          <Text style={{ fontSize: 18, marginTop: 8 }}>{brand.Name || brand.name}</Text>
                          <Button
                            type={selectedWashingId === (brand.ID || brand.id) ? "primary" : "default"}
                            style={{ marginTop: 10, background: (brand.InStock === 0 || brand.inStock === 0) ? '#ED553B' : undefined, color: (brand.InStock === 0 || brand.inStock === 0) ? '#fff' : undefined }}
                            onClick={() => setSelectedWashingId(brand.ID || brand.id)}
                            disabled={brand.InStock === 0 || brand.inStock === 0}
                          >{(brand.InStock === 0 || brand.inStock === 0) ? "หมดแล้ว" : "เลือกน้ำยานี้"}</Button>
                          <div style={{ marginTop: 8, background: '#f6f6f6', borderRadius: 6, padding: 8 }}>
                            <b>คงเหลือ:</b> {brand.InStock || brand.inStock}
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
                          <FaJugDetergent size={75} style={{ color: "#ED553B" }} />
                          <Text style={{ fontSize: 18, marginTop: 8 }}>{brand.Name || brand.name}</Text>
                          <Button
                            type={selectedSoftenerId === (brand.ID || brand.id) ? "primary" : "default"}
                            style={{ marginTop: 10 }}
                            onClick={() => setSelectedSoftenerId(brand.ID || brand.id)}
                          >เลือกน้ำยานี้</Button>
                          <div style={{ marginTop: 8, background: '#f6f6f6', borderRadius: 6, padding: 8 }}>
                            <b>คงเหลือ:</b> {brand.InStock || brand.inStock}
                          </div>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </Card>
              </Col>
            </Row>
        </Col>

        {/* ขวา: ฟอร์มสร้างออเดอร์ */}
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 10 }}>
            <Title level={4} style={{ textAlign: "center" }}>สร้างออเดอร์</Title>
            <Divider />

            {/* ชื่อผู้รับ */}
            <Title level={5}>
              คุณ {customerName}
            </Title>
            {/*<Text style={{ display: "block", marginBottom: 15 }}>สมใจ</Text>*/}

            {/* ที่อยู่ */}
            <Title level={5}>ที่อยู่</Title>
            <div style={{ marginBottom: 15 }}>
              {(() => {
                const addr = addresses.find(a => a.ID === selectedAddress);
                return addr ? (
                  <span>{addr.AddressDetails}</span>
                ) : (
                  <span style={{ color: '#aaa' }}>กรุณาเลือกที่อยู่จัดส่ง</span>
                );
              })()}
              <Button style={{ marginLeft: 16 }} onClick={() => setIsMapModal(true)}>
                เปลี่ยนที่อยู่
              </Button>
            </div>
            {/* Modal สำหรับเลือก/เปลี่ยนที่อยู่หลัก */}
            <AntdModal
              title="เลือกที่อยู่จัดส่ง"
              open={isMapModal}
              onCancel={() => {
                setIsMapModal(false);
                setAddingNewAddress(false);
                setNewAddress("");
                setNewLat(13.7563);
                setNewLng(100.5018);
              }}
              footer={[
                !addingNewAddress && (
                  <Button key="ok" type="primary" onClick={() => {
                    setIsMapModal(false);
                    // setSelectedAddress(selectedAddress) // ไม่ต้อง set ซ้ำ เพราะเลือกแล้ว
                  }} disabled={!selectedAddress}>
                    ยืนยันที่อยู่
                  </Button>
                )
              ]}
              width={480}
            >
              {!addingNewAddress ? (
                <>
                  <div style={{ maxHeight: 350, overflowY: 'auto', marginBottom: 16 }}>
                    {addresses.map(addr => {
                      const isSelected = selectedAddress === addr.ID;
                      return (
                        <div
                          key={addr.ID}
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
                          {addr.ID === primaryAddressId && (
                            <div style={{ color: '#43a047', fontWeight: 500, marginTop: 6 }}>ที่อยู่หลัก</div>
                          )}
                          {/* ปุ่มแก้ไข/ลบ/ตั้งเป็นที่อยู่หลัก */}
                          <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: 8 }}>
                              <input
                                type="checkbox"
                                checked={addr.ID === primaryAddressId}
                                onChange={async e => {
                                  e.stopPropagation();
                                  if (e.target.checked) {
                                    setPrimaryAddressId(addr.ID);
                                    try {
                                      await setMainAddress(currentUser?.ID || 1, addr.ID);
                                      // อัปเดต addresses ใหม่หลังตั้งที่อยู่หลัก
                                      const arr = await fetchAddresses(currentUser?.ID || 1);
                                      setAddresses(arr);
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
                  {/* Checkbox ตั้งเป็นที่อยู่หลัก */}
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <input
                      type="checkbox"
                      checked={newAddress === '' ? false : !!newIsPrimary}
                      onChange={e => setNewIsPrimary(e.target.checked)}
                      style={{ marginRight: 6 }}
                    />
                    ตั้งเป็นที่อยู่หลัก
                  </label>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>ปักหมุดตำแหน่ง (Leaflet)</div>
                  <div style={{ width: '100%', height: 250, marginBottom: 12 }}>
                    <MapContainer center={[newLat, newLng]} zoom={15} style={{ width: '100%', height: '100%' }}>
                      <TileLayer
                        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker setLat={setNewLat} setLng={setNewLng} setAddress={setNewAddress} />
                      <Marker position={[newLat, newLng]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }) as L.Icon} />
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
                    <Button type="primary" onClick={handleSaveNewAddress}>
                      บันทึก
                    </Button>
                  </div>
                </div>
              )}
            </AntdModal>

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
        width={480}
      >
        <div style={{ textAlign: "left" }}>
          <div style={{ marginBottom: 14 }}><b>คุณ:</b> {customerName}</div>
          <div style={{ marginBottom: 14 }}><b>ที่อยู่:</b> {selectedAddress ? addresses.find((address) => address.ID === selectedAddress)?.AddressDetails : "ไม่ได้เลือก"}</div>
          <div style={{ marginBottom: 14 }}><b>ถังซัก:</b> {selectedWasher ? `${selectedWasher} KG` : "ไม่ได้เลือก"}</div>
          <div style={{ marginBottom: 14 }}><b>ถังอบ:</b> {selectedDryer ? `${selectedDryer} KG` : "NO"}</div>
          <div style={{ marginBottom: 14 }}>
            <b>น้ำยาซักผ้า:</b> {
              (() => {
                const selected = detergentsWashing.find((d: any) => (d.ID || d.id) === selectedWashingId);
                return selected ? `${selected.Name || selected.name} (คงเหลือ: ${selected.InStock || selected.inStock})` : "ไม่ได้เลือก";
              })()
            }
          </div>
          <div style={{ marginBottom: 14 }}>
            <b>น้ำยาปรับผ้านุ่ม:</b> {
              (() => {
                const selected = detergentsSoftener.find((d: any) => (d.ID || d.id) === selectedSoftenerId);
                return selected ? `${selected.Name || selected.name} (คงเหลือ: ${selected.InStock || selected.inStock})` : "ไม่ได้เลือก";
              })()
            }
          </div>
          <div style={{ marginBottom: 0 }}><b>หมายเหตุ:</b> {orderNote || "ไม่มีหมายเหตุ"}</div>
        </div>
      </Modal>
    </CustomerSidebar>
  );
};

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
