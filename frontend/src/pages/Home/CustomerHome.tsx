import React, { useRef, useEffect, useState } from "react";
import { Row, Col, Typography, Button, Card } from "antd";
import CustomerSidebar from "../../component/layout/customer/CusSidebar";
import washingImg from "../../assets/washing.jpg";
import dashboard from "../../assets/dashboard.png";
import { FaTruckPickup, FaSoap, FaTshirt, FaStar, FaHeart, FaShieldAlt } from "react-icons/fa";
import "./CustomerHome.css";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const CustomerHome: React.FC = () => {
  const navigate = useNavigate();
  const serviceRef = useRef<HTMLDivElement>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  useEffect(() => {
    setHeroLoaded(true);
    
    // Animate service cards on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleCards(prev => [...prev, index]);
            }, index * 200);
          }
        });
      },
      { threshold: 0.1 }
    );

    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const handleScrollToService = () => {
    if (serviceRef.current) {
      serviceRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const heroStyles = {
    transform: heroLoaded ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
    opacity: heroLoaded ? 1 : 0,
    transition: 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  };

  return (
    <CustomerSidebar>
      {/* Hero Section */}
      <div
        className="customer-hero"
        style={{
          position: "relative",
          height: "85vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Animated Background Gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            opacity: 0.1,
            animation: "gradientShift 8s ease-in-out infinite",
          }}
        />
        
        {/* Floating Elements */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(45deg, #F6D55C, #ED553B)",
            opacity: 0.6,
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "15%",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "linear-gradient(45deg, #3CAEA3, #0E4587)",
            opacity: 0.5,
            animation: "float 4s ease-in-out infinite reverse",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            left: "20%",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "linear-gradient(45deg, #ED553B, #3CAEA3)",
            opacity: 0.4,
            animation: "float 5s ease-in-out infinite",
          }}
        />

        <img
          src={dashboard}
          alt="Laundry Hero"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.15,
            filter: "blur(1px)",
          }}
        />

        <div
          style={{
            position: "relative",
            textAlign: "center",
            padding: "0 20px",
            maxWidth: "900px",
            ...heroStyles,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
              padding: "8px 20px",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "50px",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <FaStar color="#F6D55C" size={20} />
            <span style={{ color: "#0E4587", fontWeight: 600 }}>
              บริการซักผ้าอันดับ 1
            </span>
            <FaStar color="#F6D55C" size={20} />
          </div>

          <h1
            style={{
              fontFamily: "Fredoka, Baloo 2, Montserrat, Poppins, Arial",
              fontWeight: 800,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: "#0E4587",
              textShadow: "0 4px 20px rgba(0,0,0,0.2)",
              marginBottom: 20,
              background: "linear-gradient(135deg, #0E4587, #3CAEA3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ยินดีต้อนรับสู่{" "}
            <span 
              style={{ 
                background: "linear-gradient(135deg, #ED553B, #F6D55C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              NEATII
            </span>
          </h1>

          <p
            style={{
              fontFamily: "Baloo 2, Poppins, Montserrat",
              fontWeight: 500,
              fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
              color: "#444",
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            บริการซักอบและรับ-ส่งผ้าถึงบ้าน <br />
            <span style={{ 
              color: "#F6D55C", 
              fontWeight: 700,
              textShadow: "0 2px 8px rgba(246, 213, 92, 0.3)"
            }}>
              สะดวก
            </span>{" "}
            <span style={{ 
              color: "#ED553B", 
              fontWeight: 700,
              textShadow: "0 2px 8px rgba(237, 85, 59, 0.3)"
            }}>
              รวดเร็ว
            </span>{" "}
            <span style={{ 
              color: "#3CAEA3", 
              fontWeight: 700,
              textShadow: "0 2px 8px rgba(60, 174, 163, 0.3)"
            }}>
              ปลอดภัย
            </span>
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              type="primary"
              size="large"
              style={{
                fontWeight: 700,
                fontSize: "1.2rem",
                padding: "16px 48px",
                height: "auto",
                borderRadius: 50,
                background: "linear-gradient(135deg, #0E4587 0%, #3CAEA3 100%)",
                color: "#fff",
                border: "none",
                boxShadow: "0 8px 25px rgba(14,69,135,0.4)",
                transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.transform = "translateY(-3px) scale(1.05)";
                btn.style.boxShadow = "0 12px 35px rgba(14,69,135,0.5)";
              }}
              onMouseLeave={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.transform = "translateY(0) scale(1)";
                btn.style.boxShadow = "0 8px 25px rgba(14,69,135,0.4)";
              }}
              onClick={() => navigate("/customer/orders")}
            >
              🚀 สั่งซักผ้าเลย
            </Button>

            <Button
              size="large"
              style={{
                fontWeight: 600,
                fontSize: "1.1rem",
                padding: "14px 36px",
                height: "auto",
                borderRadius: 50,
                background: "rgba(255, 255, 255, 0.9)",
                color: "#0E4587",
                border: "2px solid rgba(14, 69, 135, 0.2)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.background = "#fff";
                btn.style.transform = "translateY(-2px)";
                btn.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.background = "rgba(255, 255, 255, 0.9)";
                btn.style.transform = "translateY(0)";
                btn.style.boxShadow = "none";
              }}
              onClick={handleScrollToService}
            >
              📋 ดูรายละเอียด
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ 
        padding: "40px 20px", 
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        borderTop: "1px solid rgba(0,0,0,0.05)"
      }}>
        <Row gutter={[32, 32]} justify="center">
          {[
            { icon: "👥", number: "10,000+", text: "ลูกค้าที่ไว้วางใจ" },
            { icon: "🏆", number: "99%", text: "ความพึงพอใจ" },
            { icon: "⚡", number: "24h", text: "บริการรวดเร็ว" },
            { icon: "🌟", number: "5⭐", text: "คะแนนรีวิว" },
          ].map((stat, i) => (
            <Col key={i} xs={12} md={6} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "8px",
                  animation: `bounce 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                {stat.icon}
              </div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "#0E4587",
                  marginBottom: "4px",
                  fontFamily: "Fredoka, Arial",
                }}
              >
                {stat.number}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#666",
                  fontWeight: 500,
                }}
              >
                {stat.text}
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Content Section */}
      <div className="customer-content-section" style={{ 
        padding: "80px 20px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
      }}>
        <Row gutter={[60, 60]} justify="center" align="middle">
          <Col xs={24} md={12}>
            <Card
              className="customer-content-card"
              style={{
                borderRadius: 24,
                boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
                padding: 40,
                background: "linear-gradient(135deg, #fff 0%, #f8f9ff 100%)",
                border: "1px solid rgba(14, 69, 135, 0.1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative Element */}
              <div
                style={{
                  position: "absolute",
                  top: "-50px",
                  right: "-50px",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3CAEA3, #F6D55C)",
                  opacity: 0.1,
                }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <FaHeart color="#ED553B" size={28} />
                <Title
                  level={3}
                  style={{
                    margin: 0,
                    fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                    background: "linear-gradient(135deg, #20639B, #3CAEA3)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontFamily: "Fredoka, Montserrat, Arial",
                    fontWeight: 800,
                  }}
                >
                  Laundry Service
                </Title>
              </div>

              <Paragraph
                style={{
                  marginBottom: 32,
                  fontSize: "1.1rem",
                  lineHeight: 1.8,
                  color: "#555",
                  fontFamily: "Poppins, Arial",
                  fontWeight: 400,
                }}
              >
                <strong style={{ color: "#0E4587" }}>NEATII</strong> ให้บริการซักอบครบวงจร 
                ตั้งแต่รับผ้าถึงบ้านคุณ ไปจนถึงการส่งคืนที่สะดวกสบาย
                ด้วยทีมงานมืออาชีพและเทคโนโลยีที่ทันสมัย ดูแลเสื้อผ้าของคุณให้สะอาด 
                สดใส พร้อมใช้งานเสมอ
              </Paragraph>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                <FaShieldAlt color="#3CAEA3" size={20} />
                <span style={{ color: "#3CAEA3", fontWeight: 600 }}>
                  รับประกันความสะอาด 100%
                </span>
              </div>

              <Button
                size="large"
                style={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  padding: "12px 32px",
                  height: "auto",
                  borderRadius: 25,
                  background: "linear-gradient(135deg, #20639B, #3CAEA3)",
                  color: "#fff",
                  border: "none",
                  boxShadow: "0 6px 20px rgba(32, 99, 155, 0.3)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  const btn = e.target as HTMLButtonElement;
                  btn.style.transform = "translateY(-2px)";
                  btn.style.boxShadow = "0 8px 25px rgba(32, 99, 155, 0.4)";
                }}
                onMouseLeave={(e) => {
                  const btn = e.target as HTMLButtonElement;
                  btn.style.transform = "translateY(0)";
                  btn.style.boxShadow = "0 6px 20px rgba(32, 99, 155, 0.3)";
                }}
                onClick={handleScrollToService}
              >
                🔍 ดูรายละเอียดบริการ
              </Button>
            </Card>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* Decorative rings */}
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  left: "-20px",
                  width: "calc(100% + 40px)",
                  height: "calc(100% + 40px)",
                  border: "3px solid #3CAEA3",
                  borderRadius: 30,
                  opacity: 0.3,
                  animation: "pulse 3s ease-in-out infinite",
                }}
              />
              <img
                src={washingImg}
                alt="Service Example"
                style={{
                  borderRadius: 24,
                  width: "100%",
                  maxWidth: 500,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLImageElement).style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLImageElement).style.transform = "scale(1)";
                }}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Service Section */}
      <div
        ref={serviceRef}
        style={{ 
          padding: "80px 20px", 
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(14, 69, 135, 0.03) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(60, 174, 163, 0.03) 0%, transparent 50%),
                            radial-gradient(circle at 40% 80%, rgba(246, 213, 92, 0.03) 0%, transparent 50%)`,
          }}
        />

        <div style={{ textAlign: "center", marginBottom: 60, position: "relative" }}>
          <div
            style={{
              display: "inline-block",
              padding: "8px 24px",
              background: "rgba(14, 69, 135, 0.1)",
              borderRadius: 50,
              marginBottom: 16,
            }}
          >
            <span style={{ color: "#0E4587", fontWeight: 600, fontSize: "0.9rem" }}>
              ✨ บริการครบครัน ✨
            </span>
          </div>
          
          <h2
            style={{
              background: "linear-gradient(135deg, #0E4587, #3CAEA3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily: "Fredoka, Baloo 2, Montserrat, Arial",
              fontWeight: 800,
              fontSize: "clamp(2rem, 5vw, 3rem)",
              letterSpacing: "1px",
              marginBottom: 16,
            }}
          >
            บริการของเรา
          </h2>
          <p
            style={{
              color: "#666",
              fontFamily: "Poppins, Arial",
              fontWeight: 500,
              fontSize: "1.2rem",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            ครบจบในที่เดียว สะดวก รวดเร็ว ทันสมัย
          </p>
        </div>

        <Row gutter={[40, 40]} justify="center">
          {[
            {
              icon: <FaTruckPickup size={48} color="#fff" />,
              title: "รับ-ส่งผ้าถึงบ้าน",
              desc: "บริการรับ-ส่งผ้าถึงหน้าบ้านคุณ ฟรี! ในพื้นที่ให้บริการ ประหยัดเวลาและค่าเดินทาง",
              bg: "linear-gradient(135deg, #F6D55C, #ED553B)",
              emoji: "🚚",
            },
            {
              icon: <FaSoap size={48} color="#fff" />,
              title: "ซักผ้าสะอาดล้ำลึก",
              desc: "ซักด้วยเครื่องอัตโนมัติและน้ำยาคุณภาพสูง ปลอดภัยต่อผิว กำจัดคราบได้ดีเยี่ยม",
              bg: "linear-gradient(135deg, #ED553B, #0E4587)",
              emoji: "🧼",
            },
            {
              icon: <FaTshirt size={48} color="#fff" />,
              title: "อบผ้าหอมแห้งไว",
              desc: "อบผ้าด้วยระบบถนอมใยผ้า หอม สะอาด พร้อมใช้งาน รักษาคุณภาพผ้าให้คงทน",
              bg: "linear-gradient(135deg, #3CAEA3, #20639B)",
              emoji: "👕",
            },
          ].map((service, i) => (
            <Col key={i} xs={24} md={8}>
              <Card
                hoverable
                className="service-card"
                style={{
                  borderRadius: 20,
                  boxShadow: visibleCards.includes(i) 
                    ? "0 15px 35px rgba(0,0,0,0.15)" 
                    : "0 8px 20px rgba(0,0,0,0.08)",
                  textAlign: "center",
                  padding: "40px 24px",
                  minHeight: 320,
                  border: "none",
                  background: "#fff",
                  position: "relative",
                  overflow: "hidden",
                  transform: visibleCards.includes(i) 
                    ? "translateY(0) scale(1)" 
                    : "translateY(20px) scale(0.95)",
                  opacity: visibleCards.includes(i) ? 1 : 0,
                  transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
                onMouseEnter={(e) => {
                  const card = e.currentTarget as HTMLElement;
                  card.style.transform = "translateY(-8px) scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget as HTMLElement;
                  card.style.transform = "translateY(0) scale(1)";
                }}
              >
                {/* Background decoration */}
                <div
                  style={{
                    position: "absolute",
                    top: "-30px",
                    right: "-30px",
                    width: "80px",
                    height: "80px",
                    background: service.bg,
                    borderRadius: "50%",
                    opacity: 0.1,
                  }}
                />

                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: service.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px auto",
                    boxShadow: `0 8px 25px rgba(0,0,0,0.2)`,
                    transition: "all 0.3s ease",
                    position: "relative",
                  }}
                >
                  {service.icon}
                  <div
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      fontSize: "1.5rem",
                      background: "#fff",
                      borderRadius: "50%",
                      padding: "4px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {service.emoji}
                  </div>
                </div>

                <h3
                  style={{
                    background: service.bg,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontFamily: "Fredoka, Baloo 2, Montserrat",
                    fontWeight: 700,
                    fontSize: "1.4rem",
                    marginBottom: 16,
                  }}
                >
                  {service.title}
                </h3>

                <p
                  style={{
                    color: "#666",
                    fontFamily: "Poppins, Arial",
                    textAlign: "center",
                    maxWidth: 280,
                    lineHeight: 1.7,
                    margin: "0 auto",
                    fontSize: "1rem",
                  }}
                >
                  {service.desc}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div
        style={{
          padding: "60px 20px",
          background: "linear-gradient(135deg, #0E4587 0%, #3CAEA3 100%)",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h3
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: 16,
            fontFamily: "Fredoka, Arial",
          }}
        >
          พร้อมเริ่มต้นแล้วใช่ไหม? 🎉
        </h3>
        <p style={{ fontSize: "1.1rem", marginBottom: 32, opacity: 0.9 }}>
          สั่งบริการซักผ้าของคุณได้เลยตอนนี้
        </p>
        <Button
          type="primary"
          size="large"
          style={{
            fontWeight: 700,
            fontSize: "1.2rem",
            padding: "16px 48px",
            height: "auto",
            borderRadius: 50,
            background: "#fff",
            color: "#0E4587",
            border: "none",
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            const btn = e.target as HTMLButtonElement;
            btn.style.transform = "translateY(-3px) scale(1.05)";
          }}
          onMouseLeave={(e) => {
            const btn = e.target as HTMLButtonElement;
            btn.style.transform = "translateY(0) scale(1)";
          }}
          onClick={() => navigate("/customer/orders")}
        >
          🚀 เริ่มสั่งเลย
        </Button>
      </div>

      <style>{`
        @keyframes gradientShift {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.05); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </CustomerSidebar>
  );
};

export default CustomerHome;