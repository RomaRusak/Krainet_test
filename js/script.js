class NavMenuController {
    #burgerMenuIcon   = null;
    #overlay          = null;
    #navMenuCloseIcon = null;

    init() {
        this.#burgerMenuIcon   = document.querySelector('.burger-menu');
        this.#overlay          = document.querySelector('.overlay');
        this.#navMenuCloseIcon = document.querySelector('.nav-menu__close-icon');

        this.#burgerMenuIcon.addEventListener('click', this.addActiveClass.bind(this));
        this.#overlay.addEventListener('click', this.checkNavMenuClosest.bind(this));
        this.#navMenuCloseIcon.addEventListener('click', this.removeActiveClass.bind(this));
    }

    checkNavMenuClosest(e) {
        if (!e.target.closest('.nav-menu')) {
           this.removeActiveClass();
        }
    }

    addActiveClass() {
        this.#overlay.classList.add('overlay-active');
    }

    removeActiveClass() {
        this.#overlay.classList.remove('overlay-active');
    }
}

const navMenuController = new NavMenuController;
navMenuController.init();