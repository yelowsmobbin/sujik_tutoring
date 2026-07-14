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
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (href.endsWith('.xml') || href.endsWith('.txt')) return;
    event.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(function(){ window.location.href = href; }, 110);
  });
})();


(function(){
  var reviewForm = document.getElementById('reviewForm');
  var reviewGrid = document.querySelector('.review-grid');
  if (reviewForm && reviewGrid) {
    reviewForm.addEventListener('submit', function(event){
      event.preventDefault();
      var author = reviewForm.author.value.trim();
      var type = reviewForm.type.value;
      var content = reviewForm.content.value.trim();
      if (!author || !content) return;
      var card = document.createElement('article');
      card.className = 'review-card is-visible';
      card.setAttribute('data-review-page','1');
      card.innerHTML = '<div class="review-meta"><div><span class="review-author"></span><time class="review-date"></time></div><span class="review-tag"></span></div><p></p>';
      card.querySelector('.review-author').textContent = author;
      card.querySelector('.review-tag').textContent = type;
      var now = new Date();
      var formattedDate = now.getFullYear() + '.' + String(now.getMonth()+1).padStart(2,'0') + '.' + String(now.getDate()).padStart(2,'0');
      var timeEl = card.querySelector('.review-date');
      if (timeEl) { timeEl.textContent = formattedDate; timeEl.setAttribute('datetime', formattedDate.replace(/\./g,'-')); }
      card.querySelector('p').textContent = content;
      reviewGrid.prepend(card);
      reviewForm.reset();
      alert('후기가 등록되었습니다. 현재 페이지에서 바로 확인할 수 있습니다.');
    });
  }
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
  if (!document.body.classList.contains('region-map-page')) return;
  document.addEventListener('click', function(event){
    var link = event.target.closest('a[href].map-zoom-link');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    document.body.classList.add('map-zooming');
  });
})();


(function(){
  if (!document.body.classList.contains('region-map-page')) return;

  function shouldAnimate(link){
    var href = link.getAttribute('href') || '';
    if (!href || href.indexOf('#') === 0) return false;
    if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return false;
    return link.classList.contains('map-zoom-link') || link.closest('.map-zoom-link');
  }

  document.addEventListener('click', function(event){
    var link = event.target.closest('a[href]');
    if (!link || !shouldAnimate(link)) return;

    var href = link.getAttribute('href');
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;

    event.preventDefault();
    document.body.classList.add('map-zooming');
    document.documentElement.classList.add('page-soft-leaving');

    window.setTimeout(function(){
      window.location.href = href;
    }, 280);
  });
})();


(function(){
  document.addEventListener('submit', function(event){
    var form = event.target;
    if (!form || !form.matches || !form.matches('form[data-formsubmit-form]')) return;

    var nextInput = form.querySelector('input[name="_next"]');
    var nextRel = form.getAttribute('data-next-url');
    if (nextInput && nextRel) {
      nextInput.value = new URL(nextRel, window.location.href).href;
    }
  });
})();


(function(){
  if (!document.body.classList.contains('region-map-page')) return;
  if (window.__sujikRegionSmoothTransition) return;
  window.__sujikRegionSmoothTransition = true;

  var layer = document.createElement('div');
  layer.className = 'region-transition-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  function isLocalRegionLink(link){
    if (!link) return false;
    var href = link.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#') return false;
    if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return false;
    if (link.target === '_blank') return false;
    return !!(link.classList.contains('map-zoom-link') || link.closest('.map-zoom-link') || link.closest('.town-list'));
  }

  document.addEventListener('click', function(event){
    var link = event.target.closest && event.target.closest('a[href]');
    if (!isLocalRegionLink(link)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();

    var rect = link.getBoundingClientRect();
    var x = rect.left + rect.width / 2;
    var y = rect.top + rect.height / 2;
    document.documentElement.style.setProperty('--region-click-x', x + 'px');
    document.documentElement.style.setProperty('--region-click-y', y + 'px');

    document.body.classList.add('map-zooming');
    document.body.classList.add('region-transition-active');

    var href = link.getAttribute('href');
    window.setTimeout(function(){
      window.location.href = href;
    }, 520);
  }, true);

  window.addEventListener('pageshow', function(){
    document.body.classList.remove('region-transition-active');
  });
})();
