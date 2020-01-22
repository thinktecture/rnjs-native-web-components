const template = document.createElement('template');
template.innerHTML = `
<style>
/*tag styles*/
div {
    display: flex;
    justify-content: center;
    flex-direction: row-reverse;
}
div[disabled] {
    filter: grayscale(1);
    pointer-events: none;
}
img {
    width: 60px;
    height: 60px;
}
slot[name="rating-icon"] {
   display: none; 
}

/*class styles*/
.rating-item {
    filter: grayscale(100%);
    cursor: pointer;
}

.rating-item.selected {
    filter: none;
}

.rating-item:hover, .rating-item:hover ~ .rating-item {
    filter: none;
}

.rating-star {
    background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 166 166"><polygon fill="greenyellow" points="83 26.8 65.7 61.8 27.1 67.4 55 94.7 48.5 133.2 83 115 117.5 133.2 111 94.7 138.9 67.4 100.3 61.8 83 26.8 83 26.8"/></svg>');
    background-repeat: no-repeat;
    width: 60px;
    height: 60px;
}
</style>
<slot name="headline">
      <p>Hello World!</p>
</slot>
<div part="rating">
    <slot name="rating-icon">
        <div class="rating-star"></div>
    </slot>
</div>
`;

export class Rating extends HTMLElement {

    static get observedAttributes() {
        return ['rating', 'max-rating', 'disabled'];
    }

    constructor() {
        super();
        const root = this.attachShadow({mode: 'closed'});
        root.appendChild(template.content.cloneNode(true));
        this.element = root.querySelector('div');
        const slot = this.element.querySelector('slot');
        this.slotNode = slot.querySelector('div');
        slot.addEventListener('slotchange', event => {
            const node = slot.assignedNodes()[0];
            if (node) {
                this.slotNode = node;
                this.render();
            }
        });
    } 

    get ratingName() {
        return this.getAttribute('rating-name');
    }

    set ratingName(value) {
        this.setAttribute('rating-name', value);
    }

    get maxRating() {
        return +this.getAttribute('max-rating');
    }
    
    set maxRating(value) {
        this.setAttribute('max-rating', value);
    }
    
    get rating() {
        return +this.getAttribute('rating');
    }
    
    set rating(value) {
        if (value < 0) {
            throw new Error('The rating must be higher than zero.');
        }
        const currentRating = +value;
        if (currentRating > this.maxRating) {
            throw new Error('The rating must be lower than the maximum.');
        }
        this.setAttribute('rating', value);
    }
    
    get disabled() {
        const result = this.getAttribute('disabled');
        return result === 1 || result === true || result === 'true' || result === 'disabled' ? 'disabled' : false;
    }
    
    set disabled(value) {
        this.setDisabled(this, value);
    }
    
    setDisabled(target, value) {
        console.log('disabled value', value);
        if (value === 1 || value === true || value === 'true' || value === 'disabled') {
            target.setAttribute('disabled', 'disabled');
            return;
        }
    
        target.removeAttribute('disabled');
    }
    
    
    connectedCallback () {
        // set default value for maximal rating value
        if (!this.maxRating) {
            this.maxRating = 5;
        } else if(this.maxRating < 0) {
            throw new Error('The rating must be higher than zero.');
        }
        // set default value for rating
        if (!this.rating) {
            this.rating = 0;
        } else if (this.rating < 0 || this.rating > this.maxRating) {
            throw new Error('The rating must be higher than zero and lower than the maximum.');
        }
        this.dispatchEvent(new CustomEvent('ratingChanged', { detail: this.rating }));
        this.render();
    }
    
    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal) {
            return;
        }
        console.log('Observed attribute changed', this.ratingName, `prop: ${name}`, `old: ${oldVal}`, `new: ${newVal}`);
        
        switch (name) {
            case 'rating':
                this.rating = newVal;
                this.updateRating();
                break;
            case 'max-rating':
                this.maxRating = newVal;
                this.render();
                break;
            case 'disabled':
                this.disabled = newVal;
                break;
            default:
                this.render();
                break;
        }
    }
    
    render() {
        this.clearRatingElements();
        for (let i = this.maxRating; i > 0; i--) {
            i = parseInt(i);
            const selected = this.rating ? this.rating >= i : false;
            this.createRatingStar(selected, i);
        }
        this.setDisabled(this.element, this.disabled);
    }
    
    clearRatingElements() {
        const nodes = this.element.getElementsByClassName('rating-item');
        if (nodes) {
            while (nodes.length > 0) {
                nodes[0].parentNode.removeChild(nodes[0]);
            }
        }
    }
    
    createRatingStar(selected, itemId) {
      const ratingTemplate = document.createElement('div');
        ratingTemplate.setAttribute('class', selected ? `rating-item item-${itemId} selected` : `rating-item item-${itemId}`);
        ratingTemplate.appendChild(this.slotNode.cloneNode(true));
        ratingTemplate.addEventListener('click', value => {
        this.changeRating(itemId);
        });
        this.element.appendChild(ratingTemplate);
    }
    
    changeRating(event) {
        this.rating = event;
        this.updateRating();
        this.dispatchEvent(new CustomEvent('ratingChanged', { detail: this.rating }));
    }
    
    updateRating() {
        for (let currentRating = 1; currentRating <= this.maxRating; currentRating++) {
            let ratingItem = this.element.getElementsByClassName(`item-${currentRating}`)[0];
            if (ratingItem) {
                if (currentRating <= this.rating) {
                    if (ratingItem.className.indexOf('selected') < 0) {
                        ratingItem.className = ratingItem.className + ' selected';
                    }
                } else {
                    ratingItem.className = ratingItem.className.replace('selected', '');
                }
            }
        }
    }
}

window.customElements.define('rnjs-rating', Rating);