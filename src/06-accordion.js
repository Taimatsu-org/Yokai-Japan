class PBAccordion {
  constructor() {
    this.accordions = document.querySelectorAll('[pb-component="accordion"]');
    this.cleanupInitialState();
    this.init();
  }

  getElements(item) {
    return {
      trigger: item.querySelector('[pb-accordion-element="trigger"]'),
      content: item.querySelector('[pb-accordion-element="content"]'),
      arrow: item.querySelector('[pb-accordion-element="arrow"]'),
      plus: item.querySelector('[pb-accordion-element="plus"]'),
    };
  }

  toggleClasses(item, els, active) {
    var method = active ? 'add' : 'remove';
    item.classList[method]('is-active-accordion');
    els.content?.classList[method]('is-active-accordion');
    if (els.arrow) els.arrow.classList[method]('is-active-accordion');
    if (els.plus) els.plus.classList[method]('is-active-accordion');
  }

  cleanupInitialState() {
    this.accordions.forEach((accordion) => {
      var group = accordion.querySelector('[pb-accordion-element="group"]');
      if (!group) return;

      var items = group.querySelectorAll('[pb-accordion-element="accordion"]');
      items.forEach((item) => {
        var els = this.getElements(item);
        if (els.content) {
          els.content.style.maxHeight = '0';
          els.content.style.opacity = '0';
          els.content.style.visibility = 'hidden';
          els.content.style.display = 'none';
        }
        if (els.trigger) els.trigger.setAttribute('aria-expanded', 'false');
        this.toggleClasses(item, els, false);
      });

      var initial = group.getAttribute('pb-accordion-initial');
      if (initial && initial !== 'none') {
        var initialItem = items[parseInt(initial) - 1];
        if (initialItem) this.openAccordion(initialItem);
      }
    });
  }

  init() {
    this.accordions.forEach((accordion) => {
      var group = accordion.querySelector('[pb-accordion-element="group"]');
      if (!group) return;
      group.addEventListener('click', (e) => this.handleClick(e, group));
    });
  }

  handleClick(event, group) {
    var item = event.target.closest('[pb-accordion-element="accordion"]');
    if (!item) return;

    var isOpen = item.classList.contains('is-active-accordion');
    if (group.getAttribute('pb-accordion-single') === 'true') {
      group.querySelectorAll('[pb-accordion-element="accordion"]').forEach((other) => {
        if (other !== item && other.classList.contains('is-active-accordion')) this.closeAccordion(other);
      });
    }

    isOpen ? this.closeAccordion(item) : this.openAccordion(item);
  }

  openAccordion(item) {
    var els = this.getElements(item);
    els.content.style.visibility = 'visible';
    els.content.style.display = 'block';
    els.content.offsetHeight;

    var height = els.content.scrollHeight;
    requestAnimationFrame(() => {
      els.content.style.maxHeight = height + 'px';
      els.content.style.opacity = '1';
      els.trigger.setAttribute('aria-expanded', 'true');
      this.toggleClasses(item, els, true);
    });

    els.content.addEventListener('transitionend', () => {
      if (item.classList.contains('is-active-accordion')) els.content.style.maxHeight = 'none';
    }, { once: true });
  }

  closeAccordion(item) {
    var els = this.getElements(item);
    els.content.style.maxHeight = els.content.scrollHeight + 'px';
    els.content.style.display = 'block';
    els.content.offsetHeight;

    requestAnimationFrame(() => {
      els.content.style.maxHeight = '0';
      els.content.style.opacity = '0';
      els.trigger.setAttribute('aria-expanded', 'false');
      this.toggleClasses(item, els, false);
    });

    els.content.addEventListener('transitionend', () => {
      if (!item.classList.contains('is-active-accordion')) {
        els.content.style.visibility = 'hidden';
        els.content.style.display = 'none';
      }
    }, { once: true });
  }
}

new PBAccordion();
