// Classic (non-module) script, loaded first in <head>: sets page language and direction
// from the saved choice before anything is drawn, and tells pages which Blockly messages to load.
(function () {
  var lang = 'ar';
  try {
    var saved = JSON.parse(localStorage.getItem('academy:v1:lang'));
    if (saved === 'en' || saved === 'ar') lang = saved;
  } catch (e) {
    /* storage blocked: stay Arabic */
  }
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  window.ACADEMY_LANG = lang;
})();
