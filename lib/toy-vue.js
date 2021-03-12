export class ToyVue{
    constructor(config){
        this.template = document.querySelector(config.el);
        this.data = reactive(config.data)
        this.traversale(this.template)
    }
    traversale(node){
        if(node.nodeType ===  Node.TEXT_NODE){
            if(node.textContent.trim().match(/^{{([\s\S]+)}}$/)){
                let name = RegExp.$1.trim();
                effect(()=>node.textContent = this.data[name])
            }
        }

        if(node.childNodes && node.childNodes.length){
            for(let child of node.childNodes)
                this.traversale(child)
        }
    }
}

let effects = new Map()

let currentEffect = null

export function effect(fn){
    currentEffect = fn
    fn()
    currentEffect = null
}

export function reactive (object) {
    let observed = new Proxy(object,{
        get(object, propety){
            if(currentEffect){
                if(!effects.has(object))
                    effects.set(object,new Map);
                if(!effects.get(object).has(propety))
                    effects.get(object).set(propety, new Array)
                effects.get(object).get(propety).push(currentEffect)
            }
            return object[propety]
        },
        set(object, propety ,value){
            object[propety] = value;
            for(let effect of effects.get(object).get(propety)){
                effect()
            }
            return true
        }
    })
    return observed
}
