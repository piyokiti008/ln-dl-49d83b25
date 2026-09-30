'use strict';
/* 試作品（β）ダウンロードページ。
 * 合言葉は全員共通の固定値（強い秘密ではなく、リンクを知らない人を入れないための簡単な仕切りです）。
 * ダウンロードした人の「お名前」だけを、記録用に Google フォームへ送ります（合言葉は送信しません）。
 * 本体ファイルは暗号化していません。少人数の試作テストのための、簡易な仕組みです。 */
(function () {
  const PASSPHRASE = 'ぴよきちノート試作品';
  const ZIP_NAME = 'LectureNotes-Windows-v1.0.0.zip';
  const ZIP_URL = 'https://github.com/piyokiti008/ln-dl-49d83b25/releases/download/v1.0.0/LectureNotes-Windows-v1.0.0.zip';
  const ZIP_SHA256 = 'ec4d18bcd367e7156aa1787376c8d43b2c4d7a442acca9e3891bfceac31b3d48';
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
      '<div>展開して <code>LectureNotes.exe</code> を起動してください（初回は「詳細情報」→「実行」）。</div>' +
      '<div style="margin-top:8px">ファイルの確認用 SHA-256：<br><code>' + ZIP_SHA256 + '</code></div>';
    setMsg('', '');
    f.hidden = true;
  });
})();
