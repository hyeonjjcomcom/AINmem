let isLoggedIn = true;
let currentTheme = 'dark';

function renderUserSection() {
  if (isLoggedIn) {
    document.getElementById("logged-in-section").style.display = "flex";
    document.getElementById("login-section").style.display = "none";
  } else {
    document.getElementById("logged-in-section").style.display = "none";
    document.getElementById("login-section").style.display = "flex";
  }
}

function handleLogin() {
  isLoggedIn = true; 
  renderUserSection();
}

function handleLogout() {
  isLoggedIn = false;
  renderUserSection();
  closeUserDropdown();
}


function toggleUserDropdown() {
    if (isLoggedIn) {
        const overlay = document.getElementById('userDropdownOverlay');
        const menu = document.getElementById('userDropdownMenu');
        
        if (overlay.classList.contains('show')) {
            closeUserDropdown();
        } else {
            overlay.classList.add('show');
            setTimeout(() => {
                menu.classList.add('show');
            }, 10);
        }
    }
}

function closeUserDropdown() {
    const overlay = document.getElementById('userDropdownOverlay');
    const menu = document.getElementById('userDropdownMenu');
    
    menu.classList.remove('show');
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 200);
}

function handleUserMenuClick(action) {
    console.log('Menu clicked:', action);
    
    switch(action) {
        case 'api-keys':
            // API Keys 페이지로 이동
            break;
        case 'profile':
            // 프로필 설정 페이지로 이동
            break;
        case 'settings':
            // 설정 페이지로 이동
            break;
        case 'billing':
            // 결제 관리 페이지로 이동
            break;
        case 'help':
            // 도움말 페이지로 이동
            break;
        case 'logout':
            // 로그아웃 처리
            break;
    }
    
    closeUserDropdown();
}

function setTheme(theme) {
    currentTheme = theme;
    
    // 모든 테마 아이콘에서 active 클래스 제거
    document.querySelectorAll('.user-dropdown-theme-icon').forEach(icon => {
        icon.classList.remove('active');
    });
    
    // 선택된 테마 아이콘에 active 클래스 추가
    event.target.classList.add('active');
    
    console.log('Theme changed to:', theme);
    // 여기에 실제 테마 변경 로직 구현
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeUserDropdown();
    }
});