document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.product-inquiry-section form');
  if (!form) return;

  const variantSelect = form.querySelector('select[name="id"]');
  const qtyInput = form.querySelector('input[name="quantity"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const errorWrapper = form.querySelector('.product-form__error-message-wrapper');
  const errorMessage = form.querySelector('.product-form__error-message');

  function showInlineMessage(message) {
    if (errorWrapper && errorMessage) {
      errorWrapper.hidden = false;
      errorMessage.textContent = message;
    }
  }

  function updateQuantityLimits(option) {
    if (!qtyInput || !option) return;

    const min = parseInt(option.dataset.min) || 1;
    const maxData = option.dataset.max;
    const max = maxData !== '' ? parseInt(maxData) : null;
    const step = parseInt(option.dataset.step) || 1;

    qtyInput.min = min;
    qtyInput.max = max !== null ? max : '';
    qtyInput.step = step;

    let currentValue = parseInt(qtyInput.value) || min;

    if (currentValue < min) {
      currentValue = min;
    } 
    
    if (max !== null && currentValue > max) {
      currentValue = max;
    }
    
    qtyInput.value = currentValue;
  }

  if (variantSelect) {
    variantSelect.addEventListener('change', () => {
      const selectedOption = variantSelect.options[variantSelect.selectedIndex];
      const isAvailable = !selectedOption.disabled;

      updateQuantityLimits(selectedOption);

      submitButton.disabled = !isAvailable;
      submitButton.querySelector('span').textContent = isAvailable
        ? submitButton.dataset.labelDefault || 'Add to cart'
        : submitButton.dataset.labelSoldOut || 'Sold Out';

      if (!isAvailable) {
        const soldOutMessage = submitButton.dataset.labelSoldOut || 'Selected variant is not available.';
        showInlineMessage(soldOutMessage);
      } else {
        if (errorWrapper) errorWrapper.hidden = true;
      }
    });

    const initialOption = variantSelect.options[variantSelect.selectedIndex];
    updateQuantityLimits(initialOption);
  }
});