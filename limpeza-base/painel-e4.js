/* Painel de medição E4 — limpeza-visual (A/B base × v5).
 * NÃO faz parte do jogo: é um ficheiro extra, igual nas duas cópias.
 *
 * Método (idêntico nos dois lados): o relógio é performance.now(), que
 * conta desde o início da navegação. O fim é o sinal que o próprio jogo
 * já tem: quando view.ready resolve (modelos carregados), jogo.js arranca
 * a batalha e escreve em #mensagem-txt «É a vez da Ong…». O painel
 * observa esse nó (MutationObserver); ao ver o texto, espera 2×
 * requestAnimationFrame (garante um frame real com a cena completa já
 * desenhada) e carimba o tempo. Mostra um número grande + «MEDIDO»
 * para o Mestre fotografar. */
(function () {
  'use strict';
  var rotulo = /limpeza-v5/.test(location.pathname) ? 'V5'
             : /limpeza-base/.test(location.pathname) ? 'BASE' : '';
  var caixa = null, numEl = null, estadoEl = null, acabado = false;

  function montar() {
    if (caixa || !document.body) return;
    caixa = document.createElement('div');
    caixa.setAttribute('aria-hidden', 'true');
    caixa.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);' +
      'z-index:2147483000;pointer-events:none;background:rgba(10,8,4,.88);' +
      'border:2px solid #d8b25c;border-radius:14px;padding:10px 22px 12px;' +
      'text-align:center;color:#fff;font-family:system-ui,sans-serif;min-width:210px';
    var cab = document.createElement('div');
    cab.textContent = 'ARRANQUE' + (rotulo ? ' · ' + rotulo : '');
    cab.style.cssText = 'font-size:17px;letter-spacing:2px;color:#d8b25c;font-weight:700';
    numEl = document.createElement('div');
    numEl.textContent = '—';
    numEl.style.cssText = 'font-size:56px;line-height:1.05;font-weight:800;font-variant-numeric:tabular-nums';
    estadoEl = document.createElement('div');
    estadoEl.textContent = 'A MEDIR…';
    estadoEl.style.cssText = 'font-size:19px;font-weight:700;letter-spacing:1px';
    caixa.appendChild(cab); caixa.appendChild(numEl); caixa.appendChild(estadoEl);
    document.body.appendChild(caixa);
  }

  function acabar(textoNum, textoEstado, cor) {
    if (acabado) return; acabado = true;
    montar();
    if (!caixa) { // sem body nunca: tenta outra vez já
      setTimeout(function () { acabar(textoNum, textoEstado, cor); }, 50);
      acabado = false; return;
    }
    numEl.textContent = textoNum;
    estadoEl.textContent = textoEstado;
    estadoEl.style.color = cor || '#7ee787';
  }

  function carimbar() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var s = performance.now() / 1000;
        acabar(s.toFixed(2) + ' s', 'MEDIDO');
      });
    });
  }

  function vigiar() {
    var alvo = document.getElementById('mensagem-txt');
    if (!alvo) return false;
    var obs = new MutationObserver(function () {
      var t = alvo.textContent || '';
      if (t.indexOf('É a vez da') !== -1) { obs.disconnect(); carimbar(); }
      else if (t.indexOf('Não foi possível carregar') !== -1) {
        obs.disconnect(); acabar('—', 'ERRO AO CARREGAR', '#ff7b72');
      }
    });
    obs.observe(alvo, { childList: true, subtree: true, characterData: true });
    return true;
  }

  var tMontar = setInterval(function () {
    montar();
    if (caixa) {
      clearInterval(tMontar);
      if (!vigiar()) {
        var tVigia = setInterval(function () { if (vigiar()) clearInterval(tVigia); }, 50);
      }
    }
  }, 30);

  setTimeout(function () { acabar('—', 'SEM SINAL (3 min)', '#ffb454'); }, 180000);
})();
