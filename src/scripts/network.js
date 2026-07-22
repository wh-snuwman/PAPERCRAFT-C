import './game.js'
import "./particle.js"
import  { state }  from './init.js'
import { phi, wing } from "./api.js"

(async () => {
    await isAllImgLoad
    const tmep = (Math.random())
    
    wing.close(()=>{
        if (wing.isManualClose){
        } else {
            phi.sceneChange('error')
        }
    });

    wing.error((error)=>{
        isOnlineError = true
        phi.sceneChange('error')
    });
    
    wing.recv((recvData)=>{
        const CODE = recvData.code // code은 무조건 받음.
        const DATA = recvData.data
        switch(CODE){
            case('chunkData'):{ // 게임내의 청크데이터 불러오기
                const chunkId = DATA.chunkId;
                window.MAP_DATA[chunkId] = DATA.data;
                    // console.log(window.MAP_DATA[chunkId])
                break;

            }
            case('playerJoin'):{ // 플레이어가 참가했을때 최초로 실행되는 코드
                const id = DATA.id
                const name = DATA.ntt.name
                const pos = DATA.ntt.pos
                const tag = DATA.ntt.tag
                const inventory = DATA.ntt.inventory
                
                if (DATA.me){
                    playerId = id
                    join = true
                    window.inventory = inventory
                    isFinishLoading = true
                } 
                let n = new window.motion('player')
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
                const TAG = DATA.tag;
                for (let editCODE of EDIT){
                    if (editCODE == 'pos'){
                        if (ID != playerId){
                            try{
                                entity.editEntity(ID,'pos',POS)
                            } catch(e){
                                null
                            }
                        }
                    }
                    else if (editCODE == 'tag') {
                        entity.editEntity(ID,'tag',TAG)
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
                const chunkId = [id[0],id[1]]
                window.MAP_DATA[chunkId][id[2]] = tileData
                for (let index in state.TILE){
                    const TINF = state.TILE[index]

                    if (mode == 'destroy'){
                        if ( JSON.stringify(id) == JSON.stringify(TINF.id) ){
                            let obj = TINF.obj
                            TINF.isBlock = false
                            TINF.TILE = 0
                        }
                    }
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
                    window.entity.newEntity(
                        type,name,pos,{},tag,id,img
                    ); 
                }
                if (type == 'soldier'){
                    img = window.IMG.PLAYER[7]
                    tag['motionKeyData'] = ''
                    let n = new window.motion()
                    entity.newEntity(
                        type,name,pos,n,tag,id,img
                    ); 
                }
                
                // console.log(size_)
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
                    state.cameraShake(40)

                    if (ntt.health <= 0){
                        phi.sceneChange('game_die')
                        wing.disconnect()
                    }
                } else {
                    const w = ntt.motion.retObj.width
                    const h = ntt.motion.retObj.height
                    window.particle('sculpture',[
                        ntt.pos[0]+w/2,
                        ntt.pos[1]+h/2
                    ],3,100)
                    state.cameraShake(20)

                }
                break;
                
            }
            case('playerGetItem'):{
                const playerId = DATA.playerId; 
                const itemId = DATA.id;
                if (playerId == window.playerId){
                    inventoryAdd(entity.get(itemId).tag.itemType)
                }
                entity.removeEntity(itemId)
                break;
            }
            case('playerItemRemove'):{
                const index = DATA.index
                const id = DATA.id
                if (id == window.playerId){
                    window.inventory[index] = null
                }
                
                
                break;
            }
        }
    })
    

    wing.start(()=>{
        // console.log('asdasdasd')
        window.connect = true
    })

    wing.signupOk(()=>{
        wing.login(`${window.tmep}`,`${window.tmep}`)
    })

    wing.loginOk(()=>{
        phi.sceneChange('game_main')
        // console.log('i love code')
    })



})(); 