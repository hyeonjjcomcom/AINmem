"use client";

import { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import AuthOverlay from "@/components/AuthOverlay";
import { useAuth } from "@/contexts/AuthContext";

// Memory 타입 정의
interface Memory {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  date: string;
  createdAt: Date;
}

export default function AnalyticsPage() {
  const { userName, isHydrated, isLoggedIn } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [web3Count, setWeb3Count] = useState<number>(0);

  // Web3에서 memory IDs를 가져와서 MongoDB에서 실제 데이터 조회
  const fetchMemories = async () => {
    if (!userName) {
      setError('로그인이 필요합니다');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📊 Fetching memories for user:', userName);

      // 1단계: Web3에서 memory_ids 가져오기
      const web3Response = await fetch(
        `/api/web3/save-memory-id?user_address=${userName}`
      );
      const web3Data = await web3Response.json();

      if (!web3Data.success) {
        throw new Error(`Web3 fetch failed: ${web3Data.error}`);
      }

      const memoryIds = web3Data.memory_ids || [];
      setWeb3Count(memoryIds.length);

      console.log(`✅ Found ${memoryIds.length} memory IDs on Web3`);

      if (memoryIds.length === 0) {
        setMemories([]);
        return;
      }

      // 2단계: MongoDB에서 해당 IDs의 실제 메모리 데이터 가져오기
      const memoriesResponse = await fetch(
        `/api/memories?userName=${userName}&ids=${memoryIds.join(',')}`
      );

      if (!memoriesResponse.ok) {
        throw new Error('Failed to fetch memories from database');
      }

      const memoriesData = await memoriesResponse.json();

      console.log(`✅ Fetched ${memoriesData.length} memories from MongoDB`);
      setMemories(memoriesData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('❌ Error fetching memories:', err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 자동으로 데이터 로드 (로그인 상태일 때만)
  useEffect(() => {
    if (isHydrated && userName) {
      fetchMemories();
    } else if (isHydrated && !userName) {
      setError('로그인이 필요합니다. AIN 지갑으로 로그인해주세요.');
    }
  }, [userName, isHydrated]);

  return (
    <>
      <Sidebar />
      <main className="main-content">
        {isHydrated && !isLoggedIn && <AuthOverlay />}
        <div className="graph-wrapper">
          <header className="header">
            <div className="header-left">
              <h1 className="page-title">Memory Analytics</h1>
              <p className="page-subtitle">
                AIN Blockchain Memories • {web3Count} memories
              </p>
            </div>
            <div className="header-right">
              <button
                onClick={fetchMemories}
                disabled={loading || !userName}
                className="refresh-btn"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </header>

          <div className="content">
            {/* 사용자 정보 */}
            {userName && (
              <div className="user-info">
                <p><strong>Wallet Address:</strong> {userName}</p>
                <p><strong>Web3 Memories:</strong> {web3Count}</p>
              </div>
            )}

            {/* 로딩 상태 */}
            {loading && (
              <div className="loading">
                <p>Fetching memories from Web3 and MongoDB...</p>
              </div>
            )}

            {/* 에러 상태 */}
            {error && (
              <div className="error">
                <p>Error: {error}</p>
              </div>
            )}

            {/* 메모리 데이터 출력 */}
            {!loading && !error && memories.length > 0 && (
              <div className="memories-display">
                <h3>Your Memories ({memories.length})</h3>

                <div className="memories-grid">
                  {memories.map((memory) => (
                    <div key={memory.id} className="memory-card">
                      <div className="memory-header">
                        <h4>{memory.title}</h4>
                        <span className="memory-date">{memory.date}</span>
                      </div>

                      <div className="memory-content">
                        <p>{memory.content}</p>
                      </div>

                      {memory.tags && memory.tags.length > 0 && (
                        <div className="memory-tags">
                          {memory.tags.map((tag, index) => (
                            <span key={index} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 데이터가 없을 때 */}
            {!loading && !error && memories.length === 0 && userName && (
              <div className="no-data">
                <p>저장된 메모리가 없습니다</p>
                <p>메모리를 추가하려면 대화를 시작하세요</p>
              </div>
            )}

            {/* 로그인 안 했을 때 */}
            {!loading && !userName && isHydrated && (
              <div className="no-auth">
                <p>AIN 지갑으로 로그인하여 메모리를 확인하세요</p>
              </div>
            )}
          </div>
        </div>

        {/* 스타일링 */}
        <style jsx>{`
          .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
          }

          .graph-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .header {
            padding: 20px 30px;
            border-bottom: 1px solid #2a2a2a;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
          }

          .header-left {
            flex: 1;
          }

          .page-title {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
          }

          .page-subtitle {
            color: #888;
            font-size: 14px;
          }

          .header-right {
            display: flex;
            gap: 12px;
            align-items: center;
          }

          .content {
            flex: 1;
            overflow-y: auto;
            padding: 20px 30px;
          }

          .user-info {
            background-color: #1a1d1e;
            border: 1px solid #2d3436;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }

          .user-info p {
            margin: 5px 0;
            color: #dfe6e9;
            font-size: 14px;
          }

          .refresh-btn {
            padding: 8px 16px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
            background: #6366f1;
            color: white;
          }

          .refresh-btn:hover:not(:disabled) {
            background: #5855eb;
          }

          .refresh-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .loading, .error, .no-data, .no-auth {
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
          }

          .loading {
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
          }

          .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }

          .no-data, .no-auth {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
            text-align: center;
          }

          .memories-display {
            margin-top: 20px;
          }

          .memories-display h3 {
            color: #ffffff;
            margin-bottom: 20px;
          }

          .memories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
          }

          .memory-card {
            background-color: #1a1d1e;
            border: 1px solid #2d3436;
            border-radius: 8px;
            padding: 15px;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .memory-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          }

          .memory-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }

          .memory-header h4 {
            margin: 0;
            color: #ffffff;
            font-size: 16px;
          }

          .memory-date {
            color: #b2bec3;
            font-size: 12px;
          }

          .memory-content {
            margin: 10px 0;
          }

          .memory-content p {
            margin: 0;
            color: #dfe6e9;
            font-size: 14px;
            line-height: 1.5;
          }

          .memory-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 10px;
          }

          .tag {
            background-color: #2d3436;
            color: #74b9ff;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            border: 1px solid #636e72;
          }
        `}</style>
      </main>
    </>
  );
}
