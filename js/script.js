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

class InputController {
    #input           = null;
    #rules           = [];
    #service         = {
        isInputValValid: false,
        isShowMessage:  false,
        message:        '',
        passedChecks:   [],
    };

    constructor({inputName, inputRules}) {
        this.#input = document.getElementById(inputName);
        this.#rules = inputRules;
    }

    init() {
        if (this.#input) {
            const value = this.#input.value.trim();

            this.checkisInputValValid(value);
            this.checkIsShowMessage(value);
            this.setMessage();
        }
    }

    checkIsShowMessage(value) {
        const {isInputValValid} = this.#service;
        const isInputNotEmpty = value.trim().length > 0;

        this.#service.isShowMessage = !isInputValValid && isInputNotEmpty;
    }

    checkisInputValValid(value) {
        const passedChecks = this.#rules.map(check => check(value));
        const isInputValValid = passedChecks.every(checkResult => checkResult === true)

        this.#service = {...this.#service, passedChecks, isInputValValid};
    }

    setMessage() {
        const {passedChecks, isShowMessage} = this.#service;
        let message = '';

        if (isShowMessage) {
            const failedCheckText = passedChecks.find(checkResult => typeof checkResult === 'string');
            message = failedCheckText ?? '';
        }

        this.#service.message = message;
    }

    getInput() {
        return this.#input;
    }

    getServiceData(key) {
        return this.#service[key]
    }
}

class InputControllerUI extends InputController {
    constructor(data) {
        super(data);
    }

    init() {
        super.init();
        this.render();
    }

    render() {
        const currentInput = this.getInput();
        const {id} = currentInput;
        const message = this.getServiceData('message');

        const inputTooltip = document.querySelector(`#${id} + .contacts__input-toopltip`);

        inputTooltip.innerText = message;
    }
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

class ContactsFormController {
    #nameInput    = null;
    #mailInput    = null;
    #messageInput = null;
    
    init() {
        this.#nameInput = new InputControllerUI({
            inputName: 'name', 
            inputRules: [
                (val) => {
                    return val.length >= 3 ||  'Текущее поле не может содержать менее 3 символов'
                },
                (val) => {
                    return val.length <= 50 || 'Текущее поле не может содержать более 50 символов'
                },
                (val) => {
                    return !/\d/.test(val) || 'Текущее поле не может содержать числа';
                }
            ]
        });  
        
        this.#mailInput = new InputControllerUI({
            inputName: 'mail',
            inputRules: [
                (val) => {
                    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    console.log(regex.test(val))
                    return regex.test(val) || 'Вы указали некорректную почту';
                },
            ],
        });

        this.#messageInput = new InputControllerUI({
            inputName: 'message',
            inputRules: [
                (val) => {
                    return val.length >= 10 ||  'Текущее поле не может содержать менее 10 символов'
                },
                (val) => {
                    return val.length <= 255 ||  'Текущее поле не может содержать более 255 символов'
                },
            ],
        });

        [
            this.#nameInput,
            this.#mailInput,
            this.#messageInput,
        ].forEach(inputController => {
            const input = inputController.getInput();

            const debouncedInit = debounce(() => {
                inputController.init();
            }, 700);
            
            input.addEventListener('input', debouncedInit);
        })
    }
}

const contactsFormController = new ContactsFormController;
contactsFormController.init();