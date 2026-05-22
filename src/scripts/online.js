import {wingAPI} from "../../wingAPI/src/script/wingAPI.js"
import './game.js'
// import './entity.js'

(async () => {
    window.paper = new wingAPI();
    window.startLoadFinish = false // 게임파일의 완전한 로딩 끝남 여부
    window.playerId = ''//  내 아이디 
    window.clientId = ''// 클라이언트 고요 ID
    window.join = false
    window.isLogin = false
    await paper.connect('localhost',1111);

    paper.signup('hello','12341234')
    paper.login('hello','12341234')

    paper.recv((recvData)=>{
        const CODE = recvData.code // code은 무조건 받음.
        const DATA = recvData.data

        // if (CODE != 'chunkData') {
        //     console.log(CODE,DATA)
        // }

        switch(CODE){
            case('chunkData'):{ // 게임내의 청크데이터 불러오기
                const chunkId = DATA.chunkId;
                window.MAP_DATA[ chunkId] = DATA.data;

                break;
            }
            case('playerJoin'):{ // 플레이어가 참가했을때 최초로 실행되는 코드
                const name = DATA.ntt.name
                const id = DATA.ntt.id
                const pos = DATA.ntt.pos
                const tag = DATA.ntt.tag
                // console.log(DATA.ntt)
                if (DATA.me){
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
                if (DATA == window.playerId){
                    window.location.reload()   
                }
                window.entity.removeEntity(DATA)
                break;
            } 
            case('loadComplete'):{ // 게임내에서 완전히 로딩이 끝나면 수신받는 명령
                clientId = DATA.objid
                startLoadFinish = true;
                paper.send('playerJoin',{id:clientId})
                break;
            }   
            case("entityDataEdit"):{
                // 엔티티의 부가적인 모든 데이터를 수정하기 위해 서버에서 받는 신뢰성이
                // 보장되어야 하는 명령
                const EDIT = DATA.edit;
                const ID = DATA.id;
                
                for (let editCODE of EDIT){
                    if (editCODE == 'pos'){
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
                const itemCODE = DATA.itemCODE
                const itemPos = DATA.itemPos
                const itemId = DATA.itemId
                window.entity.newItem(itemCODE,itemPos,itemId)
                // console.log(itemPos)
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
                const code = DATA.code
                let renderObj = null
                
                if (code == 'bullet'){
                    renderObj = window.IMG.ITEM['apple']
                }
                window.entity.newEntity(
                    code,name,pos,{},tag,id,renderObj
                ); 
            }
            case('entityRemove'):{
                window.entity.removeEntity(DATA)
                break;
            } 
            break;

        }

    })

})(); 

document.addEventListener('keydown',(e)=>{
    if (e.key == 'a'){
        // console.log(MAP_DATA)
    }
})