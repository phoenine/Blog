// ======================== ai-summary.js (Optimized) ========================
// 样式常量
const LEFT_STYLE = "color: #fadfa3; background: #030307; padding:5px 0;";
const RIGHT_STYLE = "background: #fadfa3; padding:5px 0;";

// 控制台横幅
const MESSAGE_TEMPLATE = `
 %c Silicon Flow 文章摘要AI生成 %c https://blog.phoenine.top/
`;

// ---------------- 基本配置 ----------------
const PROXY_API_URL = "https://ai-summary.phoenine.top/api/ai-summary/siliconflow"; // Vercel 代理
const LINK_AI_ABOUT = "https://blog.phoenine.top/posts/13bfb908/";

// 文章容器选择器
const siliconFlow_postSelector = "#article-container";

// 字数上限（保留以备后续扩展，当前由后端处理）
const siliconFlow_wordLimit = 1000;

// 是否启用打字机动画
const siliconFlow_typingAnimate = true;

// 允许生成 AI 摘要的 URL 模式（通配符/正则）
const siliconFlow_postURLs = [
  // "https://*.phoenine.top/posts/*",
  // "http://localhost:*/posts/*"
];
const siliconFlow_postURLs_regex = [
  /^https:\/\/.*\.phoenine\.top\/posts\/[0-9a-fA-F]+\/$/,
  /^http:\/\/localhost:4000\/posts\/[0-9a-fA-F]+\/$/
];

// 缓存有效期（默认：1 周）
const MILLISECONDS_OF_A_WEEK = 7 * 24 * 60 * 60 * 1000;
const siliconFlow_localCacheTime = MILLISECONDS_OF_A_WEEK;

// 统一运行中标记（替代已弃用的 sparkLiteIsRunning）
let siliconFlowIsRunning = false;

// 控制台提示
console.log(MESSAGE_TEMPLATE, LEFT_STYLE, RIGHT_STYLE);

// ---------------- 运行期缓存（模块级） ----------------
const __siliconFlowCache = {
  urlRegexList: null,
  postContainerEl: null,
  db: null,
  lastURL: null,
  io: null,                // IntersectionObserver 实例
  initTimer: null,         // 初始化去抖
  styleInjected: false     // 是否已注入光标 CSS
};

// ---------------- 工具：注入一次 CSS（打字光标） ----------------
function injectTypingStyleOnce() {
  if (__siliconFlowCache.styleInjected) return;
  const css = `
  .siliconFlow-explanation.sf-typing::after {
    content: '';
    display: inline-block;
    width: 1ch;
    border-right: 1px solid currentColor;
    animation: sfBlink 1s steps(1) infinite;
    margin-left: 2px;
  }
  @keyframes sfBlink { 50% { border-color: transparent; } }
  `;
  const style = document.createElement('style');
  style.setAttribute('data-sf-style', '1');
  style.textContent = css;
  document.head.appendChild(style);
  __siliconFlowCache.styleInjected = true;
}

// ---------------- IndexedDB 初始化与复用 ----------------
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SiliconFlowDB', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('summaries')) {
        const store = db.createObjectStore('summaries', { keyPath: 'url' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function getDB() {
  if (__siliconFlowCache.db) return __siliconFlowCache.db;
  try {
    __siliconFlowCache.db = await initDB();
    return __siliconFlowCache.db;
  } catch {
    __siliconFlowCache.db = null; // 降级用
    return null;
  }
}

async function readCache(url) {
  const db = await getDB();
  if (db) {
    return new Promise((resolve) => {
      const tx = db.transaction('summaries', 'readonly');
      const store = tx.objectStore('summaries');
      const req = store.get(url);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } else {
    // localStorage 简易降级：仅保留一条，避免膨胀
    const raw = localStorage.getItem('sf_summary_cache');
    if (!raw) return null;
    try {
      const obj = JSON.parse(raw);
      return obj?.url === url ? obj : null;
    } catch {
      return null;
    }
  }
}

async function writeCache(url, summary) {
  const payload = { url, summary, timestamp: Date.now() };
  const db = await getDB();
  if (db) {
    try {
      const tx = db.transaction('summaries', 'readwrite');
      tx.objectStore('summaries').put(payload);
    } catch { /* ignore */ }
  } else {
    localStorage.setItem('sf_summary_cache', JSON.stringify(payload));
  }
}

// ---------------- URL 规则预编译与匹配 ----------------
function compileURLPatternsOnce() {
  if (__siliconFlowCache.urlRegexList) return __siliconFlowCache.urlRegexList;

  const regExpEscape = (s) => s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  const wildcardToRegExp = (s) =>
    new RegExp('^' + s.split(/\*+/).map(regExpEscape).join('.*') + '$');

  const customPattern = (siliconFlow_postURLs || []).map(wildcardToRegExp);
  __siliconFlowCache.urlRegexList = [
    ...customPattern,
    ...(siliconFlow_postURLs_regex || [])
  ];
  return __siliconFlowCache.urlRegexList;
}

function matchCurrentURL(url) {
  const list = compileURLPatternsOnce();
  if (typeof siliconFlow_postURLs === "undefined" &&
      typeof siliconFlow_postURLs_regex === "undefined") {
    // 未配置则默认允许全部
    return true;
  }
  if (list.length === 0) {
    // 明确配置为空 => 全部允许（与原逻辑一致）
    return true;
  }
  return list.some((re) => re.test(url));
}

// ---------------- DOM 插入/移除 ----------------
function removeExistingAIDiv() {
  const existingAIDiv = document.querySelector(".post-SiliconFlow");
  if (existingAIDiv && existingAIDiv.parentElement) {
    existingAIDiv.parentElement.removeChild(existingAIDiv);
  }
}

function insertAIDiv(selector) {
  removeExistingAIDiv(); // 防重复
  const targetElement = document.querySelector(selector);
  if (!targetElement) return;

  const aiDiv = document.createElement('div');
  aiDiv.className = 'post-SiliconFlow';

  const aiTitleDiv = document.createElement('div');
  aiTitleDiv.className = 'siliconFlow-title';
  aiDiv.appendChild(aiTitleDiv);

  const aiIcon = document.createElement('i');
  aiIcon.className = 'siliconFlow-title-icon';
  aiIcon.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48' aria-hidden="true" focusable="false">
    <title>机器人</title>
    <g fill='none' fill-rule='evenodd'>
      <path d='M34.717885,5.03561087 C36.12744,5.27055371 37.079755,6.60373651 36.84481,8.0132786 L35.7944,14.3153359 L38.375,14.3153359 C43.138415,14.3153359 47,18.1768855 47,22.9402569 L47,34.4401516 C47,39.203523 43.138415,43.0650727 38.375,43.0650727 L9.625,43.0650727 C4.861585,43.0650727 1,39.203523 1,34.4401516 L1,22.9402569 C1,18.1768855 4.861585,14.3153359 9.625,14.3153359 L12.2056,14.3153359 L11.15519,8.0132786 C10.920245,6.60373651 11.87256,5.27055371 13.282115,5.03561087 C14.69167,4.80066802 16.024865,5.7529743 16.25981,7.16251639 L17.40981,14.0624532 C17.423955,14.1470924 17.43373,14.2315017 17.43948,14.3153359 L30.56052,14.3153359 C30.56627,14.2313867 30.576045,14.1470924 30.59019,14.0624532 L31.74019,7.16251639 C31.975135,5.7529743 33.30833,4.80066802 34.717885,5.03561087 Z M38.375,19.4902885 L9.625,19.4902885 C7.719565,19.4902885 6.175,21.0348394 6.175,22.9402569 L6.175,34.4401516 C6.175,36.3455692 7.719565,37.89012 9.625,37.89012 L38.375,37.89012 C40.280435,37.89012 41.825,36.3455692 41.825,34.4401516 L41.825,22.9402569 C41.825,21.0348394 40.280435,19.4902885 38.375,19.4902885 Z M14.8575,23.802749 C16.28649,23.802749 17.445,24.9612484 17.445,26.3902253 L17.445,28.6902043 C17.445,30.1191812 16.28649,31.2776806 14.8575,31.2776806 C13.42851,31.2776806 12.27,30.1191812 12.27,28.6902043 L12.27,26.3902253 C12.27,24.9612484 13.42851,23.802749 14.8575,23.802749 Z M33.1425,23.802749 C34.57149,23.802749 35.73,24.9612484 35.73,26.3902253 L35.73,28.6902043 C35.73,30.1191812 34.57149,31.2776806 33.1425,31.2776806 C31.71351,31.2776806 30.555,30.1191812 30.555,28.6902043 L30.555,26.3902253 C30.555,24.9612484 31.71351,23.802749 33.1425,23.802749 Z' fill='#444444'></path>
    </g>
  </svg>`;
  aiTitleDiv.appendChild(aiIcon);

  const aiTitleTextDiv = document.createElement('div');
  aiTitleTextDiv.className = 'siliconFlow-title-text';
  aiTitleTextDiv.textContent = 'AI 摘要';
  aiTitleDiv.appendChild(aiTitleTextDiv);

  const aiAboutLink = document.createElement('a');
  aiAboutLink.href = LINK_AI_ABOUT;
  aiAboutLink.target = '_blank';
  aiAboutLink.className = 'siliconFlow-about';
  aiAboutLink.style.color = 'var(--ai-summary-lighttext)';
  aiAboutLink.id = 'siliconFlow-about';
  aiAboutLink.textContent = '关于';
  aiTitleDiv.appendChild(aiAboutLink);

  const aiTagDiv = document.createElement('div');
  aiTagDiv.className = 'siliconFlow-tag';
  aiTagDiv.id = 'siliconFlow-tag';
  aiTagDiv.textContent = 'Silicon Flow';
  aiTitleDiv.appendChild(aiTagDiv);

  const aiExplanationDiv = document.createElement('div');
  aiExplanationDiv.className = 'siliconFlow-explanation';
  aiExplanationDiv.textContent = '生成中...';
  aiDiv.appendChild(aiExplanationDiv);

  targetElement.insertBefore(aiDiv, targetElement.firstChild);
}

// ---------------- SiliconFlow 核心对象 ----------------
const siliconFlow = {
  // SWR：先读缓存，后台刷新；无缓存则等待网络；失败用过期缓存兜底
  fetchSiliconFlowSummary: async function () {
    const url = window.location.href;

    // 1) 读取缓存
    let cached = null;
    try {
      cached = await readCache(url);
    } catch (e) {
      console.log('【AI 摘要前端】读取缓存失败', e);
    }
    const isExpired = cached ? (Date.now() - cached.timestamp > siliconFlow_localCacheTime) : true;

    // 2) 后台刷新（不阻塞 UI）
    const refreshPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeout = 30000;
        const timer = setTimeout(() => controller.abort(), timeout);
        const res = await fetch(PROXY_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_url: url }),
          signal: controller.signal
        });
        clearTimeout(timer);
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.summary) {
          await writeCache(url, data.summary);
          return data.summary;
        } else {
          console.error(`【AI 摘要前端】代理或 API 错误: ${data?.error || res.statusText}`);
          return null;
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('【AI 摘要前端】Silicon Flow 请求超时');
        } else {
          console.error('【AI 摘要前端】Silicon Flow 请求失败：', error);
        }
        return null;
      }
    })();

    // 3) 有未过期缓存则先用
    if (cached && !isExpired) return cached.summary;

    // 4) 等待网络结果
    const fresh = await refreshPromise;
    if (fresh) return fresh;

    // 5) 失败兜底：过期缓存或失败提示
    if (cached?.summary) return cached.summary;
    return '【AI 摘要前端】获取文章摘要失败，请稍后重试。';
  },

  // 打字机动画：分块写入，避免 rAF 空转；IO 复用；避免频繁 innerHTML
  aiShowAnimation: function (text) {
    const element = document.querySelector(".siliconFlow-explanation");
    if (!element) return;

    const useTyping = (typeof siliconFlow_typingAnimate === "undefined")
      ? true
      : !!siliconFlow_typingAnimate;

    if (!useTyping) {
      element.textContent = text;
      return;
    }

    if (siliconFlowIsRunning) return;
    siliconFlowIsRunning = true;
    injectTypingStyleOnce();

    // 复用 IntersectionObserver
    if (!__siliconFlowCache.io) {
      __siliconFlowCache.io = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        // 当元素进入视口后启动动画；离开则暂停（不排新帧）
        if (entry.isIntersecting) {
          if (!animState.started) {
            animState.started = true;
            requestAnimationFrame(animate);
          } else if (animState.paused) {
            animState.paused = false;
            requestAnimationFrame(animate);
          }
        } else {
          animState.paused = true;
        }
      }, { threshold: 0 });
    }

    const postAI = document.querySelector('.post-SiliconFlow');
    if (postAI) __siliconFlowCache.io.observe(postAI);

    element.textContent = '';
    element.classList.add('sf-typing');

    const CHUNK = 4;        // 每帧写入 4 个字符，减少重排
    const BASE_DELAY = 25;  // 单位毫秒
    const PUNCT_PAUSE = 6;

    const textLen = text.length;
    const animState = {
      idx: 0,
      paused: false,
      started: false
    };

    function nextDelay(slice) {
      const last = slice[slice.length - 1] || '';
      return /[，。！、？,.!?]/.test(last) ? BASE_DELAY * PUNCT_PAUSE : BASE_DELAY;
    }

    function animate() {
      if (animState.paused) return;
      if (animState.idx >= textLen) {
        // 收尾
        element.classList.remove('sf-typing');
        siliconFlowIsRunning = false;
        if (postAI) __siliconFlowCache.io.unobserve(postAI);
        return;
      }

      const start = animState.idx;
      const end = Math.min(start + CHUNK, textLen);
      const slice = text.slice(start, end);
      animState.idx = end;
      element.textContent += slice;

      setTimeout(() => {
        if (!animState.paused) requestAnimationFrame(animate);
      }, nextDelay(slice));
    }
  }
};

// ---------------- 运行主流程 ----------------
function runSiliconFlow() {
  removeExistingAIDiv();                    // 防止重复容器
  insertAIDiv(siliconFlow_postSelector);    // 插占位
  siliconFlow.fetchSiliconFlowSummary().then((summary) => {
    siliconFlow.aiShowAnimation(summary);
  });
}

// URL + 容器检查并触发
function initializeSiliconFlow() {
  const url = window.location.href;

  // 相同 URL 重入保护
  if (__siliconFlowCache.lastURL === url) return;
  __siliconFlowCache.lastURL = url;

  // 容器缓存
  const el = __siliconFlowCache.postContainerEl || document.querySelector(siliconFlow_postSelector);
  __siliconFlowCache.postContainerEl = el;

  if (!el) { removeExistingAIDiv(); return; }
  if (!matchCurrentURL(url)) { removeExistingAIDiv(); return; }

  runSiliconFlow();
}

// ---------------- 路由事件去抖 ----------------
function scheduleInit() {
  if (__siliconFlowCache.initTimer) clearTimeout(__siliconFlowCache.initTimer);
  __siliconFlowCache.initTimer = setTimeout(initializeSiliconFlow, 150);
}

// 包装 pushState/replaceState
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = new Proxy(originalPushState, {
  apply(target, thisArg, argArray) {
    const res = Reflect.apply(target, thisArg, argArray);
    window.dispatchEvent(new Event('pushstate'));
    scheduleInit();
    return res;
  }
});

history.replaceState = new Proxy(originalReplaceState, {
  apply(target, thisArg, argArray) {
    const res = Reflect.apply(target, thisArg, argArray);
    window.dispatchEvent(new Event('replacestate'));
    scheduleInit();
    return res;
  }
});

// popstate + DOMContentLoaded
window.addEventListener('popstate', scheduleInit);
document.removeEventListener("DOMContentLoaded", initializeSiliconFlow);
document.addEventListener("DOMContentLoaded", initializeSiliconFlow);
