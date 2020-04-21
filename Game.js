
// 블록을 소유하는 마스터 객체
const Game = (() => {
    // 게임은 본체이므로 한개만 있으면 되기 때문에 싱글톤 => 굳이 클래스로 만들게 아니라 오브젝트로 
    // 초기화 - 필요한 정보를 바탕으로 게임 본체를 생성 => 외부 : 이것만 노출
    // 렌더 - 그림을 갱신 => 내부 
    // 이벤트 관련 - 각 블록에서 이벤트 처리 => 내부
    const column = 8;
    const row = 8;
    const blockSize = 80;
    const data = [];  // 완전한 인메모리 객체 : 메모리에서만 존재
    let table;
    
    

    const el = tag => document.createElement(tag);
    // dom을 다루는 더러운 일은 여기서만
    const render = _ => {
        table.innerHtml = ""; // tr 생성
        data.forEach(row =>
            table.appendChild(
                row.reduce((tr, block) => {
                    tr.appendChild(el("td")).style.cssText = `
                    ${block ? `background:${block.image};` : ""}
                    width:${blockSize}px;
                    height:${blockSize}px;
                    border-radius:100%;
                    cursor:pointer`;
                    return tr;
                }, el("tr"))
            )
        );
    };

    let startBlock;
    let currBlock;
    let isDown;
    const selected = [];
    // 마우스의 x, y 좌표를 인메모리 객체로 변환
    // 핵심은 네이티브 데이터를 필요한 부분만 추려내서 즉시 인메모리로 전환!!! => 나머지 로직은 인메모리에서 수용 가능
    const getBlock = (x, y) => {
        const { top: T, left: L } = table.getBoundingClientRect(); // 화면상 도형의 x,y 경계면을 얻을 수 있다. => 테이블(큰 네모)의 좌표 정보, 각 블록의 좌표 정보가 아니다. 
        // 테이블 안에 값이 있는지 확인 => 없으면 null
        if (x < L || x > (L + blockSize * row) || y < T || y > (T + blockSize * column)) return null;
        return data[parseInt((x - L) / blockSize)][parseInt((y - T) / blockSize)]; // X, Y
    };
    const down = ({ pageX: x, pageY: y }) => {
        // down 된 상태를 활성 => up되었을 때 해제
        // s, y로 붜 block 데이터를 얻음
        // 위에서 얻은 블록을 시작블록, 현재블록으로 설정하고 선택 목록에 포함
        if (isDown) return;
        const curr = getBlock(x, y); // x, y 좌표로 블록을 얻음
        if (!curr) return;
        isDown = true;
        selected.length = 0;
        selected[0] = startBlock = currBlock = curr;
        // 첫번쨰 블록을 선택 후 그림을 그림
        render();
    };

    const isNext = curr => {
        let r0,c0,r1,c1,cnt = 0;
        data.some((row, i) => {
            let j;
            if ((j = row.indexOf(currBlock)) != -1) r0 = i, c0 = j, cnt++; // down 시 block 
            if ((j = row.indexOf(curr)) != -1) r1 = i, c1 = j, cnt++; // move 시 block 
            return cnt == 2;
        });
        return curr != currBlock || Math.abs(r0 - r1) == 1 ||Math.abs(c0 - c1) == 1
    };
    const move = ({ pageX: x, pageY: y }) => {
        // down이 아니면 이탈
        if (!isDown) return;
        // x,y 위치의 블록을 얻음
        const curr = getBlock(x, y);
        // 블록의 타입이 같고 인접되어 있는지 검사
        // startblock : 처음 선택한 블록의 타입 ex> 라이언을 선택하면 계속 라이언이어야 함  
        if (!curr || curr.type != startBlock.type || !isNext(curr)) return; // rows를 8번 돌면서 선택한 블럭이 있는지 확인한다 
        // 위에서 얻을 블록이 선택 목록에 없으면 추가
        if (selected.indexOf(curr) == -1) selected.push(curr); // indexOf 왼쪽부터 찾는다. 
        // 있다면 전전 블록일 경우 하나 삭제
        else if (selected[selected.length - 2] === curr) selected.pop();
        currBlock = curr;
        render();
    };

    

    const up = _ => {
        // down을 해제
        // 선택 목록이 3이상이면 삭제
        // 2이하이면 reset
        selected.length > 2 ? remove() : reset();
    };
    const reset = _ => {
        // 쉬운거 먼저 짠다
        // 복잡한거 먼저 짜면 의존성 많이 생김
        startBlock = currBlock = null;
        selected.length = 0;
        isDown = false;
        render();
    };
    const remove = _ => {
        // 데이터 삭제
        data.forEach(r => {
            selected.forEach(v => {
                let i;
                if ((i = r.indexOf(v)) != -1) r[i] = null;
            });
        });
        render();
        setTimeout(drop, 300);
    };

    const drop = _ => {
        // column을 돌면서 row를 계산해서 공간을 채움
        let isNext = false;
        // 모든 것들을 한칸씩 떨어뜨리고, 더 이상 안떨어지는 애들은 놔두고 더 떨어질 애들은 다음 턴에 떨어뜨린다 
        // column별로 돌면서 더 떨어뜨릴 애가 있는지 확인
        for (let j = 0; j < column; j++) {
            // 밑에부터 검사
            // 밑에가 비어있으면 떨어뜨림
            for (let i = row - 1; i > -1; i--) {
                if (!data[i][j] && i) {
                    let k = i;
                    let isEmpty = true;
                    // 한줄이 다 비어 있으면 할 거 없으니 다음으로
                    // 자기가 구멍인데 위어 뭔가 있다
                    while (k--) if (data[k][j]) {
                        isEmpty = false;
                        break;
                    }
                    if (isEmpty) break;
                    isNext = true;
                    while (i--) {
                        data[i + 1][j] = data[i][j];
                        data[i][j] = null;
                    }
                    break;
                }
            }
        }
        // render();
        isNext ? setTimeout(drop, 30) : readyToFill();
    };

    const fills = [];
    let fillCnt = 0;
    const readyToFill = _ => {
        // 바깥에서 부터 채워야 할 애들으 예쁘게 내려오도록 하기 위해 
        // 만약 n자로 지웠다면 위에서 n자로 생긴 블록이 기다리고 있어야 함 
        fills.length = 0;
        data.some(row => {
            // 다 채워졌으면 끝
            if (row.indexOf(null) == -1) return true;
            const rowTemp = [...row].fill(null);
            fills.push(rowTemp);
            row.forEach((v, i) => !v && (rowTemp[i] = Block.GET()));
        });
        fillCnt = 0;
        setTimeout(fill, 300);
    };

    const fill = _ => {
        // 다돌렸을 때
        if (fillCnt > fills.length) {
            isDown = false;
            return;
        }
        for (let i = 0; i < fillCnt; i++) {
            fills[fills.length - i - 1].forEach((v, j) => {
                if (v) data[fillCnt - i - 1][j] = v;
            });
        }
        fillCnt++; // 한칸, 두칸 ...
        render();
        setTimeout(fill, 300);
    };

    return tid => {
        table = document.querySelector(tid);
        for (let i = 0; i < row; i++) {
            const r = [];
            data.push(r);
            for (let j = 0; j < column; j++) r[j] = Block.GET();
        }
        // 테이블에 이벤트
        table.addEventListener("mousedown", down);
        table.addEventListener("mouseup", up);
        table.addEventListener("mouseleave", up);
        table.addEventListener("mousemove", move);
        render();
    };
})();

Game("#stage");
