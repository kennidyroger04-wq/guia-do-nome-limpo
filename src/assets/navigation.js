(() => {
  const toggle = document.getElementById('menuToggle');
  const navigation = document.getElementById('primaryNav');
  if (!toggle || !navigation) return;
  document.documentElement.classList.add('has-js');

  const setOpen = (open) => {
    navigation.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!navigation.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
})();
