function logout() {
    localStorage.clear();
    toggleDisplay('header', false);
    toggleDisplay('nav', false);
    toggleDisplay('.container', false);
    const authModal = document.getElementById('authModal');
    if (authModal) {
    authModal.style.display = 'block';
    setTimeout(() => {
    location.reload();
    }, 100);
    } else {
    sessionStorage.setItem('showAuthModal', 'true');
    window.location.href = 'index.html';
    }
    }
    
    function toggleDisplay(selector, show) {
    const element = document.querySelector(selector);
    if (element) {
    element.style.display = show ? 'block' : 'none';
    }
    }
    
  