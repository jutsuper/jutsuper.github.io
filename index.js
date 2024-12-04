const LOGGING_ENABLED = true;
const TRANSLATIONS_PATH = "translations";
//const OVERRIDE_LANGUAGE = "ru-RU";
const OVERRIDE_LANGUAGE = null;
const IGNORED_TRANSLATIONS = [
  "en-US"
]


class Logger {
  /**
   * @param {boolean} isEnabled
   * @param {Console} cons 
   */
  constructor(isEnabled, cons) {
    this.isEnabled = isEnabled;
    this.cons = cons;
  }

  /**
   * 
   * @param  {...any} data 
   */
  info(...data) {
    if (!this.isEnabled) {
      return;
    }

    this.cons.info(...data);
  }
}


class JutSuper {
  /**
   * @param {Document} doc 
   * @param {Navigator} nav
   * @param {Location} loc
   */
  constructor(doc, nav, loc) {
    this.doc = doc;
    this.nav = nav;
    this.loc = loc;

    this.body = this.doc.getElementsByTagName("body")[0];
    this.loadingOverlay = this.doc.querySelector(".jsp-loading-overlay");
    this.faqInputs = [
      this.doc.querySelector("#jsp-faq-bar-switch-1"),
      this.doc.querySelector("#jsp-faq-bar-switch-2"),
      this.doc.querySelector("#jsp-faq-bar-switch-3"),
      this.doc.querySelector("#jsp-faq-bar-switch-4")
    ];
    this.faqAutoplayBrowsersInputs = [
      this.doc.querySelector("#jsp-faq-bar-switch-2-1"),
      this.doc.querySelector("#jsp-faq-bar-switch-2-2"),
      this.doc.querySelector("#jsp-faq-bar-switch-2-3"),
      this.doc.querySelector("#jsp-faq-bar-switch-2-4")
    ];

    this.init();
  }

  async init() {
    await this.registerFaqUnfoldListeners();

    const textTranslations = await this.fetchPrefferedTextTranslations();
    if (textTranslations) {
      await this.translatePageText(textTranslations);
    }

    const imageTranslations = await this.fetchPrefferedImageTranslations();
    if (imageTranslations) {
      await this.translatePageImages(imageTranslations);
    }

    if (this.loc.hash === "#faq-autoplay") {
      const autoplayFaqInput = this.faqInputs[1];
      autoplayFaqInput.checked = true;
      const autoplayFaqTitle = this.doc.getElementsByClassName(
        "jsp-text-no-autoplayback-q"
      )[0]
      autoplayFaqTitle.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    await this.hideLoadingOverlay();
  }

  async registerFaqUnfoldListeners() {
    for (const faqInput of this.faqInputs) {
      faqInput.addEventListener("change", event => {
        const target = /** @type {HTMLInputElement} */ (event.target);
        for (const faqInput of this.faqInputs) {
          if (faqInput.id === target.id) {
            continue;
          }

          faqInput.checked = false;
        }
      });
    }

    for (const faqInput of this.faqAutoplayBrowsersInputs) {
      faqInput.addEventListener("change", event => {
        const target = /** @type {HTMLInputElement} */ (event.target);
        for (const faqInput of this.faqAutoplayBrowsersInputs) {
          if (faqInput.id === target.id) {
            continue;
          }

          faqInput.checked = false;
        }
      });
    }
  }

  /**
   * @returns {Promise<Record<string, string> | undefined>}
   */
  async fetchPrefferedTextTranslations() {
    let lang;
    if (OVERRIDE_LANGUAGE) {
      lang = OVERRIDE_LANGUAGE;
    }
    else {
      lang = this.getPrefferedLanguage();
    }
    
    if (!lang || IGNORED_TRANSLATIONS.includes(lang)) {
      return;
    }

    const url = `${TRANSLATIONS_PATH}/${lang}/text.json`;
    const resp = await fetch(url);
    if (!resp.ok) {
      return;
    }

    return await resp.json();
  }

  /**
   * @param {Record<string, string>} translations
   */
  async translatePageText(translations) {
    for (const [cls, text] of Object.entries(translations)) {
      [...this.doc.querySelectorAll(`.${cls}`)].forEach(
        (value, index, array) => {
          value.innerHTML = text;
        }
      );
    }
  }

  /**
   * @returns {Promise<Record<string, string> | undefined>}
   */
  async fetchPrefferedImageTranslations() {
    let lang;
    if (OVERRIDE_LANGUAGE) {
      lang = OVERRIDE_LANGUAGE;
    }
    else {
      lang = this.getPrefferedLanguage();
    }

    if (!lang || IGNORED_TRANSLATIONS.includes(lang)) {
      return;
    }

    const url = `${TRANSLATIONS_PATH}/${lang}/images.json`;
    const resp = await fetch(url);
    if (!resp.ok) {
      return;
    }

    return await resp.json();
  }

  /**
   * @param {Record<string, string>} translations
   */
  async translatePageImages(translations) {
    for (const [cls, src] of Object.entries(translations)) {
      [...this.doc.querySelectorAll(`.${cls}`)].forEach(
        (value, index, array) => {
          value.src = src;
        }
      );
    }
  }

  async hideLoadingOverlay() {
    this.loadingOverlay.classList.add("jsp-no-pointer-events");
    this.loadingOverlay.classList.add("jsp-opacity-0");
    this.body.classList.remove("jsp-body-hide-overflows");
    this.body.classList.add("jsp-body-overflows");
  }

  getPrefferedLanguage() {
    return this.nav.language || this.nav.userLanguage;
  }
}

var logger = new Logger(LOGGING_ENABLED, console);
new JutSuper(document, navigator, location);
