"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import styles from './Requests.module.css';

const RequestsPage = () => {
  return (
    <>
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 컨테이너 */}
      <div className={styles.mainContainer}>
        {/* 상단 헤더 */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <a href="/dashboard">
              <img src="/Ainmem_V0.png" className={styles.logo} alt="logo" />
            </a>
            <div className={styles.upgradeSection}>
              <a href="/dashboard/subscriptions">
                <span>Upgrade</span>
              </a>
            </div>
            <div className={styles.breadcrumb}>
              <button className={styles.orgSelector}>
                <span>hyeonjeong-default-org</span>
                <div className={styles.dropdownArrow}>
                  <svg>{/* Arrow SVG */}</svg>
                </div>
              </button>
              <span>/</span>
              <button className={styles.projectSelector}>
                <span>default-project</span>
                <div className={styles.dropdownArrow}>
                  <svg>{/* Arrow SVG */}</svg>
                </div>
              </button>
            </div>
          </div>
          <div className={styles.headerRight}>
            <a href="/dashboard/requests">Dashboard</a>
            <a href="/playground">Playground</a>
            <a href="https://docs.mem0.ai/platform/quickstart/">Docs</a>
            <a href="/settings">
              <svg>{/* Settings Icon SVG */}</svg>
            </a>
            <button className={styles.notificationsBtn}>
              <svg>{/* Notifications Icon SVG */}</svg>
            </button>
            <div className={styles.userAvatar}>
              <div className={styles.avatarCircle}>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className={styles.mainContent}>
          {/* 페이지 헤더 */}
          <div className={styles.pageHeader}>
            <div className={styles.pageHeaderContent}>
              <div className={styles.pageTitleSection}>
                <div className={styles.pageTitle}>
                  <h3>{/* Page Title */}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* 대시보드 컨텐츠 */}
          <div className={styles.dashboardContent}>
            <div className={styles.contentHeader}>
              <div className={styles.contentTitle}>
                <h2>{/* Content Title */}</h2>
                <p>{/* Content Description */}</p>
              </div>
              <button className={styles.refreshBtn}>
                <svg>{/* Refresh Icon SVG */}</svg>
              </button>
            </div>

            {/* 통계 카드 */}
            <div className={styles.statsCards}>
              <div className={styles.statsCard}>
                <div className={styles.statsCardContent}>
                  <div className={styles.statsIcon}>
                    <svg>{/* Stats Icon SVG */}</svg>
                  </div>
                  <p className={styles.statsLabel}>{/* Label */}</p>
                  <div className={styles.statsValue}>
                    <span>222</span>
                  </div>
                  <p className={styles.statsDescription}>{/* Description */}</p>
                </div>
              </div>
              <div className={styles.statsCard}>
                <div className={styles.statsCardContent}>
                  <div className={styles.statsIcon}>
                    <svg>{/* Stats Icon SVG */}</svg>
                  </div>
                  <p className={styles.statsLabel}>{/* Label */}</p>
                  <p className={styles.statsPercentage}>0%</p>
                  <p className={styles.statsDescription}>{/* Description */}</p>
                </div>
              </div>
              <div className={styles.statsCard}>
                <div className={styles.statsCardContent}>
                  <div className={styles.statsIcon}>
                    <svg>{/* Stats Icon SVG */}</svg>
                  </div>
                  <p className={styles.statsLabel}>{/* Label */}</p>
                  <p className={styles.statsValue}>137</p>
                  <p className={styles.statsDescription}>{/* Description */}</p>
                </div>
              </div>
              <div className={styles.statsCard}>
                <div className={styles.statsCardContent}>
                  <div className={styles.statsIcon}>
                    <svg>{/* Stats Icon SVG */}</svg>
                  </div>
                  <p className={styles.statsLabel}>{/* Label */}</p>
                  <p className={styles.statsValue}>1.2K</p>
                  <p className={styles.statsDescription}>{/* Description */}</p>
                </div>
              </div>
            </div>

            {/* 검색 영역 */}
            <div className={styles.searchSection}>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search..."
                />
                <svg className={styles.searchIcon}>{/* Search Icon SVG */}</svg>
              </div>
            </div>

            {/* 추가 통계 섹션 */}
            <div className={styles.additionalStats}>
              <div className={styles.statsGrid}>
                <div className={styles.statsItem}>
                  <div className={styles.statsItemHeader}>
                    <svg className={styles.statsItemIcon}>{/* Icon SVG */}</svg>
                    <div className={styles.statsItemLabels}>
                      <div className={styles.statsPrimaryLabel}>
                        <span>Total Users</span>
                      </div>
                      <div className={styles.statsSecondaryLabel}>
                        <span>Memories per User</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.statsItemValues}>
                    <div className={styles.statsValuesContainer}>
                      <div className={styles.statsPrimaryValue}>
                        <span>1</span>
                      </div>
                      <div className={styles.statsSecondaryValue}>
                        <span>222</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.statsItem}>
                  <div className={styles.statsItemHeader}>
                    <svg className={styles.statsItemIcon}>{/* Icon SVG */}</svg>
                    <div className={styles.statsItemLabels}>
                      <div className={styles.statsPrimaryLabel}>
                        <span>Total Agents</span>
                      </div>
                      <div className={styles.statsSecondaryLabel}>
                        <span>Memories per Agent</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.statsItemValues}>
                    <div className={styles.statsValuesContainer}>
                      <div className={styles.statsPrimaryValue}>
                        <span>0</span>
                      </div>
                      <div className={styles.statsSecondaryValue}>
                        <span>0</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.statsItem}>
                  <div className={styles.statsItemHeader}>
                    <svg className={styles.statsItemIcon}>{/* Icon SVG */}</svg>
                    <div className={styles.statsItemLabels}>
                      <div className={styles.statsPrimaryLabel}>
                        <span>Total Sessions</span>
                      </div>
                      <div className={styles.statsSecondaryLabel}>
                        <span>Memories per Session</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.statsItemValues}>
                    <div className={styles.statsValuesContainer}>...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 데이터 테이블 */}
        <div className={styles.dataTableContainer}>
          <table className={styles.dataTable} id="requestsTable">
            <thead className={styles.tableHeader}>
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
            <tbody className={styles.tableBody}>
              <tr className={styles.tableRow} data-event-id="sample-1">
                <td className={styles.tableCell}>
                  <div className={styles.timeBadge}>
                    <span>2.52 s</span>
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.statusIcon}>
                    <div className={styles.statusIndicator}>
                      <svg>{/* Status Icon SVG */}</svg>
                    </div>
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.emptyCell}></div>
                </td>
              </tr>
              <tr className={styles.tableRow} data-event-id="sample-2">
                <td className={styles.tableCell}>
                  <span>about 17 hours ago</span>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actionBadge}>ADD</div>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.userInfo}>
                    <a href="/dashboard/user/chrome-extension-user">
                      <div className={styles.userLink}>
                        <svg className={styles.userIcon}>{/* User Icon SVG */}</svg>
                        <span>chrome-extension-user</span>
                      </div>
                    </a>
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.payloadPreview}>
                    {`{ "infer": true, "source":... }`}
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.durationBadge}>
                    <span>3.74 s</span>
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.statusIcon}>
                    <div className={styles.successIndicator}>
                      <svg>{/* Success Icon SVG */}</svg>
                    </div>
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.emptyCell}></div>
                </td>
              </tr>
              <tr className={styles.tableRow} data-event-id="sample-3">
                <td className={styles.tableCell}>
                  <span>about 17 hours ago</span>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actionBadge}>ADD</div>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.userInfo}>
                    <a href="/dashboard/user/chrome-extension-user">
                      <div className={styles.userLink}>
                        <svg className={styles.userIcon}>{/* User Icon SVG */}</svg>
                        <span>chrome-extension-user</span>
                      </div>
                    </a>
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.payloadPreview}>
                    {`{ "infer": true, "source":... }`}
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.durationBadge}>
                    <span>16.88 s</span>
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.statusIcon}>
                    <div className={styles.successIndicator}>
                      <svg>{/* Success Icon SVG */}</svg>
                    </div>
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.resultBadge}>
                    <div className={styles.addResult}>
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