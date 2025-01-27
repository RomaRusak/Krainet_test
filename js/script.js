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

    clearInput() {
        this.#service = {
            isInputValValid: false,
            isShowMessage:  false,
            message:        '',
            passedChecks:   [],
        };
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

    clearInput() {
        super.clearInput();

        const currentInput = this.getInput();
        currentInput.value = '';
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
    #nameInputController    = null;
    #mailInputController    = null;
    #messageInputController = null;
    #form                   = null;
    #submitButton           = null;
    #privPolCheckbox        = null;
    
    init() {
        this.#form            = document.querySelector('.contacts__form');
        this.#submitButton    = document.querySelector('.contacts__button');
        this.#privPolCheckbox = document.getElementById('pricacy-policy-checkbox');

        this.#nameInputController = new InputControllerUI({
            inputName: 'name', 
            inputRules: [
                (val) => {
                    return val.length >= 2 ||  'Текущее поле не может содержать менее 2 символов'
                },
                (val) => {
                    return val.length <= 50 || 'Текущее поле не может содержать более 50 символов'
                },
                (val) => {
                    return !/\d/.test(val) || 'Текущее поле не может содержать числа';
                }
            ]
        });  
        
        this.#mailInputController = new InputControllerUI({
            inputName: 'mail',
            inputRules: [
                (val) => {
                    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    return regex.test(val) || 'Вы указали некорректную почту';
                },
            ],
        });

        this.#messageInputController = new InputControllerUI({
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
            this.#nameInputController,
            this.#mailInputController,
            this.#messageInputController,
        ].forEach(inputController => {
            const input = inputController.getInput();

            const debouncedInit = debounce(() => {
                inputController.init();
                this.controlSubmitButton();
            }, 700);
            
            input.addEventListener('input', debouncedInit);
        })

        this.disableSubmit();

        const debouncedSubmitHandler = debounce(() => {
            this.submitFormHandler();
        }, 700);

        this.#privPolCheckbox.addEventListener('click', this.controlSubmitButton.bind(this))
        this.#submitButton.addEventListener('click', debouncedSubmitHandler.bind(this));
    }

    disableSubmit() {
        this.#form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    checkIsFormValid() {
        const areAllInputsValid = [this.#nameInputController, this.#mailInputController, this.#messageInputController]
        .map(inputController =>inputController.getServiceData('isInputValValid'))
        .every(isInputValid => isInputValid);

        const isCheckboxChecked = this.#privPolCheckbox.checked;

        return areAllInputsValid && isCheckboxChecked;
    }

    async submitFormHandler() {
        const requestData = {
            name:    this.#nameInputController.getInput().value.trim(),
            mail:    this.#mailInputController.getInput().value.trim(),
            message: this.#messageInputController.getInput().value.trim(),
        }
        //Так бы выглядел запрос
        // const url = 'https://jsonplaceholder.typicode.com/posts';
        try {
            // const response = await fetch(url, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(requestData)
            // });

            //создал эмуляция объекта ответа от сервера
            const response = {
                status: 200,
                message: "OK",
                data: {
                    message: "Я получила ваше сообщение и в скором времени свяжусь вами!"
                }
            };

            setTimeout(() => {
                if (response.status === 200) {
                    this.resetForm();
                    this.showAlert(response.data.message);
                }
            },400);

        } catch (error) {
            console.error(error);
            this.showAlert('Произошла ошибка!');
        } 
    }

    resetForm() {
        [this.#nameInputController, this.#mailInputController, this.#messageInputController]
        .forEach(inputController => {
            inputController.clearInput();
        });

        this.disableSubmitButton();
        this.unchekPrivPolCheckbox();
    }

    getSumbitButton() {
        return this.#submitButton;
    }

    getPrivPolCheckbox() {
        return this.#privPolCheckbox;
    }
}

//Быстрое создание DOM-узлов с помощью нативного js
class NodeCreator {
    static createNode(nodeName) {
        const node = document.createElement(nodeName);
    
        const arrayCheck = (data) => Array.isArray(data) && data.length;
    
        return (attributes) => {
            if (arrayCheck(attributes)) {
                attributes.forEach((item) => {
                    if (arrayCheck(item)) {
                    node.setAttribute(item[0], item[1]);
                    }
                });
            }
    
            return (content) => {
                if (content) node.innerHTML = content;
        
                return node;
            };
        };
    }
}

class ContactsFormControllerUI extends ContactsFormController {
    constructor() {
        super();
    }

    init() {
        super.init();
    }

    controlSubmitButton() {
        const isFormValid = this.checkIsFormValid();
        const submitButton = this.getSumbitButton();

        submitButton.disabled = !isFormValid;
    }

    disableSubmitButton() {
        const submitButton = this.getSumbitButton();

        submitButton.disabled = true;
    }

    unchekPrivPolCheckbox() {
        const privPolChekbox = this.getPrivPolCheckbox();
        
        privPolChekbox.checked = false;
    }

    showAlert(text) {
        const alertWrapper = NodeCreator.createNode('div')([['class', 'alert__wrapper']])();
        const alertText    = NodeCreator.createNode('p')([['class', 'alert__text']])(text);

        alertWrapper.append(alertText);
        const wrapper = document.body.querySelector('.wrapper');
        wrapper.append(alertWrapper);

        setTimeout(() => {
            alertWrapper.remove();
        }, 7000);
    }
}

const contactsFormController = new ContactsFormControllerUI;
contactsFormController.init();

class FibonacciNumber {
    #calculatedNumber = null;

    setCalculateNumber(n = this.#calculatedNumber) {
        
        //  Мой вариант решения

        // const fib = n => {
        //     if (n <= 1) {
        //         return n;
        //     }
        //     return fib(n - 1) + fib(n - 2);
        // };

        //  Признаюсь, что красивое решение с мемоизацией я нагуглил, 
        //  опасаясь зависания приложения во время тестов. В данный момент вникаю в него :)

        const fib = (n, memo = {}) => {
            if (n <= 1) {
                return n;
            }
            if (memo[n] !== undefined) {
                return memo[n];
            }
            memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
            return memo[n];
        };

        this.#calculatedNumber = fib(n);
        this.render();
    }

    getCalculatedNumber() {
        return this.#calculatedNumber
    }
}

class FibonacciNumberUI extends FibonacciNumber {
    #input  = null;
    #result = null;
    
    init() {
        this.#input = document.getElementById('fibbonaci-input');
        this.#result = document.querySelector('.fibbonaci__result');

        const debouncedHandler = debounce(() => {
            const transformedValue = +this.#input.value;

            this.setCalculateNumber(transformedValue);
        }, 500);

        this.#input.addEventListener('keydown', (e) => {
            if (e.key === '-') {
                e.preventDefault();
            }
        });
        this.#input.addEventListener('input', debouncedHandler);

        this.setCalculateNumber(+this.#input.value);
    }

    render() {
        const calculatedNumber = this.getCalculatedNumber();

        this.#result.innerText = calculatedNumber;
    }
}

const fibonacciNumber = new FibonacciNumberUI;
fibonacciNumber.init();