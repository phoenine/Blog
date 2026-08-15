/* Homepage carousel behavior and category shortcut markup. */
(function () {
  const container = document.querySelector('#swiper_container.blog-slider')
  document.querySelectorAll('#catalog_magnet .magnet_link_context').forEach(context => {
    const source = context.querySelector('span:first-child')
    const match = source && source.textContent.trim().match(/^(.*?)\s*\((\d+)\)$/)
    if (!match) return

    const label = document.createElement('span')
    label.className = 'magnet_label'
    const icon = source.querySelector('i')
    if (icon) label.append(icon)
    label.append(document.createTextNode(match[1].trim()))

    const count = document.createElement('span')
    count.className = 'magnet_count'
    count.textContent = `${match[2]} 篇`
    count.setAttribute('aria-label', `${match[2]} 篇文章`)

    context.replaceChildren(label, count)
  })

  const moreLink = document.querySelector('#catalog_magnet .magnet_link_more')
  if (moreLink) {
    moreLink.textContent = '全部分类'
  }

  if (!container || typeof window.Swiper !== 'function') return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let swiper
  try {
    swiper = new window.Swiper('.blog-slider', {
      passiveListeners: true,
      spaceBetween: 30,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      loop: true,
      autoplay: reducedMotion
        ? false
        : {
            disableOnInteraction: false,
            delay: 6000
          },
      pagination: {
        el: '.blog-slider__pagination',
        clickable: true
      }
    })
  } catch (error) {
    container.dataset.swiperError = error instanceof Error ? error.message : String(error)
    return
  }

  const stopAutoplay = () => {
    if (swiper.autoplay) swiper.autoplay.stop()
  }

  const startAutoplay = () => {
    if (!reducedMotion && swiper.autoplay) swiper.autoplay.start()
  }

  container.addEventListener('mouseenter', stopAutoplay)
  container.addEventListener('mouseleave', startAutoplay)
  container.addEventListener('focusin', stopAutoplay)
  container.addEventListener('focusout', event => {
    if (!container.contains(event.relatedTarget)) startAutoplay()
  })

  container.querySelectorAll('.blog-slider__item').forEach(slide => {
    const title = slide.querySelector('.blog-slider__title')
    const imageLink = slide.querySelector('a.blog-slider__img')
    if (title && imageLink && !imageLink.getAttribute('aria-label')) {
      imageLink.setAttribute('aria-label', title.textContent.trim())
    }
  })
})()
