// Shared behaviour for ACRYL talk decks: copy buttons, the live registry slide, the feature map and the mini drum machine.
// Every part is optional: a deck uses only the elements it contains.
(function () {
  'use strict'

  function copyButtons(root) {
    root.querySelectorAll('[data-copy]').forEach(function (button) {
      button.addEventListener('click', function () {
        var text = button.getAttribute('data-copy')
        var done = function () { button.textContent = 'copied'; setTimeout(function () { button.textContent = 'copy' }, 1400) }
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {})
      })
    })
  }

  function text(value) { return typeof value === 'string' ? value : '' }
  function el(tag, cls, content) { var e = document.createElement(tag); if (cls) e.className = cls; if (content) e.textContent = content; return e }

  // Live registries: both indexes are static JSON with open CORS, read on every showing.
  function liveRegistry(node) {
    var url = node.getAttribute('data-registry')
    var kind = node.getAttribute('data-kind')
    var status = node.querySelector('.live')
    var list = node.querySelector('.reg')
    var count = node.querySelector('[data-count]')
    fetch(url, { headers: { Accept: 'application/json' } }).then(function (r) { return r.json() }).then(function (doc) {
      var entries = Array.isArray(doc.entries) ? doc.entries : []
      if (count) count.textContent = String(entries.length)
      status.classList.add('ok')
      status.lastChild.textContent = ' live from ' + url.replace(/^https:\/\//, '').replace(/\/index\.json$/, '')
      entries.slice(0, 48).forEach(function (entry) {
        var card = el('div', 'card')
        card.appendChild(el('h3', '', text(entry.name) || text(entry.id)))
        var line = kind === 'blends'
          ? (text(entry.category) + (entry.parent ? ' · grew from ' + text(entry.parent) : ''))
          : (text(entry.compatibility) + (entry.version ? ' · v' + text(entry.version) : ''))
        card.appendChild(el('p', '', line))
        list.appendChild(card)
      })
    }).catch(function () {
      status.lastChild.textContent = ' registry unreachable from here'
    })
  }

  // Feature map from the coverage list: one button per area, the built features of the chosen area below.
  function featureMap(node) {
    var areasEl = node.querySelector('.areas')
    var listEl = node.querySelector('.feature-list')
    var totalEl = node.querySelector('[data-total]')
    fetch(node.getAttribute('data-features')).then(function (r) { return r.json() }).then(function (areas) {
      var built = function (item) { return item.built.indexOf('yes') === 0 || item.built.indexOf('partly') === 0 }
      var total = areas.reduce(function (n, a) { return n + a.items.filter(built).length }, 0)
      if (totalEl) totalEl.textContent = String(total)
      var show = function (index) {
        areasEl.querySelectorAll('button').forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === index)) })
        listEl.textContent = ''
        areas[index].items.filter(built).forEach(function (item) {
          var li = el('li', item.built.indexOf('partly') === 0 ? 'partly' : '', item.name.replace(/`/g, ''))
          listEl.appendChild(li)
        })
      }
      areas.forEach(function (area, i) {
        var b = el('button', '', area.title + ' · ' + area.items.filter(built).length)
        b.type = 'button'
        b.addEventListener('click', function () { show(i) })
        areasEl.appendChild(b)
      })
      show(0)
    })
  }

  // A small drum machine like the acryl.music Blueprint, so the room can hear what the agent builds there.
  function sequencer(node) {
    var tracks = [
      { name: 'Kick', steps: [0, 4, 8, 12] },
      { name: 'Snare', steps: [4, 12] },
      { name: 'Clap', steps: [4, 12] },
      { name: 'Hihat', steps: [2, 6, 10, 14] },
    ]
    var grid = node.querySelector('.seq')
    var cells = []
    tracks.forEach(function (track, t) {
      var row = el('div', 'track')
      row.appendChild(el('span', '', track.name))
      cells[t] = []
      for (var s = 0; s < 16; s++) {
        var b = el('button', 'step' + (s % 4 === 0 ? ' beat' : '') + (track.steps.indexOf(s) >= 0 ? ' on' : ''))
        b.type = 'button'
        b.setAttribute('aria-label', track.name + ' step ' + (s + 1))
        b.addEventListener('click', function () { this.classList.toggle('on') })
        row.appendChild(b)
        cells[t][s] = b
      }
      grid.appendChild(row)
    })
    var ctx = null, timer = null, step = 0
    var bpmEl = node.querySelector('[data-bpm]')
    var bpm = 124
    function noise(duration) {
      var buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
      var data = buffer.getChannelData(0)
      for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      var src = ctx.createBufferSource(); src.buffer = buffer; return src
    }
    function play(track, time) {
      var gain = ctx.createGain(); gain.connect(ctx.destination)
      if (track === 0) {
        var osc = ctx.createOscillator(); osc.connect(gain)
        osc.frequency.setValueAtTime(150, time); osc.frequency.exponentialRampToValueAtTime(40, time + 0.15)
        gain.gain.setValueAtTime(1, time); gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3)
        osc.start(time); osc.stop(time + 0.3)
      } else {
        var src = noise(track === 3 ? 0.05 : 0.2)
        var filter = ctx.createBiquadFilter(); filter.type = track === 3 ? 'highpass' : 'bandpass'
        filter.frequency.value = track === 3 ? 7000 : track === 2 ? 1500 : 1000
        src.connect(filter); filter.connect(gain)
        gain.gain.setValueAtTime(track === 3 ? 0.3 : 0.6, time); gain.gain.exponentialRampToValueAtTime(0.001, time + (track === 3 ? 0.05 : 0.2))
        src.start(time)
      }
    }
    function tick() {
      cells.forEach(function (row) { row.forEach(function (c, s) { c.classList.toggle('now', s === step) }) })
      cells.forEach(function (row, t) { if (row[step].classList.contains('on')) play(t, ctx.currentTime) })
      step = (step + 1) % 16
    }
    function start() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
      ctx.resume()
      stop()
      timer = setInterval(tick, 60000 / bpm / 4)
    }
    function stop() { if (timer) clearInterval(timer); timer = null; cells.forEach(function (row) { row.forEach(function (c) { c.classList.remove('now') }) }) }
    node.querySelector('[data-play]').addEventListener('click', start)
    node.querySelector('[data-stop]').addEventListener('click', stop)
    node.querySelectorAll('[data-tempo]').forEach(function (b) {
      b.addEventListener('click', function () { bpm = Number(b.getAttribute('data-tempo')); if (bpmEl) bpmEl.textContent = String(bpm); if (timer) start() })
    })
    node.querySelector('[data-clear]').addEventListener('click', function () { cells.forEach(function (row) { row.forEach(function (c) { c.classList.remove('on') }) }) })
    // Leaving the slide stops the sound.
    if (window.Reveal) window.Reveal.on('slidechanged', stop)
  }

  // Cordis in one interaction: a consumer fiber declares inject ['llm']. It waits (PENDING) while the service is missing, activates when a
  // provider appears, and when the provider leaves it unloads, reverting every effect it registered (LIFO), then waits again.
  function fiberDemo(node) {
    var provider = node.querySelector('[data-provider]')
    var stateEl = node.querySelector('[data-state]')
    var effectsEl = node.querySelector('[data-effects]')
    var logEl = node.querySelector('[data-log]')
    var effects = ['tool  summarize          registered', 'route GET /summary        mounted', 'timer refresh every 60 s  started']
    var hasProvider = false, busy = false
    function setState(s) { stateEl.textContent = s; stateEl.setAttribute('data-s', s) }
    function log(line) { var li = el('li', '', line); logEl.insertBefore(li, logEl.firstChild); while (logEl.children.length > 5) logEl.removeChild(logEl.lastChild) }
    function renderEffects(active) {
      effectsEl.textContent = ''
      effects.forEach(function (e) { var li = el('li', active ? 'on' : '', e); effectsEl.appendChild(li) })
    }
    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms) }) }
    function add() {
      if (hasProvider || busy) return
      busy = true; hasProvider = true
      provider.classList.add('on'); provider.textContent = 'llm service: provided'
      log('provider registers service llm')
      wait(350).then(function () { setState('LOADING'); log('my-tool: inject satisfied, apply(ctx) runs') ; return wait(500) })
        .then(function () { effectsEl.querySelectorAll('li').forEach(function (li, i) { setTimeout(function () { li.classList.add('on') }, i * 220) }); return wait(800) })
        .then(function () { setState('ACTIVE'); log('my-tool: ACTIVE, 3 effects owned'); busy = false })
    }
    function remove() {
      if (!hasProvider || busy) return
      busy = true; hasProvider = false
      log('provider unloads: service llm disappears')
      setState('UNLOADING')
      var items = [].slice.call(effectsEl.querySelectorAll('li')).reverse()
      items.forEach(function (li, i) { setTimeout(function () { li.classList.remove('on'); li.classList.add('reverted') ; log('reverted: ' + li.textContent.replace(/\s+/g, ' ').trim()) }, 300 + i * 300) })
      wait(300 + items.length * 300 + 300).then(function () {
        provider.classList.remove('on'); provider.textContent = 'llm service: missing'
        effectsEl.querySelectorAll('li').forEach(function (li) { li.classList.remove('reverted') })
        setState('PENDING'); log('my-tool: PENDING, waits for llm again, no residue'); busy = false
      })
    }
    renderEffects(false)
    setState('PENDING')
    node.querySelector('[data-add]').addEventListener('click', add)
    node.querySelector('[data-remove]').addEventListener('click', remove)
  }


  // Navigator for the whole talk. Chapters start at slides marked data-chapter; a slide's name is its data-title or its first heading.
  // The strip at the bottom always shows the current chapter; the sidebar (T, or the top-left button) lists every slide to jump to.
  function navigator(R) {
    var slides = [].slice.call(document.querySelectorAll('.reveal .slides > section'))
    var chapters = []
    slides.forEach(function (section, i) {
      var name = section.getAttribute('data-chapter')
      if (name || !chapters.length) chapters.push({ name: name || 'Start', start: i, items: [] })
      var heading = section.querySelector('h1, h2')
      var title = section.getAttribute('data-title') || (heading ? heading.textContent.replace(/\s+/g, ' ').trim() : 'Slide ' + (i + 1))
      chapters[chapters.length - 1].items.push({ index: i, title: title })
    })
    var body = document.body
    var toggle = el('button', 'nav-toggle')
    toggle.type = 'button'
    toggle.setAttribute('aria-label', 'Contents (T)')
    toggle.setAttribute('aria-expanded', 'false')
    toggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    var panel = el('nav', 'nav-panel')
    panel.setAttribute('aria-label', 'Talk contents')
    var strip = el('div', 'nav-strip')
    var head = el('div', 'nav-head', 'Contents')
    head.appendChild(el('span', '', slides.length + ' slides · T'))
    panel.appendChild(head)
    var slideButtons = [], chapterHeads = [], chapterButtons = []
    function go(i) { R.slide(i) }
    chapters.forEach(function (chapter, c) {
      var head = el('h4', '', chapter.name)
      panel.appendChild(head); chapterHeads.push(head)
      var list = el('ol')
      chapter.items.forEach(function (item) {
        var li = el('li'), b = el('button')
        b.type = 'button'
        b.appendChild(el('span', 'n', String(item.index + 1)))
        b.appendChild(el('span', '', item.title))
        b.addEventListener('click', function () { go(item.index); setOpen(false) })
        li.appendChild(b); list.appendChild(li); slideButtons[item.index] = b
      })
      panel.appendChild(list)
      var sb = el('button', '', chapter.name)
      sb.type = 'button'
      sb.addEventListener('click', function () { go(chapter.start) })
      strip.appendChild(sb); chapterButtons.push(sb)
    })
    function setOpen(open) {
      body.classList.toggle('nav-open', open)
      toggle.setAttribute('aria-expanded', String(open))
      if (open) { var cur = panel.querySelector('[aria-current="true"]'); if (cur) cur.scrollIntoView({ block: 'center' }) }
    }
    function chapterOf(i) { for (var c = chapters.length - 1; c >= 0; c--) if (i >= chapters[c].start) return c; return 0 }
    function update() {
      var i = R.getIndices().h, c = chapterOf(i)
      slideButtons.forEach(function (b, k) { b.setAttribute('aria-current', String(k === i)) })
      chapterHeads.forEach(function (h, k) { h.classList.toggle('here', k === c) })
      chapterButtons.forEach(function (b, k) { b.setAttribute('aria-current', String(k === c)); b.classList.toggle('done', k < c) })
    }
    toggle.addEventListener('click', function () { setOpen(!body.classList.contains('nav-open')) })
    R.addKeyBinding({ keyCode: 84, key: 'T', description: 'Contents' }, function () { setOpen(!body.classList.contains('nav-open')) })
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && body.classList.contains('nav-open')) { e.stopPropagation(); setOpen(false) } }, true)
    R.on('slidechanged', update)
    body.appendChild(panel); body.appendChild(toggle); body.appendChild(strip)
    update()
  }

  window.AcrylDeck = {
    init: function () {
      copyButtons(document)
      if (window.Reveal && document.querySelector('.reveal .slides > section')) navigator(window.Reveal)
      document.querySelectorAll('[data-fiber-demo]').forEach(fiberDemo)
      document.querySelectorAll('[data-registry]').forEach(liveRegistry)
      document.querySelectorAll('[data-features]').forEach(featureMap)
      document.querySelectorAll('[data-sequencer]').forEach(sequencer)
    },
  }
})()
