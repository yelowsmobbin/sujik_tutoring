(function() {
  function getPathToRoot() {
    var scripts = document.querySelectorAll('script[src]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src') || '';
      if (src.indexOf('assets/js/main.js') !== -1) {
        return src.replace('assets/js/main.js', '');
      }
    }
    return '';
  }
  var applyUrl = getPathToRoot() + 'consultation/apply/index.html';
  var kakaoUrl = 'https://pf.kakao.com/_ZpsjX/friend';
  window.openLanding = function() {
    window.location.href = applyUrl;
  };
  window.openLevelTest = function() {
    window.location.href = getPathToRoot() + 'level-test/index.html';
  };
  window.openKakaoConsult = function() {
    var newWindow = window.open(kakaoUrl, '_blank');
    if (newWindow) { newWindow.opener = null; }
  };
  window.openPhoneConsult = function() {
    window.location.href = 'tel:01077158007';
  };
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.querySelectorAll('[data-year]').forEach(function(el) { el.textContent = new Date().getFullYear(); });
})();

document.addEventListener('click', function(event) {
  var button = event.target.closest('[data-subject-tab]');
  if (!button) return;
  var section = button.closest('.subject-select-section');
  if (!section) return;
  var key = button.getAttribute('data-subject-tab');
  section.querySelectorAll('[data-subject-tab]').forEach(function(btn) {
    btn.classList.toggle('is-active', btn === button);
  });
  section.querySelectorAll('[data-subject-panel]').forEach(function(panel) {
    panel.classList.toggle('is-active', panel.getAttribute('data-subject-panel') === key);
  });
});



(function(){
  function ready(){ document.body.classList.add('is-ready'); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else { ready(); }
  window.addEventListener('pageshow', function(){ document.body.classList.add('is-ready'); document.body.classList.remove('is-leaving'); });

  // set default active subject tab where needed
  document.querySelectorAll('.subject-select-section').forEach(function(section){
    var activeBtn = section.querySelector('[data-subject-tab].is-active') || section.querySelector('[data-subject-tab]');
    if (!activeBtn) return;
    var key = activeBtn.getAttribute('data-subject-tab');
    activeBtn.classList.add('is-active');
    section.querySelectorAll('[data-subject-panel]').forEach(function(panel){
      panel.classList.toggle('is-active', panel.getAttribute('data-subject-panel') === key);
    });
  });

  // smooth transition for internal page navigation
  document.addEventListener('click', function(event){
    var link = event.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    // 같은 페이지의 해시 링크(#reviewForm 등)는 페이지를 숨기지 않고 바로 이동합니다.
    var targetUrl;
    try {
      targetUrl = new URL(href, window.location.href);
    } catch (e) {
      return;
    }

    var samePage =
      targetUrl.origin === window.location.origin &&
      targetUrl.pathname === window.location.pathname &&
      targetUrl.search === window.location.search;

    if (samePage && targetUrl.hash) {
      var target = document.getElementById(decodeURIComponent(targetUrl.hash.slice(1)));
      if (target) {
        event.preventDefault();
        document.body.classList.remove('is-leaving');
        document.body.classList.add('is-ready');
        history.pushState(null, '', targetUrl.hash);
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
      return;
    }

    if (href.startsWith('http')) return;
    if (href.endsWith('.xml') || href.endsWith('.txt')) return;
    event.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(function(){ window.location.href = href; }, 110);
  });

  // #reviewForm 주소로 직접 진입했을 때도 렌더링 완료 후 정확히 이동합니다.
  function scrollToInitialHash(){
    if (!window.location.hash) return;
    var target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (!target) return;
    document.body.classList.remove('is-leaving');
    document.body.classList.add('is-ready');
    setTimeout(function(){
      target.scrollIntoView({behavior:'auto', block:'start'});
    }, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrollToInitialHash);
  } else {
    scrollToInitialHash();
  }
  window.addEventListener('pageshow', scrollToInitialHash);
})();






(function(){
  var reviewForm = document.getElementById('reviewForm');
  if (!reviewForm) return;

  reviewForm.addEventListener('submit', async function(event){
    event.preventDefault();

    var grade = reviewForm.querySelector('[name="학년"]') ? reviewForm.querySelector('[name="학년"]').value : '';
    var subject = reviewForm.querySelector('[name="과목"]') ? reviewForm.querySelector('[name="과목"]').value : '';
    var ratingInput = reviewForm.querySelector('input[name="별점"]:checked');
    var content = reviewForm.querySelector('[name="후기내용"]') ? reviewForm.querySelector('[name="후기내용"]').value.trim() : '';

    if (!grade || !subject || !ratingInput || !content) {
      alert('학년, 과목, 별점, 후기 내용을 입력해주세요.');
      return;
    }

    var submitBtn = reviewForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '전송 중...';
    }

    try {
      var formData = new FormData(reviewForm);
      await fetch(reviewForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
    } catch (err) {
      // 메일 전송 응답이 불안정해도 사용자는 우리가 만든 완료 페이지로 이동합니다.
    }

    window.location.href = '../reviews/thanks/';
  });
})();












(function(){
  var track = document.querySelector('[data-home-review-track]');
  if (!track) return;
  var prev = document.querySelector('[data-home-review-prev]');
  var next = document.querySelector('[data-home-review-next]');
  function step(){
    var card = track.querySelector('.home-review-card');
    return card ? card.getBoundingClientRect().width + 16 : 280;
  }
  function move(dir){
    track.scrollBy({left: step() * dir, behavior:'smooth'});
  }
  if (prev) prev.addEventListener('click', function(){ move(-1); });
  if (next) next.addEventListener('click', function(){ move(1); });
  setInterval(function(){
    var max = track.scrollWidth - track.clientWidth - 4;
    if (track.scrollLeft >= max) {
      track.scrollTo({left:0, behavior:'smooth'});
    } else {
      move(1);
    }
  }, 4200);
})();


(function(){
  var grid = document.querySelector('.review-grid');
  var pagination = document.querySelector('[data-review-pagination]');
  if (!grid || !pagination) return;

  var totalPages = parseInt(pagination.getAttribute('data-total-pages') || '1', 10);
  var currentPage = 1;
  var groupStart = 1;

  function showReviewPage(page){
    currentPage = Math.max(1, Math.min(totalPages, parseInt(page, 10) || 1));
    grid.querySelectorAll('.review-card').forEach(function(card){
      card.classList.toggle('is-visible', card.getAttribute('data-review-page') === String(currentPage));
    });
    renderPagination();
  }

  function renderPagination(){
    if (currentPage < groupStart || currentPage >= groupStart + 5) {
      groupStart = Math.floor((currentPage - 1) / 5) * 5 + 1;
    }

    pagination.innerHTML = '';

    if (groupStart > 1) {
      var prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'review-page-btn review-prev';
      prev.setAttribute('data-review-prev', 'true');
      prev.setAttribute('aria-label', '이전 후기 페이지');
      prev.textContent = '‹';
      pagination.appendChild(prev);
    }

    var end = Math.min(groupStart + 4, totalPages);
    for (var i = groupStart; i <= end; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'review-page-btn' + (i === currentPage ? ' is-active' : '');
      btn.setAttribute('data-review-page-btn', String(i));
      btn.textContent = String(i);
      pagination.appendChild(btn);
    }

    if (end < totalPages) {
      var next = document.createElement('button');
      next.type = 'button';
      next.className = 'review-page-btn review-next';
      next.setAttribute('data-review-next', 'true');
      next.setAttribute('aria-label', '다음 후기 페이지');
      next.textContent = '›';
      pagination.appendChild(next);
    }
  }

  pagination.addEventListener('click', function(event){
    var pageBtn = event.target.closest('[data-review-page-btn]');
    if (pageBtn) {
      showReviewPage(pageBtn.getAttribute('data-review-page-btn'));
      grid.scrollIntoView({behavior:'smooth', block:'start'});
      return;
    }

    var nextBtn = event.target.closest('[data-review-next]');
    if (nextBtn) {
      groupStart = Math.min(groupStart + 5, Math.floor((totalPages - 1) / 5) * 5 + 1);
      showReviewPage(groupStart);
      grid.scrollIntoView({behavior:'smooth', block:'start'});
      return;
    }

    var prevBtn = event.target.closest('[data-review-prev]');
    if (prevBtn) {
      groupStart = Math.max(1, groupStart - 5);
      showReviewPage(groupStart);
      grid.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });

  showReviewPage(1);
})();


(function(){
  document.addEventListener('submit', function(event){
    var form = event.target;
    if (!form || !form.matches || !form.matches('form[data-formsubmit-form]')) return;
    var nextInput = form.querySelector('input[name="_next"]');
    if (nextInput && nextInput.value && /^https?:\/\//i.test(nextInput.value)) return;
    var nextRel = form.getAttribute('data-next-url');
    if (nextInput && nextRel) {
      nextInput.value = new URL(nextRel, window.location.href).href;
    }
  });
})();




