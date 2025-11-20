"use client";

import React from 'react';
import Sidebar from '../components/Sidebar';
import styles from './Requests.module.css';

const RequestsPage: React.FC = () => {
  return (
    <>
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 컨테이너 */}
      <div className={styles['main-container']}>
        {/* 상단 헤더 */}
        <div className={styles.header}>
          <div className={styles['header-left']}>
            <a href="/dashboard">
              <img src="/Ainmem_V0.png" className={styles.logo} alt="logo" />
            </a>
            <div className={styles['upgrade-section']}>
              <a href="/dashboard/subscriptions">
                <span>Upgrade</span>
              </a>
            </div>
            <div className={styles.breadcrumb}>
              <button className={styles['org-selector']}>
                <span>hyeonjeong-default-org</span>
                <div className={styles['dropdown-arrow']}>
                  <svg>{/* Arrow SVG */}</svg>
                </div>
              </button>
              <span>/</span>
              <button className={styles['project-selector']}>
                <span>default-project</span>
                <div className={styles['dropdown-arrow']}>
                  <svg>{/* Arrow SVG */}</svg>
                </div>
              </button>
            </div>
          </div>
          <div className={styles['header-right']}>
            <a href="/dashboard/requests">Dashboard</a>
            <a href="/playground">Playground</a>
            <a href="https://docs.mem0.ai/platform/quickstart/">Docs</a>
            <a href="/settings">
              <svg>{/* Settings Icon SVG */}</svg>
            </a>
            <button className={styles['notifications-btn']}>
              <svg>{/* Notifications Icon SVG */}</svg>
            </button>
            <div className={styles['user-avatar']}>
              <div className={styles['avatar-circle']}>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className={styles['main-content']}>
          {/* 페이지 헤더 */}
          <div className={styles['page-header']}>
            <div className={styles['page-header-content']}>
              <div className={styles['page-title-section']}>
                <div className={styles['page-title']}>
                  <h3>{/* Page Title */}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* 대시보드 컨텐츠 */}
          <div className={styles['dashboard-content']}>
            <div className={styles['content-header']}>
              <div className={styles['content-title']}>
                <h2>{/* Content Title */}</h2>
                <p>{/* Content Description */}</p>
              </div>
              <button className={styles['refresh-btn']}>
                <svg>{/* Refresh Icon SVG */}</svg>
              </button>
            </div>

            {/* 통계 카드 */}
            <div className={styles['stats-cards']}>
              <div className={styles['stats-card']}>
                <div className={styles['stats-card-content']}>
                  <div className={styles['stats-icon']}>
                    <svg>{/* Stats Icon SVG */}</svg>
                  </div>
                  <p className={styles['stats-label']}>{/* Label */}</p>
                  <div className={styles['stats-value']}>
                    <span>222</span>
                  </div>
                  <p className={styles['stats-description']}>{/* Description */}</p>
                </div>
              </div>
              <div className={styles['stats-card']}>
                <div className={styles['stats-card-content']}>
                  <div className={styles['stats-icon']}>
                    <svg>{/* Stats Icon SVG */}</svg>
                  </div>
                  <p className={styles['stats-label']}>{/* Label */}</p>
                  <p className={styles['stats-percentage']}>0%</p>
                  <p className={styles['stats-description']}>{/* Description */}</p>
                </div>
              </div>
              <div className={styles['stats-card']}>
                <div className={styles['stats-card-content']}>
                  <div className={styles['stats-icon']}>
                    <svg>{/* Stats Icon SVG */}</svg>
                  </div>
                  <p className={styles['stats-label']}>{/* Label */}</p>
                  <p className={styles['stats-value']}>137</p>
                  <p className={styles['stats-description']}>{/* Description */}</p>
                </div>
              </div>
              <div className={styles['stats-card']}>
                <div className={styles['stats-card-content']}>
                  <div className={styles['stats-icon']}>
                    <svg>{/* Stats Icon SVG */}</svg>
                  </div>
                  <p className={styles['stats-label']}>{/* Label */}</p>
                  <p className={styles['stats-value']}>1.2K</p>
                  <p className={styles['stats-description']}>{/* Description */}</p>
                </div>
              </div>
            </div>

            {/* 검색 영역 */}
            <div className={styles['search-section']}>
              <div className={styles['search-container']}>
                <input
                  type="text"
                  className={styles['search-input']}
                  placeholder="Search..."
                />
                <svg className={styles['search-icon']}>{/* Search Icon SVG */}</svg>
              </div>
            </div>

            {/* 추가 통계 섹션 */}
            <div className={styles['additional-stats']}>
              <div className={styles['stats-grid']}>
                <div className={styles['stats-item']}>
                  <div className={styles['stats-item-header']}>
                    <svg className={styles['stats-item-icon']}>{/* Icon SVG */}</svg>
                    <div className={styles['stats-item-labels']}>
                      <div className={styles['stats-primary-label']}>
                        <span>Total Users</span>
                      </div>
                      <div className={styles['stats-secondary-label']}>
                        <span>Memories per User</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles['stats-item-values']}>
                    <div className={styles['stats-values-container']}>
                      <div className={styles['stats-primary-value']}>
                        <span>1</span>
                      </div>
                      <div className={styles['stats-secondary-value']}>
                        <span>222</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles['stats-item']}>
                  <div className={styles['stats-item-header']}>
                    <svg className={styles['stats-item-icon']}>{/* Icon SVG */}</svg>
                    <div className={styles['stats-item-labels']}>
                      <div className={styles['stats-primary-label']}>
                        <span>Total Agents</span>
                      </div>
                      <div className={styles['stats-secondary-label']}>
                        <span>Memories per Agent</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles['stats-item-values']}>
                    <div className={styles['stats-values-container']}>
                      <div className={styles['stats-primary-value']}>
                        <span>0</span>
                      </div>
                      <div className={styles['stats-secondary-value']}>
                        <span>0</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles['stats-item']}>
                  <div className={styles['stats-item-header']}>
                    <svg className={styles['stats-item-icon']}>{/* Icon SVG */}</svg>
                    <div className={styles['stats-item-labels']}>
                      <div className={styles['stats-primary-label']}>
                        <span>Total Sessions</span>
                      </div>
                      <div className={styles['stats-secondary-label']}>
                        <span>Memories per Session</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles['stats-item-values']}>
                    <div className={styles['stats-values-container']}>...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 데이터 테이블 */}
        <div className={styles['data-table-container']}>
          <table className={styles['data-table']} id="requestsTable">
            <thead className={styles['table-header']}>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>User</th>
                <th>Payload</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody className={styles['table-body']}>
              <tr className={styles['table-row']} data-event-id="sample-1">
                <td className={styles['table-cell']}>
                  <div className={styles['time-badge']}>
                    <span>2.52 s</span>
                  </div>
                </td>
                <td className={styles['table-cell']}>
                  <span className={styles['status-icon']}>
                    <div className={styles['status-indicator']}>
                      <svg>{/* Status Icon SVG */}</svg>
                    </div>
                  </span>
                </td>
                <td className={styles['table-cell']}>
                  <div className={styles['empty-cell']}></div>
                </td>
              </tr>
              <tr className={styles['table-row']} data-event-id="sample-2">
                <td className={styles['table-cell']}>
                  <span>about 17 hours ago</span>
                </td>
                <td className={styles['table-cell']}>
                  <div className={styles['action-badge']}>ADD</div>
                </td>
                <td className={styles['table-cell']}>
                  <div className={styles['user-info']}>
                    <a href="/dashboard/user/chrome-extension-user">
                      <div className={styles['user-link']}>
                        <svg className={styles['user-icon']}>{/* User Icon SVG */}</svg>
                        <span>chrome-extension-user</span>
                      </div>
                    </a>
                  </div>
                </td>
                <td className={styles['table-cell']}>
                  <div className={styles['payload-preview']}>
                    {`{ "infer": true, "source":... }`}
                  </div>
                </td>
                <td className={styles['table-cell']}>
                  <div className={styles['duration-badge']}>
                    <span>3.74 s</span>
                  </div>
                </td>
                <td className={styles['table-cell']}>
                  <span className={styles['status-icon']}>
                    <div className={styles['success-indicator']}>
                      <svg>{/* Success Icon SVG */}</svg>
                    </div>
                  </span>
                </td>
                <td className={styles['table-cell']}>
                  <div className={styles['empty-cell']}></div>
                </td>
              </tr>
              <tr className={styles['table-row']} data-event-id="sample-3">
                <td className={styles['table-cell']}>
                  <span>about 17 hours ago</span>
                </td>
                <td className={styles['table-cell']}>
                  <div className={styles['action-badge']}>ADD</div>
                </td>
                <td className={styles['table-cell']}>
                  <div className={styles['user-info']}>
                    <a href="/dashboard/user/chrome-extension-user">
                      <div className={styles['user-link']}>
                        <svg className={styles['user-icon']}>{/* User Icon SVG */}</svg>
                        <span>chrome-extension-user</span>
                      </div>
                    </a>
                  </div>
                </td>
                <td className={styles['table-cell']}>
                  <div className={styles['payload-preview']}>
                    {`{ "infer": true, "source":... }`}
                  </div>
                </td>
                <td className={styles['table-cell']}>
                  <div className={styles['duration-badge']}>
                    <span>16.88 s</span>
                  </div>
                </td>
                <td className={styles['table-cell']}>
                  <span className={styles['status-icon']}>
                    <div className={styles['success-indicator']}>
                      <svg>{/* Success Icon SVG */}</svg>
                    </div>
                  </span>
                </td>
                <td className={styles['table-cell']}>
                  <div className={styles['result-badge']}>
                    <div className={styles['add-result']}>
                      <svg>{/* Add Icon SVG */}</svg>
                      <span>1</span>
                      <span>Add</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default RequestsPage;