document.addEventListener('DOMContentLoaded', () => {
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselWrapper = document.getElementById('carouselWrapper');
    const statusBar = document.getElementById('statusBar');
    
    // 初始化 7 張預設圖卡內容
    const defaultContents = [
      { title: "設計師絕對不想告訴你的<br>五個高效排版秘訣", subtitle: "✦ 排版心法", body: "這篇輪播將會教你如何使用<br>極簡元素，打造高級設計感。" },
      { title: "不要填滿空間", subtitle: "✦ 秘訣一", body: "留白（White Space）是<br>設計呼吸的空間。<br><br>越滿的畫面，通常<br>給人的廉價感越重。" },
      { title: "對齊產生秩序", subtitle: "✦ 秘訣二", body: "無論你選擇靠左、置中或<br>靠右，都請貫徹到底。<br><br>隨意的對齊會破壞視覺線。" },
      { title: "限制色彩數量", subtitle: "✦ 秘訣三", body: "一個好的版面，主色不應<br>超過兩種。善用同色系的<br>深淺變化來創造層次感。" },
      { title: "層級分明的字體", subtitle: "✦ 秘訣四", body: "標題必須極大且顯眼！<br>內文則需要顧及易讀性。<br>大小對比，才能產生張力。" },
      { title: "其實，排版不難", subtitle: "✦ 核心洞見", body: "少即是多。<br>當你學會刪減多餘的裝飾，<br>內容本身的價值就會浮現。" },
      { title: "想要這套字體與色票？", subtitle: "✦ 準備好升級了嗎", body: "留言「專屬」<br>我把這整套設計原檔<br>免費私訊發給你！" }
    ];
  
    // 讓文字區塊同時支援「單擊拖曳」與「雙擊編輯」
    function enableDragAndEdit(el, slide) {
      let dragging = false;
      let moved = false;
      let startX, startY, elStartLeft, elStartTop;

      el.addEventListener('mousedown', (e) => {
        if (el.getAttribute('contenteditable') === 'true') return;
        e.stopPropagation();
        e.preventDefault();

        if (getComputedStyle(el).position !== 'absolute') {
          const r = el.getBoundingClientRect();
          const sr = slide.getBoundingClientRect();
          el.style.width = r.width + 'px';
          el.style.position = 'absolute';
          el.style.left = (r.left - sr.left) + 'px';
          el.style.top  = (r.top  - sr.top)  + 'px';
          el.style.margin = '0';
        }

        dragging = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        elStartLeft = parseFloat(el.style.left) || 0;
        elStartTop  = parseFloat(el.style.top)  || 0;
      });

      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
          moved = true;
          setStatus('拖曳中… 放開滑鼠即可固定位置（雙擊文字可進入打字模式）');
        }
        const sr = slide.getBoundingClientRect();
        const maxLeft = sr.width  - el.offsetWidth;
        const maxTop  = sr.height - el.offsetHeight;
        const newLeft = Math.max(0, Math.min(maxLeft, elStartLeft + dx));
        const newTop  = Math.max(0, Math.min(maxTop,  elStartTop  + dy));
        el.style.left = newLeft + 'px';
        el.style.top  = newTop  + 'px';
      });

      document.addEventListener('mouseup', () => {
        if (dragging && moved) {
          setStatus('位置已固定。雙擊文字可打字編輯。');
        }
        dragging = false;
      });

      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        el.setAttribute('contenteditable', 'true');
        el.focus();
        const sel = window.getSelection();
        sel.removeAllRanges();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.addRange(range);
      });

      el.addEventListener('blur', () => {
        el.setAttribute('contenteditable', 'false');
      });
    }

    // 渲染圖卡
    defaultContents.forEach((data, i) => {
      let page = i + 1;
      let dots = '';
      for(let d=1; d<=7; d++) {
          dots += `<div class="dot ${d===page?'active':''}"></div>`;
      }
      
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.id = `slide-${page}`;
      slide.innerHTML = `
        <div class="brand-tag draggable-text" contenteditable="false">@yourbrand</div>
        <div class="slide-subtitle draggable-text" contenteditable="false">${data.subtitle}</div>
        <div class="slide-title draggable-text" contenteditable="false" style="font-size: ${page===1 ? '38px':'32px'}">${data.title}</div>
        <div class="slide-body draggable-text" contenteditable="false">${data.body}</div>
        <div class="slide-footer">${dots}</div>
      `;
      carouselTrack.appendChild(slide);

      slide.querySelectorAll('.draggable-text').forEach(textEl => {
        enableDragAndEdit(textEl, slide);
      });
    });
  
    // ----------------------------------------
    // 【1. 拖曳與滾動核心邏輯 (Drag to scroll)】
    // ----------------------------------------
    let isDown = false;
    let startX;
    let scrollLeft;
  
    carouselWrapper.addEventListener('mousedown', (e) => {
      // 若點擊的是 contenteditable，我們不啟動拖曳，這樣他們才能選字
      if (e.target.getAttribute('contenteditable') === 'true') return;
      isDown = true;
      startX = e.pageX - carouselWrapper.offsetLeft;
      scrollLeft = carouselWrapper.scrollLeft;
    });
    
    carouselWrapper.addEventListener('mouseleave', () => {
      isDown = false;
    });
    
    carouselWrapper.addEventListener('mouseup', () => {
      isDown = false;
    });
    
    carouselWrapper.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carouselWrapper.offsetLeft;
      const walk = (x - startX) * 2; // 調整拖曳速度
      carouselWrapper.scrollLeft = scrollLeft - walk;
    });
  
    // 鍵盤左右鍵切換
    document.addEventListener('keydown', (e) => {
      // 避免在打字時觸發切換
      if (document.activeElement.getAttribute('contenteditable') === 'true') return;
      if (e.key === 'ArrowRight') {
        carouselWrapper.scrollBy({ left: 430, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        carouselWrapper.scrollBy({ left: -430, behavior: 'smooth' });
      }
    });
  
  
    // ----------------------------------------
    // 【2. 文字/區塊樣式編輯核心邏輯】
    // ----------------------------------------
    let stashedRange = null;
    let activeBlock = null;
    const colorPicker = document.getElementById('customColorPicker');
    const colorHex = document.getElementById('customColorHex');
    const btnApplyColor = document.getElementById('btnApplyColor');
    const fontSizeInput = document.getElementById('fontSizeInput');
    
    function setStatus(msg) {
        statusBar.innerHTML = msg;
    }
  
    // 同步色碼
    colorPicker.addEventListener('input', (e) => { colorHex.value = e.target.value.toUpperCase(); });
    colorHex.addEventListener('input', (e) => { colorPicker.value = e.target.value; });
  
    // 追蹤 activeBlock
    document.addEventListener('focusin', (e) => {
      if (e.target.getAttribute('contenteditable') === 'true') {
        activeBlock = e.target;
        setStatus('區塊已選取：現在可以更改字體大小與區塊顏色');
        
        // 解析當前字體大小
        const pxMatch = window.getComputedStyle(activeBlock).fontSize;
        if(pxMatch) fontSizeInput.value = parseInt(pxMatch);
      }
    });
  
    // 追蹤選取文字 (關鍵修正)
    document.addEventListener('selectionchange', () => {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      
      // 確保我們是在編輯區內選取
      let container = range.commonAncestorContainer;
      container = container.nodeType === 3 ? container.parentNode : container; // 若是 text node 就找父層
      
      if (container.closest('.slide')) {
         stashedRange = range.cloneRange();
         if(sel.toString().trim().length > 0) {
            setStatus(`已選取文字："${sel.toString()}"`);
         }
      }
    });
  
    // 套用顏色
    function applyColor(color) {
      const mode = document.querySelector('input[name="colorMode"]:checked').value;
      if (mode === 'selection' && stashedRange) {
        // 選取模式
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(stashedRange);
        
        // 執行替換
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('foreColor', false, color);
        
        sel.removeAllRanges();
        setStatus(`已將選取文字變更為 <span style="color:${color};font-weight:bold;">${color}</span>`);
      } else if (mode === 'block' && activeBlock) {
        // 區塊模式
        activeBlock.style.color = color;
        setStatus(`已將整個區塊顏色變更為 <span style="color:${color};font-weight:bold;">${color}</span>`);
      } else {
        setStatus('⚠️ 請先點擊右方文字區，或反白選取要變色的文字。');
      }
    }
  
    // UI 點擊事件：避免 blur 流失選取範圍
    document.querySelectorAll('.sidebar button, .swatch, input[type="radio"]').forEach(el => {
      el.addEventListener('mousedown', e => { e.preventDefault(); });
    });
  
    // 綁定色票
    document.querySelectorAll('.swatch').forEach(sw => {
      sw.addEventListener('click', (e) => {
        const c = e.target.getAttribute('data-color');
        colorPicker.value = c;
        colorHex.value = c;
        applyColor(c);
      });
    });
    btnApplyColor.addEventListener('click', () => applyColor(colorHex.value));
  
    // 套用字體大小
    function applyFontSize(size) {
      if(!activeBlock) {
          setStatus('⚠️ 請先點擊右方的要調整的文字內容。');
          return;
      }
      activeBlock.style.fontSize = `${size}px`;
      fontSizeInput.value = size;
      setStatus(`字體已調整為 ${size}px`);
    }
    document.getElementById('btnApplySize').addEventListener('click', () => applyFontSize(fontSizeInput.value));
    
    function adjustSize(delta) {
        if(!activeBlock) return;
        const current = parseInt(window.getComputedStyle(activeBlock).fontSize) || 16;
        applyFontSize(current + delta);
    }
    document.getElementById('btnSizeM2').addEventListener('click', () => adjustSize(-2));
    document.getElementById('btnSizeM1').addEventListener('click', () => adjustSize(-1));
    document.getElementById('btnSizeP1').addEventListener('click', () => adjustSize(1));
    document.getElementById('btnSizeP2').addEventListener('click', () => adjustSize(2));
  
  
    // ----------------------------------------
    // 【3. 匯出邏輯】
    // ----------------------------------------
    // 產生下方第 1 ~ 7 張下載按鈕
    const singleDlGrid = document.getElementById('singleDlGrid');
    for(let i=1; i<=7; i++) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-micro';
        btn.innerText = `第 ${i} 張`;
        btn.addEventListener('click', () => downloadCard(i));
        singleDlGrid.appendChild(btn);
    }
  
    const btnDlAll = document.getElementById('btnDownloadAll');
  
    async function getCanvasForSlide(pageNum) {
        const card = document.getElementById(`slide-${pageNum}`);
        if(!card) return null;
        // 把 contenteditable 框線處理掉
        card.querySelectorAll('[contenteditable]').forEach(el => el.style.outline = 'none');
        
        const canvas = await html2canvas(card, {
            scale: 3, // 高畫質匯出
            useCORS: true,
            backgroundColor: '#F7F5F0'
        });
        return canvas;
    }

    // 模仿 CSS object-fit: cover 的繪製方式
    function drawVideoCover(ctx, video, cw, ch) {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (!vw || !vh) return;
        const videoRatio = vw / vh;
        const canvasRatio = cw / ch;
        let sx, sy, sw, sh;
        if (videoRatio > canvasRatio) {
            sh = vh;
            sw = vh * canvasRatio;
            sx = (vw - sw) / 2;
            sy = 0;
        } else {
            sw = vw;
            sh = vw / canvasRatio;
            sx = 0;
            sy = (vh - sh) / 2;
        }
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);
    }

    function pickSupportedMimeType() {
        const candidates = [
            'video/mp4;codecs=h264,aac',
            'video/mp4;codecs=avc1,mp4a',
            'video/mp4',
            'video/webm;codecs=h264,opus',
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm'
        ];
        for (const t of candidates) {
            if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
                return t;
            }
        }
        return null;
    }

    async function exportVideoSlide(pageNum) {
        const slide = document.getElementById(`slide-${pageNum}`);
        const media = slideMedia[pageNum];
        if (!slide || !media || media.type !== 'video') {
            throw new Error('該卡片不是影片類型');
        }
        if (typeof MediaRecorder === 'undefined') {
            throw new Error('此瀏覽器不支援影片錄製 (MediaRecorder)。建議改用最新版 Chrome 或 Safari。');
        }
        const mimeType = pickSupportedMimeType();
        if (!mimeType) {
            throw new Error('找不到可用的影片編碼格式。');
        }
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';

        const video = media.videoEl;

        // 確保影片可讀
        if (video.readyState < 2) {
            await new Promise(resolve => {
                video.addEventListener('loadeddata', resolve, { once: true });
            });
        }

        // 1. 暫時藏影片 + 清掉卡片底色，截一張只含文字/遮罩的透明 overlay
        const editableEls = slide.querySelectorAll('[contenteditable]');
        editableEls.forEach(el => el.style.outline = 'none');
        const originalVisibility = video.style.visibility;
        const originalBg = slide.style.backgroundColor;
        video.style.visibility = 'hidden';
        slide.style.backgroundColor = 'transparent';
        let overlayCanvas;
        try {
            overlayCanvas = await html2canvas(slide, {
                backgroundColor: null,
                scale: 2,
                useCORS: true
            });
        } finally {
            slide.style.backgroundColor = originalBg;
            video.style.visibility = originalVisibility;
        }

        // 2. 合成 canvas
        const canvas = document.createElement('canvas');
        canvas.width = overlayCanvas.width;
        canvas.height = overlayCanvas.height;
        const ctx = canvas.getContext('2d');

        // 3. 準備串流與 MediaRecorder
        const canvasStream = canvas.captureStream(30);
        if (typeof video.captureStream === 'function') {
            try {
                const vStream = video.captureStream();
                vStream.getAudioTracks().forEach(t => canvasStream.addTrack(t));
            } catch (_) {}
        }
        const recorder = new MediaRecorder(canvasStream, {
            mimeType,
            videoBitsPerSecond: 4_000_000
        });
        const chunks = [];
        recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };

        // 4. 影片歸零、開始錄
        video.pause();
        video.currentTime = 0;
        await new Promise(resolve => {
            video.addEventListener('seeked', resolve, { once: true });
            setTimeout(resolve, 1000);
        });
        recorder.start(250);
        await video.play();

        // 5. 每幀合成
        let rafId;
        const drawFrame = () => {
            drawVideoCover(ctx, video, canvas.width, canvas.height);
            ctx.drawImage(overlayCanvas, 0, 0);
            rafId = requestAnimationFrame(drawFrame);
        };
        drawFrame();

        // 6. 進度顯示
        const progressTimer = setInterval(() => {
            if (video.duration && isFinite(video.duration)) {
                const pct = Math.min(100, Math.round((video.currentTime / video.duration) * 100));
                setStatus(`🎬 第 ${pageNum} 張影片合成中… ${pct}%（請勿關閉分頁）`);
            }
        }, 400);

        // 7. 等影片播完（附安全超時：最長播 duration + 5 秒）
        const safetyMs = ((video.duration && isFinite(video.duration)) ? video.duration * 1000 : 60000) + 5000;
        await new Promise(resolve => {
            let done = false;
            const finish = () => { if (!done) { done = true; resolve(); } };
            video.addEventListener('ended', finish, { once: true });
            setTimeout(finish, safetyMs);
        });

        cancelAnimationFrame(rafId);
        clearInterval(progressTimer);

        // 8. 停錄並等 stop 事件收尾
        if (recorder.state !== 'inactive') recorder.stop();
        await new Promise(resolve => {
            recorder.addEventListener('stop', resolve, { once: true });
            setTimeout(resolve, 3000);
        });

        // 9. 收尾：影片回到第一幀方便繼續編輯
        try {
            video.pause();
            video.currentTime = 0.01;
        } catch (_) {}

        return {
            blob: new Blob(chunks, { type: mimeType }),
            ext,
            mimeType
        };
    }

    async function downloadCard(pageNum) {
        const media = slideMedia[pageNum];
        if (media && media.type === 'video') {
            setStatus(`🎬 第 ${pageNum} 張影片匯出中…（請勿關閉分頁）`);
            try {
                const { blob, ext } = await exportVideoSlide(pageNum);
                const link = document.createElement('a');
                link.download = `IG_Slide_0${pageNum}.${ext}`;
                link.href = URL.createObjectURL(blob);
                link.click();
                setTimeout(() => URL.revokeObjectURL(link.href), 5000);
                setStatus(`✅ 第 ${pageNum} 張影片下載完成（${ext.toUpperCase()}）！`);
            } catch (err) {
                console.error(err);
                setStatus(`⚠️ 第 ${pageNum} 張影片匯出失敗：${err.message}`);
            }
            return;
        }
        setStatus(`正在處理第 ${pageNum} 張高畫質圖片...`);
        const canvas = await getCanvasForSlide(pageNum);
        if(!canvas) return;
        const link = document.createElement('a');
        link.download = `IG_Slide_0${pageNum}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setStatus(`第 ${pageNum} 張下載完成！`);
    }
  
    btnDlAll.addEventListener('click', async () => {
        btnDlAll.disabled = true;
        btnDlAll.innerText = '打包處理中... 速度較慢請稍候';
        
        try {
            const zip = new JSZip();
            for(let i=1; i<=7; i++) {
                const media = slideMedia[i];
                if (media && media.type === 'video') {
                    setStatus(`🎬 正在合成第 ${i}/7 張影片（影片比圖片慢很多，請耐心等待）...`);
                    try {
                        const { blob, ext } = await exportVideoSlide(i);
                        const arrayBuffer = await blob.arrayBuffer();
                        zip.file(`IG_Slide_0${i}.${ext}`, arrayBuffer);
                    } catch (err) {
                        console.error(`第 ${i} 張影片匯出失敗：`, err);
                        setStatus(`⚠️ 第 ${i} 張影片匯出失敗，已跳過。繼續處理下一張...`);
                    }
                } else {
                    setStatus(`正在渲染第 ${i}/7 張高畫質圖片...`);
                    const canvas = await getCanvasForSlide(i);
                    if(canvas) {
                       const imgData = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, "");
                       zip.file(`IG_Slide_0${i}.png`, imgData, {base64: true});
                    }
                }
                // 加入小延遲避免卡死
                await new Promise(res => setTimeout(res, 300));
            }
            setStatus('正在建立壓縮檔案...');
            const content = await zip.generateAsync({type: 'blob'});
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(content);
            downloadLink.download = `IG_Carousel_All.zip`;
            downloadLink.click();
            setStatus('✅ 全集下載完成！');
        } catch (err) {
            console.error(err);
            setStatus('⚠️ 下載過程中發生錯誤。');
        } finally {
            btnDlAll.disabled = false;
            btnDlAll.innerText = '全部一次下載 (ZIP)';
        }
    });

    // ----------------------------------------
    // 【4. 背景圖片與遮罩設定】
    // ----------------------------------------
    const bgUploadGrid = document.getElementById('bgUploadGrid');
    const overlayRadios = document.getElementsByName('bgOverlay');
    const overlayOpacity = document.getElementById('overlayOpacity');
    const opacityVal = document.getElementById('opacityVal');

    // 每張卡片的媒體狀態：{ [page]: { type: 'image'|'video', videoEl?, objectUrl?, file? } }
    const slideMedia = {};

    function setSlideBackground(page, file) {
        const slide = document.getElementById(`slide-${page}`);
        if (!slide) return;

        // 先清掉前一次的媒體（避免圖/影疊著）
        removeSlideMedia(page, { keepInputValue: true });

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                slide.style.backgroundImage = `url(${ev.target.result})`;
                slideMedia[page] = { type: 'image' };
                setStatus(`✅ 第 ${page} 張背景相片已替換！`);
            };
            reader.readAsDataURL(file);
            return;
        }

        if (file.type.startsWith('video/')) {
            const objectUrl = URL.createObjectURL(file);
            const videoEl = document.createElement('video');
            videoEl.className = 'slide-bg-video';
            videoEl.muted = true;
            videoEl.playsInline = true;
            videoEl.preload = 'auto';
            videoEl.src = objectUrl;
            videoEl.addEventListener('loadedmetadata', () => {
                try { videoEl.currentTime = 0.01; } catch (_) {}
            });
            slide.style.backgroundImage = '';
            slide.insertBefore(videoEl, slide.firstChild);
            slideMedia[page] = { type: 'video', videoEl, objectUrl, file };
            setStatus(`✅ 第 ${page} 張已改為影片底圖（網頁上靜態顯示，匯出時輸出 MP4）。`);
            return;
        }

        setStatus(`⚠️ 第 ${page} 張：不支援的檔案格式。請使用圖片或 MP4。`);
    }

    function removeSlideMedia(page, opts = {}) {
        const slide = document.getElementById(`slide-${page}`);
        if (!slide) return;
        slide.style.backgroundImage = '';
        const existing = slideMedia[page];
        if (existing && existing.type === 'video' && existing.videoEl) {
            existing.videoEl.remove();
            if (existing.objectUrl) URL.revokeObjectURL(existing.objectUrl);
        }
        delete slideMedia[page];
        if (!opts.keepInputValue) {
            const fileInput = document.getElementById(`bgFileInput-${page}`);
            if (fileInput) fileInput.value = '';
        }
    }

    function clearSlideBackground(page) {
        removeSlideMedia(page);
        setStatus(`🗑️ 第 ${page} 張背景已清除。`);
    }

    if (bgUploadGrid) {
        for (let p = 1; p <= 7; p++) {
            const row = document.createElement('div');
            row.className = 'bg-upload-row';

            const label = document.createElement('span');
            label.className = 'bg-upload-label';
            label.textContent = `第 ${p} 張`;

            const uploadBtn = document.createElement('label');
            uploadBtn.className = 'btn-micro bg-upload-btn';
            uploadBtn.setAttribute('for', `bgFileInput-${p}`);
            uploadBtn.textContent = '上傳';

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = `bgFileInput-${p}`;
            fileInput.accept = 'image/*,video/mp4,video/*';
            fileInput.className = 'bg-upload-input';
            fileInput.dataset.page = String(p);

            const clearBtn = document.createElement('button');
            clearBtn.className = 'btn-micro bg-clear-btn';
            clearBtn.dataset.page = String(p);
            clearBtn.title = `清除第 ${p} 張背景`;
            clearBtn.textContent = '✕';

            row.appendChild(label);
            row.appendChild(uploadBtn);
            row.appendChild(fileInput);
            row.appendChild(clearBtn);
            bgUploadGrid.appendChild(row);
        }

        bgUploadGrid.addEventListener('change', (e) => {
            if (e.target.classList.contains('bg-upload-input')) {
                const page = parseInt(e.target.dataset.page, 10);
                const file = e.target.files[0];
                if (file) setSlideBackground(page, file);
            }
        });

        bgUploadGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('bg-clear-btn')) {
                const page = parseInt(e.target.dataset.page, 10);
                clearSlideBackground(page);
            }
        });
    }

    function updateOverlay() {
        const mode = document.querySelector('input[name="bgOverlay"]:checked').value;
        const alpha = overlayOpacity.value;
        if(opacityVal) opacityVal.innerText = `${Math.round(alpha * 100)}%`;
        
        let color = 'rgba(255,255,255,0)';
        if(mode === 'light') color = `rgba(247, 245, 240, ${alpha})`;
        if(mode === 'dark') color = `rgba(30, 30, 30, ${alpha})`;
        
        document.documentElement.style.setProperty('--overlay-color', color);
    }

    if(overlayRadios.length > 0) {
        overlayRadios.forEach(r => r.addEventListener('change', updateOverlay));
        overlayOpacity.addEventListener('input', updateOverlay);
        updateOverlay(); // 初始化套用
    }

  });
