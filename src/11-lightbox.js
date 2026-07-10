!(function () {
  "use strict";
  var EASE_OVERLAY = "cubic-bezier(0.33,0,0.67,1)";
  var EASE_CONTENT = "cubic-bezier(0.25,0.1,0.25,1)";
  var CONTENT_DELAY = 700;
  var CLOSE_DELAY = 700;
  var OPEN_DELAY = 1000;
  var ZOOM_SCALE = 1.6;
  var AUTOPLAY_DUR = 5;
  var SWIPE_THRESHOLD = 50;
  var MOBILE_BREAKPOINT = 767;
  var TRANSPARENT_GIF =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  var LENIS_OPTS = {
    duration: 2,
    easing: function (t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    },
    smoothWheel: true,
    smoothTouch: false,
  };

  var overlay = document.querySelector(".popup-overlay");
  if (!overlay) return;

  var closeBtn = overlay.querySelector(".close-svg");
  var galleryWrapper = overlay.querySelector(".product--gallery-wrapper");
  var galleryImg1 = overlay.querySelector(".gallery-image-1");
  var galleryImg2 = overlay.querySelector(".gallery-image-2");
  var descriptionText = overlay.querySelector(
    ".popup--content-right .small-text",
  );
  var gallerySlide = overlay.querySelector(".gallery-slide");
  var slideLines = overlay.querySelectorAll(".slide-line");
  var caretLeft = overlay.querySelector(".popup-caret.left");
  var caretRight = overlay.querySelector(".popup-caret.right");
  var productContent = overlay.querySelector(".lightbox-content");
  var newsContent = overlay.querySelector(".news--lightbox-content");
  var newsTitle = overlay.querySelector(
    ".news--lightbox-content .heading-small",
  );
  var newsDate = overlay.querySelector(".news--content-left .small-text");
  var newsImage = overlay.querySelector(".news--info-image");
  var newsInfoWrapper = overlay.querySelector(".news--info-wrapper");
  var newsBody = newsInfoWrapper?.querySelector(".small-text");
  var popupIngredientImg = (function () {
    var el = overlay.querySelector('[data-popup="ingredient-image"]');
    if (el) el.removeAttribute("loading");
    return el;
  })();
  var popupName = overlay.querySelector('[data-popup="perfume-name"]');
  var popupFragrance = overlay.querySelector('[data-popup="fragrance-type"]');
  var popupTopNote = overlay.querySelector('[data-popup="top-note"]');
  var popupMiddleNote = overlay.querySelector('[data-popup="middle-note"]');
  var popupLastNote = overlay.querySelector('[data-popup="last-note"]');
  var popupDescription = overlay.querySelector(
    '[data-popup="full-description"]',
  );
  var popupSku = overlay.querySelector('[data-popup="sku"]');
  var popupSize = overlay.querySelector('[data-popup="size"]');
  var productWrappers = document.querySelectorAll(".product-wrapper");
  var newsRows = document.querySelectorAll(".news-row");

  var mode = null;
  var productIndex = 0;
  var slideIndex = 0;
  var transitioning = false;
  var sliding = false;
  var switching = false;
  var autoplayTween = null;
  var lenisInstance = null;
  var lenisRaf = null;
  var transitionId = 0;
  var imageCache = new Map();

  var VERTEX_SHADER =
    "precision mediump float;attribute vec3 position;attribute vec2 texcoord;uniform mat4 uMatrix;uniform mat4 uTmatrix;uniform float uTime;uniform vec2 uOffset;uniform float uPower;varying vec2 vTexcoord;void main(){vec3 pos=position.xzy;float dist=distance(uOffset,vec2(pos.x,pos.y));float rippleEffect=cos(15.0*(dist-(uTime/60.0)));float distortionEffect=rippleEffect*uPower;pos.x+=(distortionEffect/30.0*(uOffset.x-pos.x));pos.y+=distortionEffect/30.0*(uOffset.y-pos.y);gl_Position=uMatrix*vec4(pos,1.0);vTexcoord=(uTmatrix*vec4(texcoord-vec2(.5),0,1)).xy+vec2(.5);}";
  var FRAGMENT_SHADER =
    "precision mediump float;uniform sampler2D uTexOne;uniform sampler2D uTexTwo;uniform float uWipeProgress;varying vec2 vTexcoord;void main(){vec2 uv=vTexcoord;vec4 texOne=texture2D(uTexOne,uv);vec4 texTwo=texture2D(uTexTwo,uv);gl_FragColor=mix(texOne,texTwo,uWipeProgress);}";

  var webglReady = false;
  var webglCanvas = null;
  var gl = null;
  var programInfo = null;
  var bufferInfo = null;
  var renderRaf = null;
  var rendering = false;

  var webglState = {
    power: 0,
    wipeProgress: 0,
    time: 0,
    offset: [0, 0],
    textures: { current: null, next: null },
    textureInfos: {
      current: { width: 1, height: 1 },
      next: { width: 1, height: 1 },
    },
    pendingNextSrc: null,
    pendingNextAlt: null,
    preloadedNextImage: null,
  };

  function lenisLoop(time) {
    lenisInstance &&
      (lenisInstance.raf(time), (lenisRaf = requestAnimationFrame(lenisLoop)));
  }

  function createPopupLenis(wrapper) {
    lenisRaf && cancelAnimationFrame(lenisRaf);
    lenisInstance && lenisInstance.destroy();
    if (typeof Lenis === "undefined") return;
    wrapper.scrollTop = 0;
    lenisInstance = new Lenis(
      Object.assign(
        { wrapper: wrapper, content: wrapper.children[0] },
        LENIS_OPTS,
      ),
    );
    window.popupLenis = lenisInstance;
    lenisRaf = requestAnimationFrame(lenisLoop);
  }

  function destroyPopupLenis() {
    lenisRaf && (cancelAnimationFrame(lenisRaf), (lenisRaf = null));
    lenisInstance && (lenisInstance.destroy(), (lenisInstance = null));
  }

  function blockScroll(ev) {
    if (mode === "news") {
      var node = ev.target;
      while (node && node !== document) {
        if (node === newsContent) return;
        node = node.parentNode;
      }
    }
    if (mode === "product") {
      var node = ev.target;
      while (node && node !== document) {
        if (node.classList && node.classList.contains("popup--content-right"))
          return;
        node = node.parentNode;
      }
    }
    ev.preventDefault();
    ev.stopPropagation();
  }

  function coverFitToCanvas(img) {
    twgl.resizeCanvasToDisplaySize(webglCanvas);
    var refW = webglCanvas.width;
    var refH = webglCanvas.height;
    var offscreen = document.createElement("canvas");
    offscreen.width = refW;
    offscreen.height = refH;
    var ctx = offscreen.getContext("2d");
    var scale = Math.max(refW / img.width, refH / img.height);
    var dw = img.width * scale;
    var dh = img.height * scale;
    ctx.drawImage(img, (refW - dw) / 2, (refH - dh) / 2, dw, dh);
    return offscreen;
  }

  function createTexture(src, callback, storePreload) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      var fitted = coverFitToCanvas(img);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        fitted,
      );
      if (storePreload) webglState.preloadedNextImage = img;
      callback({ texture: tex, width: fitted.width, height: fitted.height });
    };
    img.onerror = () => callback({ texture: tex, width: 1, height: 1 });
    img.src = src;
    return tex;
  }

  function renderWebGL() {
    if (!gl || !webglCanvas) return;
    twgl.resizeCanvasToDisplaySize(webglCanvas);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!webglState.textures.current || !webglState.textures.next) return;
    var m4 = twgl.m4;
    var projection = m4.identity();
    var texMatrix = m4.identity();
    var canvasAspect =
      webglCanvas.width / ZOOM_SCALE / (webglCanvas.height / ZOOM_SCALE);
    var texInfo = webglState.textureInfos.current;
    var texAspect = texInfo.width / texInfo.height;
    var sx = 1,
      sy = 1;
    canvasAspect > texAspect
      ? (sy = texAspect / canvasAspect)
      : (sx = canvasAspect / texAspect);
    sx *= ZOOM_SCALE;
    sy *= ZOOM_SCALE;
    m4.scale(texMatrix, [sx, sy, 1], texMatrix);
    webglState.time++;
    m4.ortho(0, webglCanvas.width, webglCanvas.height, 0, -1, 1, projection);
    m4.translate(
      projection,
      [webglCanvas.width / 2, webglCanvas.height / 2, 1],
      projection,
    );
    m4.scale(
      projection,
      [webglCanvas.width, webglCanvas.height, 1],
      projection,
    );
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, {
      uMatrix: projection,
      uTmatrix: texMatrix,
      uTexOne: webglState.textures.current,
      uTexTwo: webglState.textures.next,
      uTime: webglState.time,
      uPower: webglState.power,
      uWipeProgress: webglState.wipeProgress,
      uOffset: webglState.offset,
    });
    twgl.drawBufferInfo(gl, bufferInfo);
    if (rendering) renderRaf = requestAnimationFrame(renderWebGL);
  }

  function stopRendering() {
    rendering = false;
    renderRaf && (cancelAnimationFrame(renderRaf), (renderRaf = null));
  }

  function cleanupWebGL() {
    stopRendering();
    webglState.textures.current &&
      (gl.deleteTexture(webglState.textures.current),
      (webglState.textures.current = null));
    webglState.textures.next &&
      (gl.deleteTexture(webglState.textures.next),
      (webglState.textures.next = null));
    webglState.preloadedNextImage = null;
  }

  function runTransition(currentSrc, nextSrc, altText, onComplete) {
    if (!webglReady) return void onComplete();
    var id = ++transitionId;
    webglState.pendingNextSrc = nextSrc;
    webglState.pendingNextAlt = altText;
    webglState.power = 0;
    webglState.wipeProgress = 0;
    webglState.time = 0;
    webglState.offset = [1, 0];
    webglState.preloadedNextImage = null;
    var loaded = 0;
    var onTextureReady = () => {
      loaded++;
      if (loaded !== 2) return;
      renderRaf && cancelAnimationFrame(renderRaf);
      rendering = true;
      renderWebGL();
      requestAnimationFrame(() => {
        webglCanvas.style.opacity = "1";
        galleryImg1 && (galleryImg1.style.opacity = "0");
        galleryImg2 && (galleryImg2.style.opacity = "0");
      });
      var rippleTl = gsap.timeline({ paused: true });
      rippleTl
        .to(webglState, { power: 0.3, duration: 0.4, ease: "none" })
        .to(webglState, { power: 0, duration: 0.8, ease: "none" });
      gsap
        .timeline({
          onComplete: () => {
            if (id !== transitionId) return void cleanupWebGL();
            if (webglState.preloadedNextImage) {
              galleryImg1.src = webglState.preloadedNextImage.src;
              galleryImg1.alt = webglState.pendingNextAlt || "";
            }
            var finish = () => {
              galleryImg1 && (galleryImg1.style.opacity = "1");
              webglCanvas.style.opacity = "0";
              cleanupWebGL();
              onComplete();
            };
            galleryImg1.decode
              ? galleryImg1.decode().then(finish).catch(finish)
              : requestAnimationFrame(finish);
          },
        })
        .to(rippleTl, { progress: 1, duration: 1.5, ease: "power2.inOut" }, 0)
        .to(webglState, { wipeProgress: 1, duration: 1, ease: "none" }, 0.5);
    };
    webglState.textures.current = createTexture(
      currentSrc,
      (info) => {
        webglState.textureInfos.current = info;
        onTextureReady();
      },
      false,
    );
    webglState.textures.next = createTexture(
      nextSrc,
      (info) => {
        webglState.textureInfos.next = info;
        onTextureReady();
      },
      true,
    );
  }

  var products = Array.from(productWrappers).map((el) => {
    var data = el.querySelector(".product-data");
    var img = el.querySelector(".product-image")?.src || "";
    var g1 = data?.dataset["gallery-1"] || "";
    var g2 = data?.dataset["gallery-2"] || "";
    var g3 = data?.dataset["gallery-3"] || "";
    var gallery = [g1 || img];
    if (g2) gallery.push(g2);
    if (g3) gallery.push(g3);
    return {
      name: el.querySelector(".product-title")?.textContent || "",
      gallery: gallery,
      description: data?.dataset.description || "",
      ingredientImage: data?.dataset.ingredientImage || "",
      perfumeName:
        el.dataset.perfumeName ||
        el.querySelector(".product-title")?.textContent ||
        "",
      fragranceType: el.dataset.fragranceType || "",
      topNote: el.dataset.topNote || "",
      middleNote: el.dataset.middleNote || "",
      lastNote: el.dataset.lastNote || "",
      fullDescription: el.dataset.fullDescription || "",
      sku: el.dataset.sku || "",
      size: el.dataset.size || "",
      shopifyHandle: el.dataset.shopifyHandle || "",
    };
  });

  var newsItems = Array.from(newsRows).map((el) => {
    var dateEl = el.querySelector(".news--date-container .small-text");
    var titleEl = el.querySelector(".medium-text");
    var dataEl = el.querySelector(".news-data");
    var bodyEl = el.querySelector(".news-body-content");
    return {
      date: dateEl?.textContent || "",
      title: titleEl?.textContent || "",
      slug: el.dataset.newsSlug || dataEl?.dataset.newsSlug || "",
      image: dataEl?.dataset.newsImage || "",
      body: bodyEl?.innerHTML || "",
    };
  });

  function preloadImage(url) {
    if (!url || imageCache.has(url)) return Promise.resolve();
    return new Promise(function (resolve) {
      var img = new Image();
      img.src = url;
      var done = function () {
        imageCache.set(url, true);
        resolve();
      };
      img.decode
        ? img.decode().then(done).catch(done)
        : ((img.onload = done), (img.onerror = done));
    });
  }

  function resetSlideLines() {
    slideLines.forEach((line) => {
      var fill = line.querySelector(".slide--line-fill");
      if (fill) {
        gsap.killTweensOf(fill);
        gsap.set(fill, { x: "-100%" });
      }
    });
  }

  function goToSlide(idx, product, immediate) {
    if (sliding || idx === slideIndex) return;
    var prevIdx = slideIndex;
    var prevSrc = prevIdx >= 0 ? product.gallery[prevIdx] : product.gallery[0];
    var nextSrc = product.gallery[idx];
    slideIndex = idx;
    if (immediate || prevIdx < 0) {
      resetSlideLines();
      if (galleryImg1 && product.gallery[idx]) {
        galleryImg1.src = product.gallery[idx];
        galleryImg1.alt = product.name;
        gsap.set(galleryImg1, { opacity: 1 });
        gsap.set(galleryImg2, { opacity: 0 });
      }
      startAutoplay(idx, product);
      return;
    }
    sliding = true;
    gsap.delayedCall(0.75, () => {
      resetSlideLines();
      startAutoplay(idx, product);
    });
    runTransition(prevSrc, nextSrc, product.name, () => {
      sliding = false;
    });
  }

  function startAutoplay(idx, product) {
    var line = slideLines[idx];
    if (line && product.gallery.length > 1) {
      var fill = line.querySelector(".slide--line-fill");
      if (fill) {
        autoplayTween = gsap.fromTo(
          fill,
          { x: "-100%" },
          {
            x: "0%",
            duration: AUTOPLAY_DUR,
            ease: "linear",
            onComplete: () => {
              if (!sliding)
                goToSlide((slideIndex + 1) % product.gallery.length, product);
            },
          },
        );
      }
    }
  }

  function initAutoplay(product) {
    stopAutoplay();
    if (product.gallery.length <= 1) return;
    slideIndex = -1;
    goToSlide(0, product, true);
  }

  function stopAutoplay() {
    autoplayTween && (autoplayTween.kill(), (autoplayTween = null));
    sliding = false;
    stopRendering();
    resetSlideLines();
    gsap.killTweensOf(webglState);
    webglState.preloadedNextImage = null;
    webglState.pendingNextSrc = null;
    webglCanvas && (webglCanvas.style.opacity = "0");
  }

  function populateProduct(product) {
    galleryImg1 &&
      ((galleryImg1.src = product.gallery[0]),
      (galleryImg1.alt = product.name),
      gsap.set(galleryImg1, { opacity: 1 }));
    galleryImg2 && gsap.set(galleryImg2, { opacity: 0 });
    descriptionText && (descriptionText.textContent = product.description);
    if (popupIngredientImg) {
      popupIngredientImg.src = TRANSPARENT_GIF;
      popupIngredientImg.alt = "";
      if (product.ingredientImage) {
        if (imageCache.has(product.ingredientImage)) {
          popupIngredientImg.src = product.ingredientImage;
          popupIngredientImg.alt = product.perfumeName || product.name;
        } else {
          var src = product.ingredientImage;
          var alt = product.perfumeName || product.name;
          preloadImage(src).then(function () {
            popupIngredientImg.src = src;
            popupIngredientImg.alt = alt;
          });
        }
      }
    }
    popupName && (popupName.textContent = product.perfumeName || product.name);
    popupFragrance && (popupFragrance.textContent = product.fragranceType);
    popupTopNote && (popupTopNote.textContent = product.topNote);
    popupMiddleNote && (popupMiddleNote.textContent = product.middleNote);
    popupLastNote && (popupLastNote.textContent = product.lastNote);
    popupDescription &&
      (popupDescription.textContent = product.fullDescription);
    popupSku && (popupSku.textContent = product.sku);
    popupSize && (popupSize.textContent = product.size);
    var count = product.gallery.length;
    gallerySlide && (gallerySlide.style.display = count <= 1 ? "none" : "");
    slideLines.forEach(
      (line, i) => (line.style.display = i < count ? "" : "none"),
    );
    resetSlideLines();
  }

  function initWebGL() {
    if (!galleryWrapper || typeof twgl === "undefined") return false;
    webglCanvas = document.createElement("canvas");
    webglCanvas.style.cssText =
      "position:absolute;top:-30%;left:-30%;width:160%;height:160%;z-index:1;pointer-events:none;opacity:0";
    galleryWrapper.insertBefore(
      webglCanvas,
      galleryWrapper.querySelector(".gallery-slide"),
    );
    gl = webglCanvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });
    if (!gl) {
      webglCanvas.remove();
      return false;
    }
    try {
      programInfo = twgl.createProgramInfo(gl, [
        VERTEX_SHADER,
        FRAGMENT_SHADER,
      ]);
      bufferInfo = twgl.primitives.createPlaneBufferInfo(gl, 1, 1, 30, 30);
    } catch (err) {
      webglCanvas.remove();
      return false;
    }
    webglReady = true;
    return true;
  }

  function openPopup(popupMode, index) {
    if (transitioning || mode) return;
    transitioning = true;
    mode = popupMode;
    productIndex = index;
    var content = popupMode === "product" ? productContent : newsContent;

    if (popupMode === "product") {
      slideIndex = 0;
      populateProduct(products[index]);
      if (!webglReady && !webglCanvas) initWebGL();
      overlay.classList.add("show-product");
    } else {
      var item = newsItems[index];
      newsTitle && (newsTitle.textContent = item.title);
      newsDate && (newsDate.textContent = item.date);
      if (newsImage) {
        newsImage.src = TRANSPARENT_GIF;
        newsImage.alt = "";
        if (item.image) {
          newsImage.style.display = "";
          preloadImage(item.image).then(function () {
            newsImage.src = item.image;
            newsImage.alt = item.title;
          });
        } else {
          newsImage.style.display = "none";
        }
      }
      newsBody && (newsBody.innerHTML = item.body);
      overlay.classList.add("show-news");
    }

    content &&
      ((content.style.display = "grid"),
      (content.style.opacity = "0"),
      (content.scrollTop = 0));

    if (popupMode === "news" && newsContent) {
      createPopupLenis(newsContent);
    } else if (popupMode === "product") {
      var pcr = productContent?.querySelector(".popup--content-right");
      if (pcr) createPopupLenis(pcr);
    }

    closeBtn && (closeBtn.style.opacity = "0");
    if (
      popupMode === "product" &&
      closeBtn &&
      window.innerWidth <= MOBILE_BREAKPOINT
    )
      closeBtn.style.filter = "invert(1)";
    typeof SScroll !== "undefined"
      ? SScroll.stop()
      : ((document.documentElement.style.overflow = "hidden"),
        (document.body.style.overflow = "hidden"));
    document.addEventListener("wheel", blockScroll, {
      passive: false,
      capture: true,
    });
    document.addEventListener("touchmove", blockScroll, {
      passive: false,
      capture: true,
    });
    overlay.style.transition =
      "opacity 800ms " + EASE_OVERLAY + ",visibility 800ms " + EASE_OVERLAY;
    overlay.classList.add("is-active");

    setTimeout(() => {
      overlay.style.transition = "";
      content &&
        ((content.style.transition = "opacity 700ms " + EASE_CONTENT),
        (content.style.opacity = "1"));
      closeBtn &&
        ((closeBtn.style.transition = "opacity 700ms " + EASE_CONTENT),
        (closeBtn.style.opacity = "1"));
      overlay.classList.add("content-visible");
      setTimeout(() => {
        content && (content.style.transition = "");
        closeBtn && (closeBtn.style.transition = "");
        transitioning = false;
        if (popupMode === "product") initAutoplay(products[index]);
      }, CONTENT_DELAY);
    }, OPEN_DELAY);
  }

  function closePopup() {
    if (transitioning || !mode) return;
    transitioning = true;
    if (mode === "product") stopAutoplay();
    var content = mode === "product" ? productContent : newsContent;
    overlay.style.transition =
      "opacity 700ms " + EASE_CONTENT + ",visibility 700ms " + EASE_CONTENT;
    content && (content.style.transition = "opacity 700ms " + EASE_CONTENT);
    closeBtn && (closeBtn.style.transition = "opacity 700ms " + EASE_CONTENT);
    overlay.classList.remove("content-visible");
    content && (content.style.opacity = "0");
    closeBtn && (closeBtn.style.opacity = "0");
    overlay.classList.remove("is-active");

    setTimeout(() => {
      overlay.classList.remove("show-product", "show-news");
      content &&
        ((content.style.transition = ""),
        (content.style.opacity = ""),
        (content.style.display = ""));
      closeBtn &&
        ((closeBtn.style.transition = ""),
        (closeBtn.style.opacity = ""),
        (closeBtn.style.filter = ""));
      typeof SScroll !== "undefined"
        ? SScroll.start()
        : ((document.documentElement.style.overflow = ""),
          (document.body.style.overflow = ""));
      document.removeEventListener("wheel", blockScroll, { capture: true });
      document.removeEventListener("touchmove", blockScroll, { capture: true });
      overlay.style.transition = "";
      transitioning = false;
      switching = false;
      mode = null;
      destroyPopupLenis();
    }, CLOSE_DELAY);
  }

  function switchProduct(newIndex) {
    if (transitioning || switching || mode !== "product") return;
    switching = true;
    transitionId++;
    autoplayTween && (autoplayTween.kill(), (autoplayTween = null));
    resetSlideLines();

    var nextData = products[newIndex];
    var preloads = [
      preloadImage(nextData.ingredientImage),
      preloadImage(nextData.gallery[0]),
    ];

    productContent &&
      ((productContent.style.transition = "opacity 700ms " + EASE_CONTENT),
      (productContent.style.opacity = "0"));
    closeBtn &&
      ((closeBtn.style.transition = "opacity 700ms " + EASE_CONTENT),
      (closeBtn.style.opacity = "0"));

    var fadeOutDone = new Promise(function (resolve) {
      setTimeout(resolve, CONTENT_DELAY);
    });

    Promise.all([fadeOutDone].concat(preloads)).then(function () {
      stopRendering();
      gsap.killTweensOf(webglState);
      webglCanvas && (webglCanvas.style.opacity = "0");
      webglState.preloadedNextImage = null;
      webglState.pendingNextSrc = null;
      productIndex = newIndex;
      slideIndex = 0;
      populateProduct(products[productIndex]);
      destroyPopupLenis();
      var pcr = productContent?.querySelector(".popup--content-right");
      if (pcr) createPopupLenis(pcr);
      var showContent = function () {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            productContent &&
              ((productContent.style.transition =
                "opacity 700ms " + EASE_CONTENT),
              (productContent.style.opacity = "1"));
            closeBtn &&
              ((closeBtn.style.transition = "opacity 700ms " + EASE_CONTENT),
              (closeBtn.style.opacity = "1"));
          });
        });
      };
      galleryImg1 && galleryImg1.decode
        ? galleryImg1.decode().then(showContent).catch(showContent)
        : showContent();
      setTimeout(function () {
        productContent && (productContent.style.transition = "");
        closeBtn && (closeBtn.style.transition = "");
        switching = false;
        initAutoplay(products[productIndex]);
      }, CONTENT_DELAY);
    });
  }

  productWrappers.forEach((el, i) => {
    el.style.cursor = "pointer";
    el.addEventListener("click", () => openPopup("product", i));
  });
  newsRows.forEach((el, i) => {
    el.style.cursor = "pointer";
    el.addEventListener("click", () => openPopup("news", i));
  });
  closeBtn?.addEventListener("click", (ev) => {
    ev.stopPropagation();
    closePopup();
  });
  overlay.addEventListener("click", (ev) => {
    if (ev.target === overlay) closePopup();
  });
  slideLines.forEach((line, i) => {
    line.style.cursor = "pointer";
    line.addEventListener("click", () => {
      if (transitioning || sliding || mode !== "product") return;
      var product = products[productIndex];
      if (i < product.gallery.length && i !== slideIndex) {
        autoplayTween && (autoplayTween.kill(), (autoplayTween = null));
        setTimeout(() => goToSlide(i, product), 300);
      }
    });
  });
  if (galleryWrapper && window.innerWidth <= MOBILE_BREAKPOINT) {
    var touchStartX = 0;
    galleryWrapper.addEventListener(
      "touchstart",
      (ev) => {
        touchStartX = ev.touches[0].clientX;
      },
      { passive: true },
    );
    galleryWrapper.addEventListener(
      "touchend",
      (ev) => {
        if (transitioning || sliding || mode !== "product") return;
        var dx = ev.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;
        var product = products[productIndex];
        if (!product || product.gallery.length <= 1) return;
        var next =
          dx < 0
            ? (slideIndex + 1) % product.gallery.length
            : (slideIndex - 1 + product.gallery.length) %
              product.gallery.length;
        if (next !== slideIndex) {
          autoplayTween && (autoplayTween.kill(), (autoplayTween = null));
          goToSlide(next, product);
        }
      },
      { passive: true },
    );
  }
  caretLeft?.addEventListener("click", (ev) => {
    ev.stopPropagation();
    switchProduct((productIndex - 1 + products.length) % products.length);
  });
  caretRight?.addEventListener("click", (ev) => {
    ev.stopPropagation();
    switchProduct((productIndex + 1) % products.length);
  });
  if (caretLeft) caretLeft.style.cursor = "pointer";
  if (caretRight) caretRight.style.cursor = "pointer";

  var FOOTER_NEWS_LINKS = [
    { slug: "privacy-policy", attr: "data-privacy" },
    { slug: "counterfeit-notice", attr: "data-counterfeit" },
  ];

  FOOTER_NEWS_LINKS.forEach(function (link) {
    var index = -1;
    newsItems.forEach(function (item, i) {
      if (item.slug === link.slug) {
        index = i;
        var row = newsRows[i];
        if (row) row.style.display = "none";
      }
    });
    if (index < 0) return;
    var btn =
      document.querySelector(".footer-content [" + link.attr + "]") ||
      document.querySelector("[" + link.attr + "]");
    if (!btn) return;
    btn.style.cursor = "pointer";
    btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      openPopup("news", index);
    });
  });

  window.lightbox = {
    openProduct: (i) => openPopup("product", i),
    openNews: (i) => openPopup("news", i),
    close: closePopup,
    nextProduct: () => switchProduct((productIndex + 1) % products.length),
    prevProduct: () =>
      switchProduct((productIndex - 1 + products.length) % products.length),
  };
})();
