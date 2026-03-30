import {paperSignal} from "/@paperSignal/src/script/paperSignal.js"

(async () => {
    window.paper = new paperSignal();
    window.startLoadFinish = false // 게임파일의 완전한 로딩 끝남 여부
    window.playerId = ''//  내 아이디 
    window.clientId = ''
    window.join = false
    await paper.connect('ws://localhost:8080');

    

    paper.recv((recvData)=>{
        // console.log(window.entity)
        const TYPE = recvData.type // type은 무조건 받음.
        const DATA = recvData.data
        // const entity = window.entity
        // console.log(DATA)

        switch(TYPE){
            case('chunckData'):{
                const chunckId = recvData['data2'];
                window.MAP_DATA[chunckId] = recvData['data'];
                reqeustChunckId.pop(chunckId);
                break;
            }
            case('playerJoin'):{
                const name = DATA.name
                const id = DATA.id
                const pos = DATA.pos
                const tag = DATA.tag
                if (recvData.me){
                    playerId = id
                    join = true
                }

                window.entity.newEntity(
                    'player',name,pos,tag,{},id
                );

                break;
            }
            case('loadComplete'):{
                clientId = DATA.objid
                startLoadFinish = true;
                paper.send({
                    "type":'playerJoin',
                    'data':clientId,
                })
                break;
            }
            
        }
        
        
    })

})();