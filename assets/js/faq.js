document.querySelectorAll('.card--faq').forEach(card => {
  const question = card.querySelector('.faq-q');

  question.addEventListener('click', () => {
    const isOpen = card.classList.contains('is-open');

    // Closes any other open card — remove this block if you want multiple open at once
    document.querySelectorAll('.card--faq.is-open').forEach(openCard => {
      if (openCard !== card) {
        openCard.classList.remove('is-open');
        openCard.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      }
    });

    card.classList.toggle('is-open', !isOpen);
    question.setAttribute('aria-expanded', String(!isOpen));
  });
});