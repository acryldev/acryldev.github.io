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

  window.AcrylDeck = {
    init: function () {
      copyButtons(document)
      document.querySelectorAll('[data-registry]').forEach(liveRegistry)
      document.querySelectorAll('[data-features]').forEach(featureMap)
      document.querySelectorAll('[data-sequencer]').forEach(sequencer)
    },
  }
})()
