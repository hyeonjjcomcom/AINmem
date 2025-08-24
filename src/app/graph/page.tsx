// app/page.tsx
import Sidebar from "../components/Sidebar";

export default function HomePage() {
  return (
    <>
      <Sidebar />
      <main className="main-content">
        {/* 기존 EJS 파일의 main-content 내부 내용을 여기에 넣습니다. */}
        <div className="graph-wrapper">
          {/* ... 그래프 관련 JSX 코드 ... */}
          graph page
        </div>
      </main>
    </>
  );
}