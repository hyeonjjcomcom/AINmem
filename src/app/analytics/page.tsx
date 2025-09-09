"use client";

import { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";

// AIN Network 데이터 타입 정의
interface AinData {
  [key: string]: {
    user?: string;
    "echo-bot"?: string;
    [key: string]: any;
  };
}

export default function HomePage() {
  const [ainData, setAinData] = useState<AinData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // AIN Network 데이터 가져오기 함수 (클라이언트에서 직접 실행)
  const fetchAinData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 브라우저 환경 체크
      if (typeof window === 'undefined') {
        throw new Error('This function can only run in the browser');
      }

      // 동적 import로 AIN.js 로드 (클라이언트에서)
      const { default: Ain } = await import('@ainblockchain/ain-js');
      
      const ain = new Ain(
        'https://testnet-api.ainetwork.ai', 
        'wss://testnet-event.ainetwork.ai', 
        0
      );

      // 계정 추가
      const address = ain.wallet.addAndSetDefaultAccount(
        '8f9db3642a70aac232dff6b5bc482f836521e3d93fdf7ddff681ac5f2e8d144c'
      );

      const appName = 'ain_mem_1';
      const appPath = `/apps/${appName}`;

      console.log('Fetching data from:', appPath);
      console.log('Using address:', address);

      // 데이터 가져오기
      const data = await ain.db.ref(appPath).getValue();
      
      console.log('Received data:', data);
      setAinData(data || {});
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching AIN data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 자동으로 데이터 로드
  useEffect(() => {
    fetchAinData();
  }, []);

  return (
    <>
      <Sidebar />
      <main className="main-content">
        <div className="graph-wrapper">
          <div className="ain-data-section">
            <h2>AIN Network Data Viewer</h2>
            
            {/* 새로고침 버튼 */}
            <button 
              onClick={fetchAinData} 
              disabled={loading}
              className="refresh-btn"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>

            {/* 로딩 상태 */}
            {loading && (
              <div className="loading">
                <p>Fetching data from AIN Network...</p>
              </div>
            )}

            {/* 에러 상태 */}
            {error && (
              <div className="error">
                <p>Error: {error}</p>
              </div>
            )}

            {/* 데이터 출력 */}
            {ainData && (
              <div className="data-display">
                <h3>Raw Data: Url - /apps/ain_mem_1</h3>
                <pre className="json-output">
                  {JSON.stringify(ainData, null, 2)}
                </pre>
                
                {/* 데이터를 더 읽기 쉽게 표시 */}
                <h3>Formatted Data:</h3>
                <div className="formatted-data">
                  {Object.entries(ainData).map(([timestamp, content]) => (
                    <div key={timestamp} className="data-entry">
                      <h4>Timestamp: {timestamp}</h4>
                      <div className="content">
                        {content.user && (
                          <p><strong>User:</strong> {content.user}</p>
                        )}
                        {content["echo-bot"] && (
                          <p><strong>Echo Bot:</strong> {content["echo-bot"]}</p>
                        )}
                        {/* 기타 필드들 표시 */}
                        {Object.entries(content).map(([key, value]) => {
                          if (key !== 'user' && key !== 'echo-bot') {
                            return (
                              <p key={key}>
                                <strong>{key}:</strong> {JSON.stringify(value)}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 데이터가 없을 때 */}
            {!loading && !error && !ainData && (
              <div className="no-data">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* 스타일링 */}
        <style jsx>{`
          .ain-data-section {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .refresh-btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-bottom: 20px;
            font-size: 14px;
          }

          .refresh-btn:hover:not(:disabled) {
            background-color: #0056b3;
          }

          .refresh-btn:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
          }

          .loading, .error, .no-data {
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
          }

          .loading {
            background-color: #3a4446ff;
            color: #0c5460;
            border: 1px solid #bee5eb;
          }

          .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }

          .no-data {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
          }

          .data-display {
            margin-top: 20px;
          }

          .json-output {
            background-color: #000000ff;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            padding: 15px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            white-space: pre-wrap;
            max-height: 500px;
            overflow-y: auto;
          }

          .formatted-data {
            margin-top: 20px;
          }

          .data-entry {
            background-color: #000000ff;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
          }

          .data-entry h4 {
            margin: 0 0 10px 0;
            color: #495057;
            font-size: 14px;
          }

          .content p {
            margin: 5px 0;
            font-size: 14px;
          }

          h2, h3 {
            color: #ffffffff;
            margin-bottom: 15px;
          }
        `}</style>
      </main>
    </>
  );
}