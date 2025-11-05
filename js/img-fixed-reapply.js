(function () {
  function applyFixed(el) {
    if (!el || !el.hasAttribute('data-img-fixed')) return;
    var fixed = el.getAttribute('data-img-fixed') || '';
    var m = fixed.match(/^(\d+)(?:x(\d+))?$/);
    var w = m && m[1] ? m[1] : '';
    var h = m && m[2] ? m[2] : '';

    if (w) {
      el.setAttribute('width', w);
      el.style.width = w + 'px';
    }
    if (h) {
      el.setAttribute('height', h);
      el.style.height = h + 'px';
    }
    el.style.setProperty('max-width', 'none', 'important');
  }

  function applyAll() {
    document.querySelectorAll('img[data-img-fixed]').forEach(applyFixed);
  }

  document.addEventListener('DOMContentLoaded', applyAll);
  window.addEventListener('load', applyAll);

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type === 'attributes' && m.target.tagName === 'IMG') {
        applyFixed(m.target);
      }
      Array.prototype.forEach.call(m.addedNodes || [], function (node) {
        if (node && node.tagName === 'IMG') applyFixed(node);
        if (node && node.querySelectorAll) {
          node.querySelectorAll('img[data-img-fixed]').forEach(applyFixed);
        }
      });
    });
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'style', 'class']
  });
})();