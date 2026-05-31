import {wingAPI} from "../../wingAPI/src/script/wingAPI.js"
import "./imgLoad.js"
import './game.js'
import "./particle.js"

(async () => {
    //====== DEV =======
    window.isDev = true;
    //==================

    window.wing = new wingAPI();
    window.startLoadFinish = false // 게임파일의 완전한 로딩 끝남 여부
    window.playerId = ''//  내 아이디 
    window.clientId = ''// 클라이언트 고요 ID
    window.join = false
    window.isLogin = false
    window.host = ''
    if (isDev) window.host = 'localhost'
    else window.host = 'papversus.com'
    window.port = 4000
    window.isOnlineError = false
    window.isFinishLoading = false
    const tmep = (Math.random())


    wing.start(()=>{
        window.SCENE = 'game_main'
    })

    wing.close(()=>{
        if (wing.isManualClose){
            // window.SCENE = 'close'd
        } else {
            window.SCENE = 'error'
        }
    });

    wing.error((error)=>{
        isOnlineError = trued
        window.SCENE = 'error'
        // console.error(error)
    });
    
    wing.recv((recvData)=>{
        const CODE = recvData.code // code은 무조건 받음.
        const DATA = recvData.data

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
                const inventory = DATA.ntt.inventory
                
                if (DATA.me){
                    playerId = id
                    join = true
                    window.inventory = inventory
                    isFinishLoading = true
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
            case("entityDataEdit"):{ // 엔티티의 부가적인 모든 데이터를 수정하기 위해 서버에서 받는 신뢰성이 보장되어야 하는 명령
                const EDIT = DATA.edit;
                const POS = DATA.pos;
                const ID = DATA.id;
                for (let editCODE of EDIT){
                    if (editCODE == 'pos'){
                        if (ID != playerId){
                            try{
                                entity.editEntity(ID,'pos',POS)
                            } catch(e) {
                                null
                            }
                        }
                    }
                }
                break;



            }
            case("itemSpwan"):{
                const itemType = DATA.itemType
                const itemPos = DATA.itemPos
                const itemId = DATA.itemId
                window.entity.newItem(itemType,itemPos,itemId)
                break;
            }
            case("tileEdit"):{
                const mode = DATA.mode
                const id = DATA.id

                const tileData = DATA.tileData
                const chunkId = `${id[0]},${id[1]}`
                window.MAP_DATA[chunkId][id[2]] = tileData
                // console.log(window.MAP_DATA[chunkId][id[2]])
                // TINF.TILE = 0
                
                for (let index in window.TILE){
                    const TINF = window.TILE[index]
                    TINF.isBlock = false
                    // TINF.TILE = MAP_DATA[String(TINF.chunkId)][TINF.innerChunkId]
                }
                break;
            }
            case('entitySpwan'):{
                const name = DATA.name
                const id = DATA.id
                const pos = DATA.pos
                const tag = DATA.tag
                const type = DATA.type
                let img = null
                if (type == 'bullet'){
                    img = window.IMG.ENTITY.bullet
                }
                window.entity.newEntity(
                    type,name,pos,{},tag,id,img
                ); 
                break;
            }
            case('entityRemove'):{
                window.entity.removeEntity(DATA.id)
                break;
            } 
            case('playerMotionEdit'):{
                const id = DATA.id
                if (DATA.id == playerId)break;
                entity.editEntityTag(id,'motionKeyData',DATA)
                
                
                break;  
                
            }
            case('playerHealthChange'):{
                const id = DATA.id
                const mode = DATA.mode
                const health = DATA.health
                const ntt = entity.get(id)
                ntt.health = health

                if (id == playerId){
                    const w = ntt.motion.retObj.width
                    const h = ntt.motion.retObj.height
                    window.particle('sculpture',[
                        ntt.pos[0]+w/2,
                        ntt.pos[1]+h/2
                    ],3,100)
                    window.cameraShake(40)

                    if (ntt.health <= 0){
                        window.SCENE = 'game_die'
                        wing.disconnect()
                    }
                } else {
                    const w = ntt.motion.retObj.width
                    const h = ntt.motion.retObj.height
                    window.particle('sculpture',[
                        ntt.pos[0]+w/2,
                        ntt.pos[1]+h/2
                    ],3,100)
                    window.cameraShake(20)

                }
                break;
            }
            case('playerGetItem'):{
                const playerId = DATA.playerId; 
                const itemId = DATA.id;
                inventoryAdd(entity.get(itemId).tag.itemType)
                entity.removeEntity(itemId)
                break;
            }
        }
    })
    
    if (isDev)await wing.connect(`ws://${host}:4000`);
    else await wing.connect(`wss://${host}/ws`);
    wing.signup(`${tmep}`,`${tmep}`)
    wing.login(`${tmep}`,`${tmep}`)
    // wing.signup('1234','1234')
    // wing.login('1234','1234')

    if (!window.isDev){   
        setInterval(function() {
            debugger;
        });
        
        document.addEventListener('contextmenu', event => event.preventDefault());
        document.addEventListener('keydown', function(e) {
          if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'U')
          ) {
            e.preventDefault();
          }
        });
    }
})(); 