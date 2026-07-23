import "./api.js"
import "./imgLoad.js"
import "./network.js"
import  { state }  from './init.js'
import { phi, wing } from "./api.js"
import { EntitySys } from "./entity.js" 
import { commonObjManager } from "./cobj.js"
import "./particle.js"
import "./motion.js"
import "./event.js"

// TINF.innerChunkId // 타일이 속한 청크내에서의 ID
// TINF.chunkId // 타일이 속한 청크의 ID
// TINF.id // 타일의 ID. 리스트 형대로 저장되고 [<청크내애서의_아이디1>,<청크내애서의_아이디2>,<청크>]

(async () => {
await isAllImgLoad



window.entity = new EntitySys()
let cobj = new commonObjManager(state.SCENE_LIST)



function resize(){
    phi.reSizeDisplay() // 화면 비율및 해상도 자동조정
    if (phi.nowScene === 'game_main') state.tileRelocation() // 타일재배치
}   
resize()

window.addEventListener('resize',()=>{
    resize()
})





cobj.add('menu_main','back',IMG.UI.main_back,[0,0])
cobj.add('menu_main','title',IMG.UI.main_title,[(IMG.UI.main_back.width-IMG.UI.main_title.width)/2,(IMG.UI.main_back.height-IMG.UI.main_title.height)/2 - 180])
cobj.add('menu_main','connect_btn',IMG.UI.server_banner_apple,[(IMG.UI.main_back.width-IMG.UI.server_banner_apple.width)/2,(IMG.UI.main_back.height-IMG.UI.server_banner_apple.height)/2 + 180])


cobj.add("game_main","inventory",IMG.UI.player_inventory,[
    ((phi.width/phi.screenRatio)-IMG.UI.player_inventory.width)/2,
    ((phi.height/phi.screenRatio)-IMG.UI.player_inventory.height)
])
cobj.add("game_main",'inventory_select',IMG.UI.player_inventory_select,
    (phi.width/phi.screenRatio-IMG.UI.player_inventory_select.width)/2,
    phi.height/phi.screenRatio-IMG.UI.player_inventory_select.height
)
cobj.add("error",'art',IMG.PAGE.error,[(phi.width-IMG.PAGE.error.width)/2,(phi.height-IMG.PAGE.error.height)/2],null)
cobj.add("game_die",'art',IMG.PAGE.game_die,[(phi.width-IMG.PAGE.game_die.width)/2,(phi.height-IMG.PAGE.game_die.height)/2],null)




phi.sceneChange('menu_main')
cobj.setScene(phi.nowScene)
wing.connect(`ws://${host}:${port}`);


cobj.scene('menu_main',(obj,name)=>{
    // //console .log('asd')
    if (name == 'connect_btn'){
        if (phi.isEncounterPos(obj,phi.mousepos) && state.click_l){
            phi.move(obj,[0,10])
        }
    }   
    phi.blit(obj)
})
phi.scene('menu_main',()=>{
    
})



cobj.scene('error',(obj,name)=>{
    phi.blit(obj)
})
phi.scene('error',()=>{
})




cobj.scene('game_die',(obj,name)=>{
    phi.blit(obj)
})
phi.scene('game_die',()=>{
})




cobj.scene('game_main',(obj,name)=>{
    if (name === 'inventory'){
        phi.blit(obj)
        for (let i in inventory){
            if (inventory[i] == null) continue;
            let itemObj = inventory_innereObj[i]
            itemObj.img = IMG.ITEM[inventory[i]]
            phi.goto(itemObj,[obj.x+(i*inventory_Interval)+18,obj.y+13])
            phi.blit(itemObj)
        }
        // //console .log(obj)
    }
    else if (name === 'inventory_select'){
        const obj_ = phi.obj(obj.img,[obj.x+(state.inventory_select*inventory_Interval)+36-inventory_Interval*5,obj.y-5],null) 
        phi.blit(obj_)
    }
})


phi.scene('game_main',()=>{
    // #region 키입력
    if (state.upKey){state.moveU = state.speed; } else {state.moveU = state.moveU * state.smooth;}
    if (state.leftKey){state.moveL  = state.speed;} else {state.moveL = state.moveL * state.smooth;}
    if (state.downKey){state.moveD  = state.speed;} else {state.moveD = state.moveD * state.smooth;}
    if (state.rightKey){state.moveR  = state.speed;} else {state.moveR = state.moveR * state.smooth;}
    // #endregion

    for (let index in state.TILE){
        let TINF = state.TILE[index]
        const obj = TINF.obj
        
        // 타일 물리엔진. 타일이 통과불가능 특성일때 플레이어가 통과하지 못하도록 막음.
        if (TINF.isBlock){
            phi.moveY(obj,wallCheckDistance)
            if (phi.isEncounterObj(obj,playerObj)){
                state.moveU = 0
            }
            phi.moveY(obj,-wallCheckDistance)

            phi.moveY(obj,-wallCheckDistance)
            if (phi.isEncounterObj(obj,playerObj)){
                state.moveD = 0
            }
            phi.moveY(obj,wallCheckDistance)

            phi.moveX(obj,-wallCheckDistance)
            if (phi.isEncounterObj(obj,playerObj)){
                state.moveR = 0
            }
            phi.moveX(obj,wallCheckDistance)
        
            phi.moveX(obj,wallCheckDistance)
            if (phi.isEncounterObj(obj,playerObj)){
                state.moveL = 0
            }
            phi.moveX(obj,-wallCheckDistance)
        }
        // #region 타일물리엔진
        // //console .log(state.moveX)
        phi.moveX(obj,state.moveLc); // 실제 이동량 적용
        phi.moveY(obj,-state.moveDc); // 실제 이동량 적용
        phi.moveY(obj,state.moveUc); // 실제 이동량 적용
        phi.moveX(obj,-state.moveRc); // 실제 이동량 적용

        // 타일이 화면 끝에 있을때 반대쪽화면으로 이동 하는 코드
        if (obj.x > (state.horTileCount*state.tileSize ) + state.adjX){
            phi.moveX(obj,-state.horTileCount*state.tileSize )
            TINF.horNum -= state.horTileCount
            state.tileRelaod(TINF)
            
        } else if (obj.x < state.adjX){
            phi.moveX(obj,state.horTileCount*state.tileSize )
            TINF.horNum += state.horTileCount
            state.tileRelaod(TINF)

        } else if (obj.y > state.verTileCount*state.tileSize  + state.adjY){
            phi.moveY(obj,-state.verTileCount*state.tileSize )
            TINF.verNum -= state.verTileCount
            state.tileRelaod(TINF)
        } else if (obj.y < state.adjY){ 
            phi.moveY(obj,state.verTileCount*state.tileSize )
            TINF.verNum += state.verTileCount
            state.tileRelaod(TINF) 
        }  
        TINF.innerChunkId = state.mod(TINF.verNum,state.chunkSize) * state.chunkSize + state.mod(TINF.horNum, state.chunkSize) // 타일이 속한 청크내에서의 ID
        TINF.chunkId = [Math.floor(TINF.horNum / state.chunkSize),Math.floor(TINF.verNum / state.chunkSize)] // 타일이 속한 청크의 ID
        TINF.id = [TINF.chunkId[0],TINF.chunkId[1],TINF.innerChunkId] // 타일의 ID. 리스트 형대로 저장되고 [<청크내애서의_아이디1>,<청크내애서의_아이디2>,<청크>]
        // #endregion
        
        // let isChangeBlock = [false,false]
        if (String(TINF.chunkId) in MAP_DATA){ // 청크데이터가 있는지 확인
            if (!state.renderLimitUse || state.renderLimitDistant > phi.distanceGetObj(obj,phi.obj(null,[phi.width/2/phi.screenRatio,phi.height/2/phi.screenRatio],[0,0]))){
                phi.blit(obj);
                // phi.text(`${TINF.isBlock}`,[obj.x+(obj.width/2) - 40,obj.y+(obj.height/2)],`${20*phi.screenRatio}px`,null,'center');
            }
            if (phi.isEncounterPos(obj,phi.mousepos)){
                renderTileSlecter([obj.x,obj.y])
                if (state.click_r){
                    if (window.inventory[state.inventory_select] != null && selectTile == 0 && phi.distanceGetObj(playerObj,obj) > state.tileSize ){
                        if (window.inventory[state.inventory_select] == 'plank_block'){
                            wing.send("playerItemRemove",{
                                'itemType':inventory[state.inventory_select],
                                'invenIndex':state.inventory_select,
                            })
                            wing.send("tileEdit",{
                                'mode':'build',
                                'id':TINF.id,
                                'pos':[state.moveX,state.moveY],
                                'tile':changedTile,
                            })
                        }
                    }
                }

                if (state.press_l && action == 'destroy'){
                    if (!destroy_flag){
                        destroyTimeStart = Date.now() + 2000
                        destroy_flag = true
                    }
                }
                
                if (destroyTimeStart < Date.now() && destroy_flag){
                    
                    window.particle('sculpture_1',[
                        obj.x + state.moveX - state.cameraAdjX + obj.width/2,
                        obj.y + state.moveY - state.cameraAdjY + obj.height/2
                    ],12,90)

                    wing.send("tileEdit",{
                        'mode':'destroy',
                        'id':TINF.id,
                        'pos':[obj.x + state.moveX - state.cameraAdjX + obj.width/2,
                            obj.y + state.moveY - state.cameraAdjY + obj.height/2],
                        'tile':0,
                    })
                    
                    TINF.TILE = 0
                    TINF.isBlock = false
                    // isChangeBlock  = [true,false]
                    destroy_flag = false
                    
                }
                if (!state.press_l || state.isMove){
                    destroy_flag = false
                }
            }
    
            const TILE_DATA = MAP_DATA[String(TINF.chunkId)][TINF.innerChunkId]; // 진짜 맵데이터
            const _TILE = state.MAP_DATA_TRANSLATOR[TILE_DATA.tile];
            
            if (_TILE != null){
                if (TINF.TILE == TILE_DATA.tile){
                    phi.goto(TINF.TILEOBJ,[obj.x,obj.y]);
                } else {
                    TINF.TILE = TILE_DATA.tile;
                    TINF.TILEOBJ = phi.obj(IMG.TILE[_TILE],[obj.x,obj.y],null);
                    phi.reSizeBy(TINF.TILEOBJ,state.tileRatio)
                }


                phi.move(TINF.TILEOBJ,[
                    -(TINF.TILEOBJ.width-state.tileSize )/2,
                    -TINF.TILEOBJ.height + state.tileSize *0.9,
                ])
                
                if (!state.renderLimitUse || state.renderLimitUse && state.renderLimitDistant > phi.distanceGetObj(TINF.TILEOBJ,phi.obj(null,[phi.width/2/phi.screenRatio,phi.height/2/phi.screenRatio],[0,0]))){
                    if (_TILE != null){
                        state.sortRender(TINF.TILEOBJ);
                    }
                } 
                TINF.isBlock = wallTile.includes(TINF.TILE) ? true : false;
            }
            
            // 현재 포커스중인 타일의 종류저장
            if (phi.isEncounterPos(obj,phi.mousepos)) {
                selectTile = TINF.TILE
            }

        } else {
            wing.send("noChunkData",String(TINF.chunkId))
            reqeustChunkId.push(String(TINF.chunkId)) // 중복요청 방지
        }
    }

    state.moveX -= state.moveL - state.moveR;
    state.moveY -= state.moveU - state.moveD;
    // 엔티티 시스템
    for (let key in entity.allEntity){
        let ntt = entity.allEntity[key];
        let obj = ntt.renderObj;

        // //console .log(ntt)

        phi.goto(obj,[
            ntt.pos[0]-obj.width/2 +(state.cameraAdjX+ state.cameraX),
            ntt.pos[1]-obj.height/2 +(state.cameraAdjY+ state.cameraY)
        ]);
        
        if (window.playerId == ntt.id){
            phi.goto(playerObj,[obj.x+playerObjSize[0]/2,obj.y + playerObjSize[1] - playerObj_thick])
        }

        if (ntt.type == 'player' && !obj.img){
            let nameText = ntt.name
            if (nameText.length > 15){
                nameText = nameText.slice(0,15) + '...'
            } 
            if (window.playerId == ntt.id){
                obj = ntt.motion.render([obj.x,obj.y],{
                    Rk:state.rightKey,Lk:state.leftKey,
                    isMv:state.isMove,
                    CL:state.click_l,CR:state.click_r,
                    PL:state.press_l,PR:state.press_r,
                    mousePos:phi.mousepos,
                    haveGun:action=='attack',
                    action:action
                })
                
            } 
            else {
                if (ntt.tag && 'motionKeyData' in ntt.tag){
                    // phi.text(`${nameText}`,[obj.x+playerSize[0]/2,obj.y-20],`${30*phi.screenRatio*state.tileRatio}px`,'black','Roboto sans-serif','center');
                    const motionData = ntt.tag['motionKeyData']         
                    obj = ntt.motion.renderOther([obj.x,obj.y],motionData.frame,motionData.isFlip,motionData.isMove)
                }
            }
            
            phi.text(`HP: ${ntt.health}`,[(obj.x+playerSize[0]/2)*phi.screenRatio,(obj.y-50)*phi.screenRatio],`${30*phi.screenRatio*state.tileRatio}px`,'black','Roboto sans-serif','center');
            phi.text(`${nameText}`,[(obj.x+playerSize[0]/2)*phi.screenRatio,(obj.y-20)*phi.screenRatio],`${30*phi.screenRatio*state.tileRatio}px`,'black','Roboto sans-serif','center');
            
        
        }
        else if (ntt.type == 'bullet'){
            phi.reSize(obj,[20,20])
            phi.rotate(obj,8)
            phi.move(obj,[-obj.width/2,-obj.height/2])
            if (ntt.tag.owner == playerId){
                for (let TINF of state.TILE){
                    const tileObj = TINF.obj
                    if (phi.distanceGetObj(obj,tileObj) > state.tileSize ) continue
                    if (TINF.isBlock && phi.isEncounterObj(obj,tileObj)){
                        wing.send("entityRemove",{
                            'itemId':ntt.id,
                        })
                    }
                }
            }
                
        } 
        else if (ntt.type == 'particle'){
            switch(ntt.tag.particleType){
                case('sculpture'):{
                    ntt.tag.adjX = ntt.tag.addX
                    if (20 > ntt.tag.adjY){
                        ntt.tag.gravity += 1
                        ntt.tag.adjY = ntt.tag.gravity
                    } else entity.removeEntity(ntt.id)
                    ntt.pos = [ntt.pos[0]+ntt.tag.adjX,ntt.pos[1]+ntt.tag.adjY]
                    phi.rotate(obj,1)
                    
                    if (obj.y > phi.height/phi.screenRatio*phi.dpr){
                        entity.removeEntity(ntt.id)
                    }
                    break
                }
                case('empty_shell'):{
                    ntt.tag.adjX = ntt.tag.addX
                    if (14 > ntt.tag.adjY){
                        ntt.tag.gravity += 1
                        ntt.tag.adjY = ntt.tag.gravity
                    } else entity.removeEntity(ntt.id)
                    
                    ntt.pos = [ntt.pos[0]+ntt.tag.adjX,ntt.pos[1]+ntt.tag.adjY]
                    phi.rotate(obj,4)
                    

                    break
                }
                case('bang'):{
                    ntt.tag.adjX = ntt.tag.addX
                    if (17 > ntt.tag.adjY){
                        ntt.tag.gravity += 1.5
                        ntt.tag.adjY = ntt.tag.gravity
                    } else entity.removeEntity(ntt.id)
                    ntt.pos = [ntt.pos[0]+ntt.tag.adjX,ntt.pos[1]+ntt.tag.adjY]
                    phi.reSizeBy(obj,0.87)
                    if (obj.y > phi.height/phi.screenRatio*phi.dpr){
                        entity.removeEntity(ntt.id)
                    }
                    break
                }
                case('gun_fire'):{
                    entity.removeEntity(ntt.id)
                    break
                }
                case('gun_fire_flip'):{
                    if (ntt.tag.flip){
                        phi.flip(obj,'hor')
                        ntt.tag.flip = false
                        
                    }
                    if (ntt.tag.delTime < Date.now()){
                        entity.removeEntity(ntt.id)
                    }
                    break
                }
                case('sculpture_1'):{
                    ntt.tag.adjX = ntt.tag.addX
                    if (11 > ntt.tag.adjY){
                        ntt.tag.gravity += 0.6
                        ntt.tag.adjY = ntt.tag.gravity
                    } else entity.removeEntity(ntt.id)
                    
                    ntt.pos = [ntt.pos[0]+ntt.tag.adjX,ntt.pos[1]+ntt.tag.adjY]
                    phi.rotate(obj,10)
                    break
                }
            }
        
        
        
        
        }
        else if (ntt.type == 'item'){
            if ( state.interaction && phi.distanceGetObj(obj,playerObj) < state.tileSize *0.8){
                wing.send(
                    'requestGetItem',{
                        'nttId':ntt.id,
                    }
                )
            }
        }
        else if (ntt.type == 'soldier'){
            const motionData = ntt.tag['motionKeyDasta']     
            // obj = ntt.motion.renderOther([obj.x,obj.y],motionData.frame,motionData.isFlip,motionData.state.isMove)
            const nttTag = ntt.tag
            obj = ntt.motion.renderNotPLayer('soldier',[obj.x,obj.y],nttTag['isFlip'],true)
        }
        
        if (ntt.type != 'particle') state.sortRender(obj)
        else state.particleRender(obj)

        if (window.playerId == ntt.id){
            ntt.pos = [state.moveX,state.moveY]
            wing.send(
                'playerData',
                {edit:["pos"],'pos':[state.moveX,state.moveY]}
            )
            wing.send(
                'playerMotionEdit',
                {'frame':ntt.motion.frame,'isFlip':ntt.motion.isFlip,'isMove':ntt.motion.isMove}
            )
            
            
            // ================================ SPEED CONTROL ========================= //
            if (state.attackCancelTime < Date.now()){
                state.speed = 65 * DT * state.tileRatio
            } else {
                state.speed = 30 * DT * state.tileRatio
            }
            // ================================ SPEED CONTROL ========================= //

            if (inventory[state.inventory_select] == 'gun'){
                action = 'attack'
            } else {
                if (state.attackCancelTime < Date.now()){
                    if (selectTile == 0){
                        action = 'build'
                    } else {
                        action = 'destroy'
                    }
                }
            }


            if (state.click_l && inventory[state.inventory_select] == 'gun' && action == 'attack'){
                if (gunFireDelay < Date.now()){
                    // #region  bullet 데이터보내기
                    state.attackCancelTime = Date.now() + 1200
                    
                    const centerX = obj.x + state.moveX + (obj.width / 2) - state.cameraAdjX ;
                    const centerY = obj.y + state.moveY + (obj.height / 2) - state.cameraAdjY;
                    const mouseWorldX = (phi.mousepos[0]) + state.moveX - state.cameraAdjX;
                    const mouseWorldY = (phi.mousepos[1]) + state.moveY - state.cameraAdjY;
                    const dx =  centerX - mouseWorldX;
                    const dy = centerY - mouseWorldY;
                    const rad = (-1* Math.atan2(dy, dx))

                    
                    let deg = rad * (180 / Math.PI) - 90
                    wing.send("entitySpwan",{
                        'entityPos':[centerX,centerY],
                        'entityDirection': deg,
                        'entityType':'bullet',
                    })
                    // #endregion

                    window.particle('empty_shell',[obj.width/2 + state.moveX,obj.height/2 + state.moveY],1,100)
                    if (ntt.motion.isFlip){
                        window.particle('gun_fire_flip',[obj.width/2 + state.moveX - 170,obj.height/2 + state.moveY-20],1,5)
                        window.particle('bang',[obj.width/2 + state.moveX-100,(-obj.height/2 + state.moveY + 120)],1,0)
                    } else {
                        window.particle('gun_fire',[obj.width/2 + state.moveX + 170,obj.height/2 + state.moveY-20],1,5)
                        window.particle('bang',[obj.width/2 + state.moveX+100,(-obj.height/2 + state.moveY + 120)],1,0)
                    }
                    state.cameraShake(70)
                    gunFireDelay = Date.now() + 70
                }
            }
            if (state.drop&& window.inventory[state.inventory_select] != null){
                wing.send("itemDrop",{
                    'itemType':inventory[state.inventory_select],
                    'invenIndex':state.inventory_select,
                    'itemPos':[
                        (phi.mousepos[0]) + state.moveX - state.cameraAdjX,
                        (phi.mousepos[1]) + state.moveY - state.cameraAdjY
                    ],
                })
                // window.inventory[state.inventory_select] = null
            }
        }
    }
    if (state.cameraRun){
        state.cameraMove(
            ((-state.moveX+state.cameraShakeX) - state.cameraX) / 8,
            ((-state.moveY+state.cameraShakeY) - state.cameraY) / 8,
        )  
    }
    
    state.objSortList = state.objSortList.sort((a,b) => (a.y + a.height) - (b.y + b.height));
    for (let obj of state.objSortList){
        // phi.goto(obj,[0,0])
        // phi.blit(obj);
        // console .log(obj.x,obj.y)
        phi.blit(obj);

    }

    state.objSortList = [];
    state.particleBlitList = state.particleBlitList.sort((a,b) => (a.y + a.height) - (b.y + b.height));
    for (let obj of state.particleBlitList) phi.blit(obj);
    state.particleBlitList = [];
    
    if (state.wheel > 0){
        state.inventory_select ++
        if (state.inventory_select > 9){
            state.inventory_select = 0
        }   
    } 
    else if (state.wheel < 0){
        state.inventory_select --
        if (state.inventory_select < 0){
            state.inventory_select = 9
        }   
    }2
    
    
    state.cameraShakeX += (0 - state.cameraShakeX) / 10
    state.cameraShakeY += (0 - state.cameraShakeY) / 10
    phi.goto(pointerObj,phi.mousepos)
    phi.blit(pointerObj)
})

phi.loop(() => {
    if (window.connect && !connect_flag){
        window.tmep = (Math.random())
        wing.signup(`${tmep}`,`${tmep}`)
        connect_flag = true
    }

    currentTime = performance.now();
    DT = (currentTime - lastTime)/100;
    if (DT > 2) DT = 2;

    if (!state.connectTrigger_flag && wing.nickname){
        wing.send('playerJoin',{});
        state.connectTrigger_flag = true
    }

    lastTime = performance.now();

    // 이전 프레임 시간 저장
    if (state.rightKey || state.leftKey || state.upKey || state.downKey) state.isMove = true
    else state.isMove = false
    
    
    phi.fill(0,0,0);
    
    if (phi.sceneChangeDetect){
        resize()
        cobj.setScene(phi.nowScene)
    }
    
    console.log(entity.getAll())

});

phi.end(()=>{
    // //console .log(inventory)
    cobj.update()
    if (state.wheel) state.wheel = 0;
    if (state.drop) state.drop=false;
    if (state.click_l) state.click_l=false;
    if (state.click_r) state.click_r=false;
    if (state.interaction) state.interaction=false;
    lastTime = currentTime;

})

})();


