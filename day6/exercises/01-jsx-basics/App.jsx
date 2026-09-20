/**
 * Bài 1: JSX Basics
 * Day 6 - React cơ bản
 */

function ProfileCard({ name, title, bio, avatarUrl }) {
  const shortBio = bio && bio.length > 100 ? `${bio.slice(0, 100)}...` : bio;

  return (
    <div className="profile-card" style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <img
        src={avatarUrl || "https://via.placeholder.com/100"}
        alt={name}
        width="100"
        height="100"
        style={{ borderRadius: "50%", objectFit: "cover" }}
      />
      <h2>{name}</h2>
      <p className="title">{title}</p>
      <p className="bio">{shortBio}</p>
    </div>
  );
}

function ScoreBoard({ studentName, score }) {
  const isPass = score >= 50;

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <p>{studentName} — {score} điểm</p>
      <p style={{ color: isPass ? "green" : "red" }}>
        Kết quả: {isPass ? "Pass" : "Fail"}
      </p>
      {score >= 90 && <span className="badge">Excellent!</span>}
      <p>Ngày: {new Date().toLocaleDateString("vi-VN")}</p>
    </div>
  );
}

function UserStatus({ name, isOnline, lastSeen }) {
  return (
    <>
      <h3>{name}</h3>
      {isOnline ? (
        <p>🟢 Online</p>
      ) : (
        <p>⚫ Offline — Last seen: {lastSeen || "Unknown"}</p>
      )}
    </>
  );
}

function App() {
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Day 6 — Exercise 01: JSX Basics</h1>

      <h2>1.1 — ProfileCard</h2>
      <ProfileCard
        name="Nguyen Van A"
        title="Frontend Developer"
        bio="Passionate about React and building great user experiences. Love learning new technologies and sharing knowledge with the community."
        avatarUrl="https://via.placeholder.com/100"
      />
      <ProfileCard
        name="Tran Thi B"
        title="Backend Developer"
        bio="Short bio"
      />

      <h2>1.2 — ScoreBoard</h2>
      <ScoreBoard studentName="Nguyen Van A" score={95} />
      <ScoreBoard studentName="Tran Thi B" score={42} />
      <ScoreBoard studentName="Le Van C" score={50} />

      <h2>1.3 — UserStatus</h2>
      <UserStatus name="Alice" isOnline={true} />
      <UserStatus name="Bob" isOnline={false} lastSeen="10 phút trước" />
      <UserStatus name="Charlie" isOnline={false} />
    </div>
  );
}

export default App;

// Q1: JSX dùng className vì class là từ khóa của JavaScript và React ánh xạ className sang thuộc tính class của DOM.
// Q2: condition = 0 thì biểu thức 0 && <Component /> trả về 0, nên React có thể render số 0 ra UI.
// Q3: Dùng Fragment khi cần trả về nhiều phần tử cùng cấp nhưng không muốn tạo thêm DOM node thừa, ví dụ một <h3> và một <p> trong bảng hoặc layout.
