const Game = (() => {
    let isDown, startBlock, currBlock; 
    const selected = [];
    const down = ({pageX:x,pageY:y}) =>{
        if(isDown) return;
        const curr = getBlock(x,y)
        if(!curr) return;
        isDown = true;
        selected.length = 0;
        selected[0] = startBlock = currBlock = curr;
        render();
    }
    const getBlock =(x,y) =>{
        const {top:T, left:L} = table.getBoundingClientRect();
        const isOutOfLeft = x < L;
        const isOutOfRight = x > L + blockSize * row; 
        const isOutOfTop = y < T;
        const isOutOfBottom = y > T + blockSize * column;
        if(isOutOfLeft || isOutOfRight || isOutOfTop || isOutOfBottom) return null;
        const axisX = parseInt((x - L) / blockSize)
        const axisY = parseInt((y - T) / blockSize)
        return data[axisY][axisX];
    }

    const move = ({pageX:x, pageY:y}) => {
        if(!isDown) return;
        const curr = getBlock(x,y)
        const isDiffType = curr.type != startBlock.type;
        if(!curr || isDiffType || !isNext(curr)) return;
        if(selected.indexOf(curr) == -1) selected.push(curr)
        else if(selected[selected.length - 2] == curr) selected.pop();
        currBlock = curr;
        render();
    }
    const isNext = curr => {
        let startRowIdx,startColumnIdx,currRowIdx,currColumnIdx,count = 0;
        data.some((row,index)=>{
            console.log(`[index] status currBlock startRowIdx startColumnIdx count`)
            // row 
            let startIndex = row.indexOf(currBlock);
            if(startIndex != -1) {
                startRowIdx = index, 
                startColumnIdx = startIndex; 
                count++;
                console.log(`[${index}] \tstart \t${currBlock.type}\t\t\t${startRowIdx}\t\t\t${startColumnIdx}\t\t\t${count}`)
            }
            let currIndex = row.indexOf(curr);
            if(currIndex != -1) {
                currRowIdx = index, 
                currColumnIdx = currIndex, 
                count++;
                console.log(`[${index}] \tcurr \t${curr.type}\t\t\t${currRowIdx}\t\t\t${currColumnIdx}\t\t\t${count}`)
            }
            console.log('-----------------------------------------------------------')
            return count == 2;
        })
        const isSameBlock = curr == currBlock
        const isOneLeftRight = Math.abs(startColumnIdx - currColumnIdx) == 1
        const isOneTopBottom = Math.abs(startRowIdx - currRowIdx) == 1
        return  !isSameBlock || isOneLeftRight || isOneTopBottom;
    }

    const up = _ => {
        selected.length > 2 ? remove() : reset();    
    }
    const leave = _ => {console.log("leave!")}

    const reset = _ =>{
        startBlock = currBlock = null;
        selected.length = 0;
        isDown = false;
        render();
        
    }
    const remove = _ =>{
        data.forEach(row => {
            selected.forEach(block =>{
                let i = row.indexOf(block);
                if(i != -1) row[i] = null;
            })
        })
        render();
        setTimeout(drop, 300)
    }

    const drop = _=>{
        let isNext = false;
        for(let c = 0; c < column; c++){
            for(let r = row - 1; r > -1; r--){
                if(!data[r][c] && r){
                    let rowTemp = r;
                    let isEmpty = true;
                    while(rowTemp--) if(data[rowTemp][c]){
                        isEmpty = false;
                        break;
                    }
                    if(isEmpty) break;
                    isNext = true;
                    while(r--){
                        data[r + 1][c] = data[r][c];
                        data[r][c] = null;
                    }
                    break;
                }
            }
        }
        render();
        isNext ? setTimeout(drop, 300) : readyToFill();
    }

    const fill = []
    let fillCnt = 0;
    const readyToFill = _ => {
        fill.length = 0;
        data.some(row => {
            if(row.indexOf(null) == -1) return true;
            const rowTemp = [...row].fill(null)
            fill.push(rowTemp);
            row.forEach((block, i) => !block && (rowTemp[i] = Block.GET()))
        })
        fillCnt = 0;
        setTimeout(fills,300)
    }
    const fills = _ => {
        if(fillCnt > fill.length){
            isDown = false;
            return
        }
        for(let i = 0; i < fillCnt; i++){
            const rowTemp = fill.length - i - 1
            fill[rowTemp].forEach((columTemp,idx)=>{
                const row = fillCnt -i -1;
                const column = idx;
                if(columTemp) data[row][column] = columTemp;
            })
        }
        fillCnt++;
        render();
        setTimeout(fills,300)
    }




    const el = tag => document.createElement(tag)
    const render = _ => {
        table.innerHTML = "";
        data.forEach(row => 
            table.appendChild(
                row.reduce((tr,block)=>{
                    tr.appendChild(el('td')).style.cssText = `
                    ${block ? `background:${block.image};`:''}
                    width:${blockSize}px;
                    height:${blockSize}px;
                    cursor:pointer
                    `
                    return tr;
                },el('tr'))
            ))
    }

    const column = 8;
    const row = 8;
    const data = [];
    const blockSize = 60;
    let table;

    

    return tid => {
        for(let i = 0; i < row; i++){
            const row = [];
            data.push(row);
            for(let j = 0; j < column; j++){
                row[j] = Block.GET();
            }
        }
        table = document.querySelector(tid);
        table.addEventListener("mousedown", down);
        table.addEventListener("mouseup", up);
        table.addEventListener("mouseleave", leave);
        table.addEventListener("mousemove", move);
        // console.log(data)
        render();
    }
    

})()

Game("#stage")

const log =data=>{
    const list =['screenX','clientX','pageX','x','offsetX','layerX']
    const result = list.reduce((acc, curr)=>{
        acc = `${acc} ${curr} : ${data[curr]}\n`
        return acc;
    },'')
    // console.log(result)
}

