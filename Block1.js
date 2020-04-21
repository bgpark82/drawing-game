class Block {
    constructor(type){
        this._type = type;
    }
    get image(){
        return `url('img/${this._type}.png')`;
    }
    get type(){
        return this._type;
    }
}
Block.GET = (type = parseInt(Math.random() * 5)) => new Block(type)