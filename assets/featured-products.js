(function() {
  'use strict';

  // Find all sections with sorting functionality
  document.querySelectorAll('.featured-products__sort').forEach(sortSelect => {
    const sectionId = sortSelect.dataset.sectionId;
    const productGrid = document.getElementById(sectionId);
    
    if (!productGrid) return;

    // Cache products with metadata on initialization
    const products = Array.from(productGrid.children).map((el, idx) => ({
      element: el,
      index: idx,
      price: (() => {
        const priceEl = el.querySelector('.price-item--regular, .price-item--sale');
        if (!priceEl) return 0;
        const num = parseFloat(priceEl.textContent.replace(/[^\d.,]/g, '').replace(',', '.'));
        return isNaN(num) ? 0 : num;
      })(),
      title: (el.querySelector('.card__heading, .card-information__text h3')?.textContent.trim().toLowerCase() || '')
    }));

    // Sort and reorder products
    function sort(type) {
      const sorted = [...products].sort((a, b) => {
        switch (type) {
          case 'price-ascending': return a.price - b.price;
          case 'price-descending': return b.price - a.price;
          case 'title-ascending': return a.title.localeCompare(b.title);
          default: return a.index - b.index;
        }
      });

      const fragment = document.createDocumentFragment();
      sorted.forEach(p => fragment.appendChild(p.element));
      productGrid.innerHTML = '';
      productGrid.appendChild(fragment);
    }

    sortSelect.addEventListener('change', e => sort(e.target.value));
  });

  // Add to cart functionality
  document.addEventListener('submit', async (e) => {
    const form = e.target;
    
    // Check if this is a featured product form
    if (!form.matches('form[data-type="add-to-cart-form"][data-featured-product="true"]')) return;
    
    e.preventDefault();
    e.stopPropagation();

    const addButton = form.querySelector('.quick-add__submit[type="submit"]');
    if (!addButton) return;

    const variantInput = form.querySelector('input[name="id"]');
    if (!variantInput || variantInput.disabled) return;

    const buttonText = addButton.querySelector('span:first-child');
    const spinner = addButton.querySelector('.loading__spinner');
    
    // === SHOW LOADING STATE ===
    addButton.disabled = true;
    addButton.classList.add('loading');
    
    if (spinner) {
      spinner.classList.remove('hidden'); 
      spinner.classList.add('loading-spinner--active');
    }
    
    if (buttonText) buttonText.style.visibility = 'hidden';

    try {
      // Add to cart
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: variantInput.value,
          quantity: 1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      // Update cart count
      const cartResponse = await fetch('/cart.js');
      const cartData = await cartResponse.json();
      
      // Update count in header
      document.querySelectorAll('.cart-count-bubble span, [data-cart-count]').forEach(el => {
        el.textContent = cartData.item_count;
      });

      // Show cart count bubble
      document.querySelectorAll('.cart-count-bubble').forEach(bubble => {
        if (cartData.item_count > 0) {
          bubble.classList.remove('hidden');
        }
      });
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      if (buttonText) {
        buttonText.style.visibility = 'visible';
        const originalText = buttonText.textContent;
        buttonText.textContent = 'Error';
        
        setTimeout(() => {
          buttonText.textContent = originalText;
        }, 2000);
      }
    } finally {
      // === RESET BUTTON STATE ===
      addButton.disabled = false;
      addButton.classList.remove('loading');
      
      if (spinner) {
        spinner.classList.remove('loading-spinner--active');
        spinner.classList.add('hidden'); 
      }
      
      if (buttonText) buttonText.style.visibility = 'visible';
    }
  });

})();