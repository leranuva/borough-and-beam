'use strict';

document.documentElement.classList.add('js');

const config = {
  // Replace with the contractor's real inbox to enable email drafts.
  estimateEmail: '',
};

const menu = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  menu.querySelector('span').textContent = open ? '−' : '+';
  nav.classList.toggle('is-open', open);
}
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', event => {
  if (event.target.closest('a') && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    const target = document.querySelector(event.target.closest('a').hash);
    if (target) {
      target.tabIndex = -1;
      target.focus({preventScroll: true});
    }
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});

const service = document.getElementById('service');
document.querySelectorAll('[data-service]').forEach(link => {
  link.addEventListener('click', () => { service.value = link.dataset.service; });
});

const form = document.getElementById('estimate');
form.hidden = false;
const dialog = document.getElementById('inquiry');
const inquiry = document.getElementById('inquiry-text');
const copyStatus = document.getElementById('copy-status');
const formNote = document.getElementById('form-note');
const estimateButton = document.getElementById('estimate-button');
if (config.estimateEmail) {
  formNote.textContent = 'This opens a draft in your email app. Review it there before sending.';
  estimateButton.firstChild.textContent = 'Open email draft ';
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const field = key => String(data.get(key) ?? '').trim();
  const body = [
    'Name: ' + field('name'),
    'Email: ' + field('email'),
    'Project type: ' + field('service'),
    'Borough: ' + field('borough'),
    '',
    'Project details:',
    field('details'),
  ].join('\n');
  if (config.estimateEmail) {
    const subject = encodeURIComponent('Estimate request — ' + field('service'));
    location.href = 'mailto:' + config.estimateEmail + '?subject=' + subject + '&body=' + encodeURIComponent(body);
    return;
  }
  inquiry.textContent = body;
  copyStatus.textContent = '';
  dialog.showModal();
});
document.getElementById('close-inquiry').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => estimateButton.focus());
document.getElementById('copy-inquiry').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(inquiry.textContent);
    copyStatus.textContent = 'Copied.';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(inquiry);
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = 'Text selected. Copy it using your device’s copy command.';
  }
});

