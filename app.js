'use strict';
/* 試作品（β）ダウンロードページ。
 * 合言葉は全員共通の固定値（強い秘密ではなく、リンクを知らない人を入れないための簡単な仕切りです）。
 * ダウンロードした人の「お名前」だけを、記録用に Google フォームへ送ります（合言葉は送信しません）。
 * 本体ファイルは暗号化していません。少人数の試作テストのための、簡易な仕組みです。 */
(function () {
  const PASSPHRASE = 'ぴよきちノート試作品';
  const ZIP_NAME = 'LectureNotes-Windows-v1.0.0.zip';
  const ZIP_URL = 'https://github.com/piyokiti008/ln-dl-49d83b25/releases/download/v1.0.0/LectureNotes-Windows-v1.0.0.zip';
  const ZIP_SHA256 = 'f7d00079cd018e093a11095034dcbebce08fd5f3e3f44f3f371f89aef495cda7';
  // アプリのアイコン（lecture-notes-desktop/assets/icon.svg と同じもの）。手順の中で「この見た目のアイコンを探してください」と示すために使う
  const APP_ICON_SVG = '<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect width="256" height="256" rx="56" fill="#2f5bea"/><path d="M72 60h84a24 24 0 0 1 24 24v112H96a24 24 0 0 1-24-24V60z" fill="none" stroke="#fff" stroke-width="14" stroke-linejoin="round"/><path d="M104 104h56M104 136h56" stroke="#fff" stroke-width="14" stroke-linecap="round"/><path d="M186 34l7 18 18 7-18 7-7 18-7-18-18-7 18-7z" fill="#ffd54a"/></svg>';
  const LOG_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSdO682vDBtZrcxrjfTzQzJk2t0hqmNqjcgkDb1VEtOc8HXvgQ/formResponse';
  const LOG_ENTRY_USER = 'entry.317872901';

  const norm = (s) => String(s || '').normalize('NFKC').trim();

  const $ = (s) => document.querySelector(s);
  const f = $('#f'), userEl = $('#user'), pwEl = $('#pw'), go = $('#go'), msg = $('#msg'), done = $('#done'), stopped = $('#stopped'), lead = $('#lead');

  function setMsg(text, cls) { msg.textContent = text || ''; msg.className = cls || ''; }

  // 開発者が status.json の active を false にして再公開すると、配布を止められる（キャッシュにより反映まで数分かかることがあります）
  (async () => {
    try {
      const r = await fetch('status.json', { cache: 'no-store' });
      if (!r.ok) return;
      const s = await r.json();
      if (s && s.active === false) {
        f.hidden = true; lead.hidden = true; stopped.hidden = false;
      }
    } catch (e) { /* 確認できない場合は、通常どおり利用できる */ }
  })();

  function logDownload(user) {
    try {
      const body = new URLSearchParams();
      body.set(LOG_ENTRY_USER, user.slice(0, 60));
      fetch(LOG_FORM_ACTION, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
    } catch (e) { /* 記録できなくても、ダウンロードは止めない */ }
  }

  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = norm(userEl.value), pw = norm(pwEl.value);
    if (!user) { setMsg('お名前・呼び方を入力してください。', 'bad'); return; }
    if (pw !== PASSPHRASE) { setMsg('合言葉が違います。教えてもらった合言葉をそのまま入力してください。', 'bad'); return; }

    go.disabled = true;
    setMsg('確認できました。ダウンロードを準備しています…', 'ok');
    logDownload(user);

    done.hidden = false;
    done.innerHTML =
      '<a class="dl" href="' + ZIP_URL + '">' + ZIP_NAME + ' をダウンロード</a>' +
      '<div class="steps-head">' + APP_ICON_SVG + '<span>この後の手順</span></div>' +
      '<ol>' +
      '<li>ダウンロードが終わったら、そのファイルを<b>右クリック</b>して「<b>すべて展開</b>」を選ぶ</li>' +
      '<li>出てきた新しいフォルダを開く</li>' +
      '<li>その中にある、この ' + APP_ICON_SVG.replace('viewBox', 'class="icon-inline" viewBox') + ' マークの「<b>LectureNotes</b>」を<b>ダブルクリック</b>する</li>' +
      '<li>「Windows によって PC が保護されました」と出た場合は、「<b>詳細情報</b>」→「<b>実行</b>」を押す（最初の一回だけです）</li>' +
      '</ol>' +
      '<div class="sha">ファイルの確認用 SHA-256：<br><code>' + ZIP_SHA256 + '</code></div>';
    setMsg('', '');
    f.hidden = true;
  });
})();
