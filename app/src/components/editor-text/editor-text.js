export default class EditorText {
    constructor (element, virtualElement){
        this.element = element;
        this.virtualElement = virtualElement;
        this.element.addEventListener("click", ()=> this.onClick());
        this.element.addEventListener("blur", ()=> this.onBlur());
        this.element.addEventListener("keypress", (e)=> this.onKeyPress(e));
        this.element.addEventListener("input", ()=> this.onTextEdit());
        //условие: если элемент либо ссылка либо кнопка => активируется метод onCtxMenu
        //логика: если я кликаю правой кнопкой мыши по тексту, работает стандартно: открывается контестное меню,
        //если кликаю по ссылке: включается редактирование
        if(this.element.parentNode.nodeName === "A" || this.element.parentNode.nodeName === "BUTTON") {
            this.element.addEventListener("contextmenu", (e)=> this.onCtxMenu(e));
        }    
    }


    //метод отмены стандартного поведения, а именно открытие контекстного меню ( см.логика в конструкторе )
    onCtxMenu(e) {
        e.preventDefault();
        this.onClick();
    }

    //метод включения редактирования, также он ставим фокус на элементе редактирования
    onClick() {
        this.element.contentEditable = "true";
        this.element.focus();
    }

    //метод удаления свойсва contentEditable
    onBlur() {
        this.element.removeAttribute('contenteditable');
    }

    //метод удаления редактирования при нажатии Enter (удаление бага)
    onKeyPress(e) {
        if(e.keyCode === 13) {
            this.element.blur();
        }
    }

    // копирование DOM в виртуальный DOM
    onTextEdit() {
        this.virtualElement.innerHTML = this.element.innerHTML;
    }
}