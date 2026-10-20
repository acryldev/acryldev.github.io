// acryl.dev merch shop: orders go to our own PocketBase in Vienna; the CityCopy order app (an ACRYL Blend) picks them up,
// sends the print order to CityCopy 1190 once paid, and invites the customer to pick the shirt up there.
window.AcrylShop = (function () {
  'use strict'
  var DB = 'https://acryl-events.5oyoufxtiwypemsxvsca58rs.213.47.80.26.sslip.io'
  var ORDERS = DB + '/api/collections/merch_orders/records'
  var PAY = {
    name: 'WebBoxes s.r.o.',
    iban: 'CZ5620100000002901557462',
    ibanShown: 'CZ56 2010 0000 0029 0155 7462',
    bic: 'FIOBCZPPXXX',
    account: '2901557462',
    wise: 'https://wise.com/pay/r/zzcUoVc1JGKUHus',
    paypal: 'webboxes.com@gmail.com',
  }
  var DESIGNS = { qr: 'Logo and QR', huge: 'Huge logo' }
  var PICKUP = { name: 'CityCopy Filiale 1190', address: 'Billrothstraße 21, 1190 Wien', web: 'https://citycopy.wien' }

  function euros(cents) { return (cents / 100).toFixed(2).replace('.', ',') + ' €' }
  function label(o) { return DESIGNS[o.design] + ', ' + (o.color === 'black' ? 'black shirt' : 'white shirt') + ', size ' + o.size }

  /** The SEPA payment QR (EPC 069-12, "GiroCode") most European banking apps scan: payee, IBAN, amount, and the order number as reference. */
  function epcPayload(order) {
    return ['BCD', '002', '1', 'SCT', PAY.bic, PAY.name, PAY.iban, 'EUR' + (order.amountCents / 100).toFixed(2), '', '',
      order.orderNo + ' ACRYL T-shirt'].join('\n')
  }
  function paypalUrl(order) {
    var q = new URLSearchParams({ cmd: '_xclick', business: PAY.paypal, item_name: 'ACRYL T-shirt ' + order.orderNo, amount: (order.amountCents / 100).toFixed(2),
      currency_code: 'EUR', invoice: order.orderNo, no_shipping: '1' })
    return 'https://www.paypal.com/cgi-bin/webscr?' + q.toString()
  }
  function create(fields) {
    return fetch(ORDERS, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(fields) })
      .then(function (r) {
        return r.json().catch(function () { return {} }).then(function (body) {
          if (r.ok) return body
          var f = body && body.data ? body.data : {}
          if (f.email) throw new Error('That email address does not look right.')
          if (r.status === 429) throw new Error('Too many orders in a minute. Please wait a moment.')
          throw new Error('The order did not go through. Please try again, or write to office@web-boxes.com.')
        })
      })
  }
  function load(id) {
    return fetch(ORDERS + '/' + encodeURIComponent(id)).then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json() })
  }
  return { DB: DB, PAY: PAY, PICKUP: PICKUP, DESIGNS: DESIGNS, euros: euros, label: label, epcPayload: epcPayload, paypalUrl: paypalUrl, create: create, load: load }
})()
