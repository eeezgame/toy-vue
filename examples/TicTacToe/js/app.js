
import { reactive, effect} from '../../../lib/toy-vue.js'

function GameMananger(el){
    this.el = el
    this.board = reactive(Array(9).fill(0))
    this.boardNodes = el.querySelectorAll('.grid-cell')
    this.boardNodes.forEach((node,index) => {
        effect(()=>node.textContent = this.board[index] === 2 ?this.playerB.hero: this.board[index] === 1 ? this.playerA.hero:'')
    });
    this.currentPlayer = null
    this.heros = ['O','X','22','33']
    this.playerA = null
    this.playerB = null
    this.turnsMananger = null
    this.winner = null
}

GameMananger.prototype.setup = function(){
    this.playerA = new Player('伊泽瑞尔',this.choseHeros(2),1)
    this.playerB = new Player('拉克丝',this.choseHeros(3),2,true)
    this.currentPlayer = this.playerA
    this.nextPlayer = this.playerB
    this.turnsMananger = new TurnsMananger()
    this.turnsMananger.start(this.playerA)
    new EventManager(this)
    
}

GameMananger.prototype.choseHeros = function(index){
    return this.heros[index]
}

GameMananger.prototype.getCurrentPlayer = function(){
    return this.currentPlayer
}

GameMananger.prototype.getNextPlayer = function(){
    return this.nextPlayer
}

GameMananger.prototype.changePlayer = function(){
    let temp = this.getCurrentPlayer()
    this.currentPlayer = this.getNextPlayer()
    this.nextPlayer = temp
}

GameMananger.prototype.checkWin = function(){
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i]
        let squares = this.board
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            const winnerColor =  squares[a]
            this.winner = winnerColor === 2 ? this.playerB : winnerColor === 1
                                            ? this.playerA : null
            return squares[a]
        }
    }
    return 0
}

GameMananger.prototype.willWin = function(color){
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i]
        let squares = this.board

        if ((squares[a] === squares[b]) 
            || (squares[b] === squares[c])
            || (squares[a] === squares[c])
            )
        {

            if([squares[a],squares[b],squares[c]].filter(el=>el===color).length>1
                && [squares[a],squares[b],squares[c]].findIndex(item=>item==0)>=0){
                return lines[i][[squares[a],squares[b],squares[c]].findIndex(item=>item==0)]
            }
        }
    }
    return -1
}

GameMananger.prototype.bestChoice = function(){
    const nextColor = this.getNextPlayer().color
    const currentColor = this.getCurrentPlayer().color
    let result = -1
    result = this.willWin(nextColor)
    if(result < 0 ){
        if(this.board[4] === 0){
            result = 4
            return result
        }
    }
    result = this.willWin(currentColor)
    if(result > 0){
        return result
    }
    result = this.willWin(nextColor)
    return result
}
function TurnsMananger(){
    this.turns=[]
}
TurnsMananger.prototype.start = function(player,pointer,board){
    this.turns.push({
        player
    })
}
TurnsMananger.prototype.end = function(pointer){
    this.turns[this.turns.length-1].pointer = pointer
}
function Player(name, hero, color, ai = false){
    this.name = name;
    this.hero = hero;
    this.color = color;
    this.ai = ai
}

function EventManager (app){
    document.querySelector('#game').addEventListener('click',(event)=>{
        if(!app.board[event.target.dataset.pointer]){
            app.board[event.target.dataset.pointer] = app.getCurrentPlayer().color
            app.turnsMananger.end(+event.target.dataset.pointer)
            if(app.checkWin())
                alert('胜者是～～～ ' + app.winner.name + ' 选择英雄:' + app.winner.hero)
            if(app.board.findIndex(el=>el===0)===-1)
                alert('和！')
            app.changePlayer()
            app.turnsMananger.start(app.getCurrentPlayer())
            if(app.getCurrentPlayer().ai){
                let bestChoicePointer = app.bestChoice()
                if(bestChoicePointer === -1){
                    let choiceables = []
                    app.board.forEach((item,index)=>{
                        if(item === 0)choiceables.push(index)
                    })
                    if(!choiceables.length) return
                    app.board[choiceables[0]] = 2
                    app.turnsMananger.end(choiceables[0])
                    app.changePlayer()
                    app.turnsMananger.start(app.getCurrentPlayer())
                }else{
                    app.board[bestChoicePointer] = 2
                    app.turnsMananger.end(bestChoicePointer)
                    app.changePlayer()
                    app.turnsMananger.start(app.getCurrentPlayer())
                }
                console.log('最佳的选择:',bestChoicePointer);
                if(app.checkWin()){
                    alert('胜者是～～～ ' + app.winner.name + ' 选择英雄:' + app.winner.hero)
                }
            }
        }
        // console.log(...app.board,app.turnsMananger.turns)
    })
}
// let effects = new Map()
// let currentEffect = null

// function effect(fn){
//     currentEffect = fn
//     fn()
//     currentEffect =null
// }
// function reactive (object) {
//     let observed = new Proxy(object,{
//         get(object, propety){
//             if(currentEffect){
//                 if(!effects.has(object))
//                     effects.set(object,new Map);
//                 if(!effects.get(object).has(propety))
//                     effects.get(object).set(propety, new Array)
//                 effects.get(object).get(propety).push(currentEffect)
//             }
//             return object[propety]
//         },
//         set(object, propety ,value){
//             object[propety] = value;
//             for(let effect of effects.get(object).get(propety)){
//                 effect()
//             }
//             return true
//         }
//     })
//     return observed
// }

window.app = new GameMananger(document.querySelector('#game'))

app.setup()
