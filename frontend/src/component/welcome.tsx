type WelcomeProps = {
  name: string;
};

function Welcome({ name }: WelcomeProps) {
  return (
    <div style={{padding: "20px", borderRadius: "10px" }}>
      <h2>สวัสดี {name}!</h2>
      <p>นี่คือคอมโพเนนต์ที่ใช้ TypeScript</p>
    </div>
  );
}

export default Welcome;