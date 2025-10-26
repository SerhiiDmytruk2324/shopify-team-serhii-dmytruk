(function() {
  'use strict';

  // ========================================
  // STATE
  // ========================================
  
  let state = {
    selectedColor: null,
    selectedSize: null,
    variantsData: [],
    thumbsSwiper: null,
    resizeTimeout: null
  };

  let elements = {};

  // ========================================
  // INITIALIZATION
  // ========================================
  
  function init() {
    cacheElements();
    
    if (!loadVariantData()) {
      console.error('Failed to initialize: No variant data');
      return;
    }

    setupEventListeners();
    initializeFirstColor();
  }

  function cacheElements() {
    elements = {
      mainImage: document.getElementById('main-product-image'),
      thumbsWrapper: document.getElementById('thumbs-swiper-wrapper'),
      sizeContainer: document.getElementById('size-container'),
      stockInfo: document.getElementById('variant-stock'),
      priceContainer: document.getElementById('variant-price'),
      newPrice: document.getElementById('new-price-display'),
      oldPrice: document.getElementById('old-price-display'),
      colorButtons: document.querySelectorAll('.color-btn'),
      variantScript: document.getElementById('product-variants-data'),
      cartLink: document.getElementById('add-to-cart-link')
    };
  }

  function loadVariantData() {
    if (!elements.variantScript) return false;

    try {
      state.variantsData = JSON.parse(elements.variantScript.textContent);
      return state.variantsData && state.variantsData.length > 0;
    } catch (e) {
      console.error('JSON parse error:', e);
      return false;
    }
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================
  
  function setupEventListeners() {
    setupColorButtons();
    setupResizeHandler();
  }

  function setupColorButtons() {
    elements.colorButtons.forEach(btn => {
      btn.addEventListener('click', () => handleColorClick(btn));
    });
  }

  function setupResizeHandler() {
    window.addEventListener('resize', handleResize);
  }

  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  function handleColorClick(button) {
    state.selectedColor = button.dataset.color;
    
    updateColorButtonStates(button);
    renderThumbnailsForColor(state.selectedColor);
    loadSizesForColor(state.selectedColor);
  }

  function handleResize() {
    clearTimeout(state.resizeTimeout);
    state.resizeTimeout = setTimeout(() => {
      if (state.thumbsSwiper) {
        state.thumbsSwiper.changeDirection(getSwiperDirection());
      }
    }, 150);
  }

  function handleSizeClick(button, size) {
    state.selectedSize = size;
    
    updateSizeButtonStates(button);
    updateStockInfo(state.selectedColor, size);
    updatePrice(state.selectedColor, size);
    updateCartLink(state.selectedColor, size);
  }

  function handleThumbnailClick(swiper) {
    const clickedIndex = swiper.clickedIndex;
    if (clickedIndex !== undefined) {
      updateMainImage(clickedIndex);
    }
  }

  // ========================================
  // RENDERING
  // ========================================
  
  function renderThumbnailsForColor(color) {
    if (!elements.thumbsWrapper) return;

    clearThumbnails();
    
    const colorVariants = getColorVariants(color);
    if (colorVariants.length === 0) return;

    const fragment = createThumbnailFragment(colorVariants);
    elements.thumbsWrapper.appendChild(fragment);

    updateMainImage(0);
    initSwiper();
  }

  function clearThumbnails() {
    elements.thumbsWrapper.innerHTML = '';
  }

  function createThumbnailFragment(variants) {
    const fragment = document.createDocumentFragment();
    
    variants.forEach((variant, index) => {
      const slide = createThumbnailSlide(variant, index);
      fragment.appendChild(slide);
    });

    return fragment;
  }

  function createThumbnailSlide(variant, index) {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.dataset.index = index;
    
    const img = document.createElement('img');
    img.src = variant.thumbUrl;
    img.alt = variant.color;
    img.width = 88;
    img.height = 88;
    img.loading = 'lazy';
    
    slide.appendChild(img);
    return slide;
  }

  function updateMainImage(index) {
    if (!elements.mainImage || !state.selectedColor) return;
    
    const colorVariants = getColorVariants(state.selectedColor);
    const variant = colorVariants[index];
    
    if (variant && variant.imageUrl) {
      elements.mainImage.src = variant.imageUrl;
      elements.mainImage.alt = variant.color;
    }
  }

  function loadSizesForColor(color) {
    if (!elements.sizeContainer) return;

    clearSizes();
    
    const colorVariants = getColorVariantsAll(color);
    const uniqueSizes = getUniqueSizes(colorVariants);
    const fragment = createSizeButtons(uniqueSizes, colorVariants);
    
    elements.sizeContainer.appendChild(fragment);
    selectFirstAvailableSize(colorVariants);
  }

  function clearSizes() {
    elements.sizeContainer.innerHTML = '';
    state.selectedSize = null;
  }

  function createSizeButtons(sizes, colorVariants) {
    const fragment = document.createDocumentFragment();

    sizes.forEach(size => {
      const variant = findVariantBySize(colorVariants, size);
      const button = createSizeButton(size, variant);
      fragment.appendChild(button);
    });

    return fragment;
  }

  function createSizeButton(size, variant) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch-option-size border-radius';
    btn.textContent = size;
    btn.dataset.size = size;
    btn.setAttribute('aria-label', `Select size ${size}`);

    if (!isVariantAvailable(variant)) {
      btn.classList.add('unavailable');
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
    }

    btn.addEventListener('click', () => handleSizeClick(btn, size));

    return btn;
  }

  // ========================================
  // SWIPER MANAGEMENT
  // ========================================
  
  function initSwiper() {
    destroySwiper();

    state.thumbsSwiper = new Swiper('.thumbs-swiper', {
      spaceBetween: 8,
      slidesPerView: 3,
      direction: getSwiperDirection(),
      watchSlidesProgress: true,
      breakpoints: {
        425: {
          slidesPerView: 4,
          spaceBetween: 8,
        },
        768: {
          slidesPerView: 6,
          spaceBetween: 8,
        },
        1280: {
          slidesPerView: 'auto',
          spaceBetween: 16,
        }
      }
    });

    state.thumbsSwiper.on('click', handleThumbnailClick);
  }

  function destroySwiper() {
    if (state.thumbsSwiper) {
      state.thumbsSwiper.destroy(true, true);
      state.thumbsSwiper = null;
    }
  }

  function getSwiperDirection() {
    return window.innerWidth >= 1280 ? 'vertical' : 'horizontal';
  }

  // ========================================
  // UI UPDATES
  // ========================================
  
  function updateColorButtonStates(activeButton) {
    elements.colorButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-pressed', 'true');
  }

  function updateSizeButtonStates(activeButton) {
    elements.sizeContainer.querySelectorAll('.swatch-option-size').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-pressed', 'true');
  }

  function updateStockInfo(color, size) {
  if (!elements.stockInfo) return;

  const variant = findVariant(color, size);
  if (!variant) return;

  let text;

  if (!variant.available) {
    // Якщо variant недоступний — показуємо "Not Available"
    text = elements.stockInfo.dataset.notAvailableText;
  } else if (variant.qty > 0) {
    // Якщо є реальна кількість — показуємо з числом
    text = elements.stockInfo.dataset.availablePrefix + variant.qty;
  } else {
    // Якщо `available === true`, але `qty === 0` 
    // (тобто не трекується інвентар) — показуємо "In Stock" без числа
    text = elements.stockInfo.dataset.availablePrefix + 'Available';
  }

  elements.stockInfo.textContent = text;
}

  function updatePrice(color, size) {
    const variant = findVariant(color, size);
    if (!variant || !elements.newPrice || !elements.oldPrice) return;

    elements.newPrice.textContent = variant.price_money;

    if (variant.compare_at_price > variant.price) {
      elements.oldPrice.textContent = variant.compare_at_price_money;
      elements.oldPrice.style.display = 'inline';
    } else {
      elements.oldPrice.textContent = '';
      elements.oldPrice.style.display = 'none';
    }
  }

  function updateCartLink(color, size) {
    if (!elements.cartLink) return;

    const variant = findVariant(color, size);

    if (variant && variant.available) {
      elements.cartLink.href = `/cart/add?id=${variant.id}&quantity=1`;
      elements.cartLink.classList.remove('unavailable');
      elements.cartLink.removeAttribute('disabled');
    } else {
      elements.cartLink.href = '#';
      elements.cartLink.classList.add('unavailable');
      elements.cartLink.setAttribute('disabled', 'true');
    }
  }

  function selectFirstAvailableSize(colorVariants) {
    const firstAvailable = elements.sizeContainer.querySelector('.swatch-option-size:not(.unavailable)');

    if (firstAvailable) {
      elements.priceContainer.style.display = 'block';
      firstAvailable.click();
    } else {
      handleNoAvailableSizes(colorVariants);
    }
  }

  function handleNoAvailableSizes(colorVariants) {
    elements.priceContainer.style.display = 'none';
    
    if (elements.stockInfo) {
      elements.stockInfo.textContent = elements.stockInfo.dataset.notAvailableText;
    }

    updateCartLink(state.selectedColor, null);

    const firstVariant = colorVariants[0];
    if (firstVariant) {
      updatePrice(firstVariant.color, firstVariant.size);
    }
  }

  // ========================================
  // UTILITIES
  // ========================================
  
  function getColorVariants(color) {
    const colorVariants = state.variantsData.filter(v => 
    v.color === color && v.imageUrl && v.imageUrl.trim() !== ''
  );
  
  // Remove duplicate images
  const seen = new Set();
  return colorVariants.filter(v => {
    if (seen.has(v.imageUrl)) return false;
    seen.add(v.imageUrl);
    return true;
  });
  }

  function getColorVariantsAll(color) {
    return state.variantsData.filter(v => v.color === color);
  }

  function getUniqueSizes(variants) {
    return [...new Set(variants.map(v => v.size))];
  }

  function findVariant(color, size) {
    return state.variantsData.find(v => v.color === color && v.size === size);
  }

  function findVariantBySize(variants, size) {
    return variants.find(v => v.size === size);
  }

  function isVariantAvailable(variant) {
    return variant && variant.available && variant.qty > 0;
  }

  function initializeFirstColor() {
    const firstColorBtn = elements.colorButtons[0];
    if (firstColorBtn) {
      handleColorClick(firstColorBtn);
    }
  }

  // ========================================
  // START
  // ========================================
  
  document.addEventListener('DOMContentLoaded', init);

})();