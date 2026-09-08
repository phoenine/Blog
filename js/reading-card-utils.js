'use strict'

(() => {
  const escapeHtml = value => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  const normalizeClassToken = value => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const formatQuoteByPunctuation = value => {
    const text = String(value || '').replace(/\r\n/g, '\n').trim()
    if (!text) return ''
    const sentenceBroken = text
      .replace(/([，。！？；])/g, '$1\n')
      .replace(/([,.!?;])\s+/g, '$1\n')
    return sentenceBroken.replace(/\n{2,}/g, '\n').trim()
  }

  const getFlipFaceHeight = (card, showBack) => {
    const face = card.querySelector(showBack ? '.zhaizhai-face-back' : '.zhaizhai-face-front')
    return face ? face.offsetHeight : 0
  }

  const syncFlipHeight = (card, animate = true) => {
    const height = getFlipFaceHeight(card, card.classList.contains('is-flipped'))
    if (!height) return
    if (!animate) card.classList.remove('is-height-ready')
    card.style.height = `${height}px`
    if (!animate) requestAnimationFrame(() => card.classList.add('is-height-ready'))
  }

  const setFlipState = (card, showBack) => {
    if (card.classList.contains('is-flipped') === showBack) return
    card.style.height = `${Math.ceil(card.getBoundingClientRect().height)}px`
    const nextHeight = getFlipFaceHeight(card, showBack)
    card.classList.toggle('is-flipped', showBack)
    requestAnimationFrame(() => {
      if (nextHeight) card.style.height = `${nextHeight}px`
    })
  }

  window.ReadingCardUtils = {
    escapeHtml,
    normalizeClassToken,
    formatQuoteByPunctuation,
    syncFlipHeight,
    setFlipState
  }
})()
