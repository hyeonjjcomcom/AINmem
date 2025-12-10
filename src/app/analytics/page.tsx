"use client";

import { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import AuthOverlay from "@/components/AuthOverlay";
import { MemoryTagList } from "@/components/ui/MemoryTag";
import { useAuth } from "@/contexts/AuthContext";
import styles from './Analytics.module.css';

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
      setError('Login required');
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
      setError('Login required. Please log in with your AIN wallet.');
    }
  }, [userName, isHydrated]);

  return (
    <>
      <Sidebar />
      <main className={styles.mainContent}>
        {isHydrated && !isLoggedIn && <AuthOverlay />}
        <div className={styles.graphWrapper}>
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>Memory Analytics</h1>
              <p className={styles.pageSubtitle}>
                AIN Blockchain Memories • {web3Count} memories
              </p>
            </div>
            <div className={styles.headerRight}>
              <button
                onClick={fetchMemories}
                disabled={loading || !userName}
                className={styles.refreshBtn}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </header>

          <div className={styles.content}>
            {/* 사용자 정보 */}
            {userName && (
              <div className={styles.userInfo}>
                <p><strong>Wallet Address:</strong> {userName}</p>
                <p><strong>Web3 Memories:</strong> {web3Count}</p>
              </div>
            )}

            {/* 로딩 상태 */}
            {loading && (
              <div className={styles.loading}>
                <p>Fetching memories from Web3 and MongoDB...</p>
              </div>
            )}

            {/* 에러 상태 */}
            {error && (
              <div className={styles.error}>
                <p>Error: {error}</p>
              </div>
            )}

            {/* 메모리 데이터 출력 */}
            {!loading && !error && memories.length > 0 && (
              <div className={styles.memoriesDisplay}>
                <h3>Your Memories ({memories.length})</h3>

                <div className={styles.memoriesGrid}>
                  {memories.map((memory) => (
                    <div key={memory.id} className={styles.memoryCard}>
                      <div className={styles.memoryHeader}>
                        <h4>{memory.title}</h4>
                        <span className={styles.memoryDate}>{memory.date}</span>
                      </div>

                      <div className={styles.memoryContent}>
                        <p>{memory.content}</p>
                      </div>

                      {memory.tags && memory.tags.length > 0 && (
                        <MemoryTagList tags={memory.tags} className={styles.memoryTags} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 데이터가 없을 때 */}
            {!loading && !error && memories.length === 0 && userName && (
              <div className={styles.noData}>
                <p>No memories saved</p>
                <p>Start a conversation to add memories</p>
              </div>
            )}

            {/* 로그인 안 했을 때 */}
            {!loading && !userName && isHydrated && (
              <div className={styles.noAuth}>
                <p>Log in with your AIN wallet to view memories</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
