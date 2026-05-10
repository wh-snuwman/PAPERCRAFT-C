import {paperSignal} from "../../@paperSignal/src/script/paperSignal.js"
import './game.js'
// import './entity.js'

(async () => {
    window.paper = new paperSignal();
    window.startLoadFinish = false // 게임파일의 완전한 로딩 끝남 여부
    window.playerId = ''//  내 아이디 
    window.clientId = ''// 클라이언트 고요 ID
    window.join = false
    await paper.connect('ws://localhost:8080');
    paper.recv((recvData)=>{
        const TYPE = recvData.type // type은 무조건 받음.
        const DATA = recvData.data
        
        switch(TYPE){
            case('chunckData'):{ // 게임내의 청크데이터 불러오기
                const chunckId = DATA.chunckId;
                window.MAP_DATA[chunckId] = DATA.data;
                break;
            }
            case('playerJoin'):{ // 플레이어가 참가했을때 최초로 실행되는 코드
                const name = DATA.name
                const id = DATA.id
                const pos = DATA.pos
                const tag = DATA.tag
                if (recvData.me){
                    playerId = id
                    join = true
                } 

                let n = new window.motion()
                window.entity.newEntity(
                    'player',name,pos,n,tag,id
                ); 
                break;
            }
            case('playerLeft'):{
                // DATA = entity(player) id
                window.entity.removeEntity(DATA)
                break;
            } 
            case('loadComplete'):{ // 게임내에서 완전히 로딩이 끝나면 수신받는 명령
                clientId = DATA.objid
                startLoadFinish = true;
                paper.send({
                    "type":'playerJoin',
                    'data':clientId,
                })
                break;
            }   
            case("entityDataEdit"):{
                // 엔티티의 부가적인 모든 데이터를 수정하기 위해 서버에서 받는 신뢰성이
                // 보장되어야 하는 명령
                const EDIT = DATA.edit;
                const ID = DATA.id;
                
                for (let editType of EDIT){
                    if (editType == 'pos'){
                        if (ID != playerId){
                            entity.editEntity(ID,'pos',DATA.pos)
                            // try{
                            //     // console.log('⭐성공')
                            // } catch {
                            //     console.log(entity.get(ID))
                            // }
                        }
                            

                    }
                    // elif 써서 다른 데이터 처리하기
                }
                break;
            }
            case("itemSpwan"):{
                const itemType = DATA.itemType
                const itemPos = DATA.itemPos
                const itemId = DATA.itemId
                window.entity.newItem(itemType,itemPos,itemId)
                console.log(itemPos)
                break;
            }
            case("tileEdit"):{
                const mode = DATA.mode
                const id = DATA.id
                const tileData = DATA.tileData
                const chunkId = `${id[0]},${id[1]}`
                MAP_DATA[chunkId][id[2]] = tileData
                break;
            }
            case('entitySpwan'):{
                const name = DATA.name
                const id = DATA.id
                const pos = DATA.pos
                const tag = DATA.tag
                const type = DATA.type
                let renderObj = null
                
                if (type == 'bullet'){
                    renderObj = window.IMG.ITEM['apple']
                }
                window.entity.newEntity(
                    type,name,pos,{},tag,id,renderObj
                ); 
            }
        }

    })

})(); 

document.addEventListener('keydown',(e)=>{
    if (e.key == 'a'){
        // console.log(MAP_DATA)
    }
})