import "./phiInit.js" // webgl2 기반 그래픽조정  모듈
// import "./imgLoad.js" // webgl2 기반 그래픽조정  모듈
import "./online.js" // webgl2 기반 그래픽조정  모듈
import "./particle.js"
import "./motion.js"
import { EntitySys } from "./entity.js" // webgl2 기반 그래픽조정  모듈

(async () => {

// #region
window.MAP_DATA_TRANSLATOR = {
    0 : null,
    1 : 'chest',
    2 : 'tree_m',
    3 : 'tree_s',
    4 : 'plank',
    5 : 'craft_table',
    6 : 'bush',
    7 : 'plank_block',

}

window.SCENE = 'error'; // 현재장면

const SCENE_LIST = [ // 모든 장면을 처음에 선언(장면사용시 필수)
    'menu_start','menu_main','menu_load',
    'game_main',
    'error',
    'game_die'
]
const SCENE_INF = {}// 장면전환,플래그등 장면에 대한 부가정보 저장
for (let scene of SCENE_LIST){
    SCENE_INF[scene] = {
        'reset_flag' : false,
        'sub_scene' : '',
    }
}

let COBJ = { // Common OBJ. 자동으로 그려지고 위치가 조정되는 OBJ를 저장.
    'menu_start':{ // 이코드에서는 선언과 이미지적용만 한다
        back : phi.obj(IMG.UI.main_back,[0,0]), 
        title : phi.obj(IMG.UI.main_title,[0,0]),
        list_btn : phi.obj(IMG.UI.common_msgbox,[0,0]),
        // title : phi.obj(IMG.UI.main_title,[0,0]),
    },
    "game_main":{
        inventory : phi.obj(IMG.UI.player_inventory,[phi.width/phi.screenRatio-IMG.UI.player_inventory.width,phi.height/phi.screenRatio-IMG.UI.player_inventory.height],null),
        inventory_select : phi.obj(IMG.UI.player_inventory_select,[0,0],null)
    },
    'error':{
        art : phi.obj(IMG.PAGE.error,[(phi.width-IMG.PAGE.error.width)/2,(phi.height-IMG.PAGE.error.height)/2],null)
    },
    'game_die':{
        art : phi.obj(IMG.PAGE.game_die,[(phi.width-IMG.PAGE.game_die.width)/2,(phi.height-IMG.PAGE.game_die.height)/2],null)

    }
}

function CBOJ_RESIZE(){ // COBJ에서 장면에 따라 위치가 자동으로 조정되게 하는 함수.  
    const sr = phi.screenRatio
    phi.goto(COBJ['menu_start'].back,[(phi.width/sr-IMG.UI.main_back.width)/2,(phi.height/sr-IMG.UI.main_back.height)/2])
    phi.goto(COBJ['menu_start'].title,[(phi.width/sr-IMG.UI.main_title.width)/2,((phi.height-IMG.UI.main_title.height)/2/sr)])
    phi.goto(COBJ['menu_start'].list_btn,[(phi.width/sr-IMG.UI.common_msgbox.width)/2,phi.height/sr*0.6]) 
    phi.goto(COBJ['game_main'].inventory,[
        (phi.width/phi.screenRatio-IMG.UI.player_inventory.width)/2,
        phi.height/phi.screenRatio-IMG.UI.player_inventory.height
    ])
    phi.goto(COBJ['game_main'].inventory_select,[
        (phi.width/phi.screenRatio-IMG.UI.player_inventory_select.width)/2,
        phi.height/phi.screenRatio-IMG.UI.player_inventory_select.height
    ])
    phi.goto(COBJ['error'].art,[0,0])
    phi.goto(COBJ['game_die'].art,[0,0])
}

CBOJ_RESIZE() 
window.addEventListener('resize',()=>{
    phi.reSizeDisplay() // 화면 비율및 해상도 자동조정
    CBOJ_RESIZE() // 자동 위치재조정
    tileRelocation() // 타일재배치
})

// #endregion

// #region 기본선언
function tileRelaod(tile){tile.isBlock = false}; // 게임내의 시스템에서 사용하는 타일특성 초기화 함수
function mod(n, m){return ((n % m) + m) % m;}// % 보정함수. 나머지가 음수여도 다시양수로 변환.ex) (-1 % 5 = -1 [x]) => (-1 % 5 = 4 [o])
window.mousePos = [0,0]; // 마우스좌표
let click_l = false; // 클릭여부(한번)
let click_r = false; // 클릭여부(한번)
let press_l = false
let press_r = false
let upKey = false;
let leftKey= false;
let downKey = false;
let rightKey = false;
let isMove = false // 움직이고 있는가
let interaction = false // 상호작용 (기본: E)
let moveR = 0; // 이동로직에 쓰이는 변수
let moveL = 0; //
let moveU = 0; //
let moveD = 0; //
let moveX = 0; //
let moveY = 0; //

let isFocus = true;

//  <!! 주의 !! >
// 로직에서 실제 움직임과 카메라의 움직임은 완전 개별이다.
// 플레이어가 아무리 많이 움직여도 카메라가 움직이지 않는다면 계속 같은곳만 렌더링 된다.
// 타일의 렌더링 기준은 "카메라" 다. 유저의 눈에만 맵이 보이면 되므로 그외의 타일은 렌더링 하지 않는다.
// 또한 항상 최소의 타일만 렌더링하도록 모니터의 크기에 맞추어서 렌더링 한다.
let moveRc = 0; // 카메라의 이동로직에 쓰이는 변수
let moveLc = 0; //
let moveUc = 0; //
let moveDc = 0; //
let cameraX = 0;
let cameraY = 0;
// 모든맵데이터 저장
const tileSize_Default = 160; // 타일크기는 120의 배수를 상용한다(권장사항). FHD(1920X1080) 의최대공약수.
const tileSize = 120; // 타일크기는 120의 배수를 상용한다(권장사항). FHD(1920X1080) 의최대공약수.
window.tileRatio = tileSize/tileSize_Default

window.MAP_DATA = {}
window.TILE = []; // 타일객체 저장
window.reqeustChunkId=[] // 데이터 요청을 보낸 청크아이디(중복요청 방지)
let connectTrigger_flag = false
let smooth = 0.9 // 움직임 보정용(부드럽기)
let speed = 10 * ( tileSize/tileSize_Default )// 플레이어 이동속도

// 청크 시스템 예시(청크사이즈 = 10)
// 1 2 3 4 5 ...
// 10 11 12 ...
// 타일내에서 청크저장 : [<청크가로ID>,<청크세로ID>,<청크내부에서 부여숫자>]
// 아래두 변수는 무조건 정수여야 한다.
// 메모 : 뒷쪽의 정수는 설정에 따라 직접 조정하여 사용한다. 2정도로 설정하면 왠만하면 자연스럽게 렌더링된다.
const chunkSize = 8; // 청크사이즈 // 청크는 맵생성 최적화를 위해 사용한다.(마인크래프트 생각하세요.꽤 유사할 겁니다.)
const adjX = -tileSize*1.5; // 전체타일의 위치조정
const adjY = -tileSize*1.5;  // 전체타일의 위치조정

let renderLimitUse = false;
let renderLimitDistant = tileSize * 4; // 기기의 성능이 너무 낮을시 렌더링되는 타일의 수를 낮춘다.(화면중앙 기준 거리)=-9
let attackCancelTime = 0

// ========================= CAMERA ========================= //
let cameraRun = 1; // 카메라의 사용여부(고정여부)
window.cameraAdjX = 0 // 카메라 위치조정
window.cameraAdjY = 0 //
let cameraShakeX = 0
let cameraShakeY = 0
window.cameraShake = function(power){
    cameraShakeX += phi.random(-power,power)
    cameraShakeY += phi.random(-power,power)
}
// ========================= CAMERA ========================= //
// #endregion   

// 타일맵 생성
function  tileRelocation(){
    window.TILE = []
    cameraAdjX = ((phi.width-tileSize+(1920*(1-phi.screenRatio))) / 2) // 카메라 위치조정
    cameraAdjY = ((phi.height-(tileSize*2)+(1080*(1-phi.screenRatio))) / 2)// 카메라 위치조정
    window.horTileCount = 18; // 화면의 가로에 채워지는 타일수
    window.verTileCount = 12; // 화면의 세로에 채워지는 타일수
    for (let i=0; i<horTileCount; i++){ // 화면의 가로안에 들어가는 타일수 만큼 반복
        for (let j=0; j<verTileCount; j++){ // 화면의 세로안에 들어가는 타일수 만큼 반복
            window.TILE.push({
                obj: phi.object(  // 로직및 시스템용 obj
                    IMG.GROUND[phi.random(0,3)],
                    [(i*tileSize)+ cameraAdjX + cameraX,(j*tileSize) + cameraAdjY + cameraY],
                    [tileSize,tileSize]
                ),
                horNum:i,//가로줄 
                verNum:j,//세로줄
                innerChunkId:0,
                chunkId:[],
                id:[],
                isBlock:false, //일반 통과가능 여부
                TILE:0, //타일종류
                TILEOBJ:phi.obj(null,[cameraX,cameraY],[0,0]) //렌더링용
            });
        }
    }
} 

// 정렬렌더링 초기화
let objSortList = []
function sortRender(obj){objSortList.push(obj)}
let particleBlitList = []
function particleRender(obj){particleBlitList.push(obj)}


window.entity = new EntitySys();

// 카메라의 움직임을 제어할떄 사용하는 함수
// 내부 관련변수를 직접제어하는 것보다 유지보수성이 좋음
function cameraMove(x,y){
    cameraX += x
    cameraY += y
    moveLc = x
    moveDc = -y
}

let pointerObj = phi.obj(IMG.MOUSE,[0,0]) // 게임전용 포인터 지정
let tileSelecterObj = [
    phi.reSizeBy(phi.obj(IMG.UI.tile_selecter_up,[0,0]),tileSize/IMG.UI.tile_selecter_up.width),
    phi.reSizeBy(phi.obj(IMG.UI.tile_selecter_down,[0,0]),tileSize/IMG.UI.tile_selecter_down.width),
]
function renderTileSlecter(pos) {
    phi.goto(tileSelecterObj[0],pos)
    phi.goto(tileSelecterObj[1],[pos[0],pos[1]+tileSize/2 -  3])
    phi.blit(tileSelecterObj[0])
    phi.blit(tileSelecterObj[1])
}

const wallTile = [4,5]
const playerObj_thick = 3
const playerSize = [tileSize,tileSize*2]
const playerObjSize = [tileSize*0.6,tileSize*2]
let playerObj = phi.obj(IMG.HITBOX,[0,0],[playerObjSize[0],playerObj_thick]);
let gunFireDelay = 0
let changedTile = 4
let changedTile_save = 0
let wallCheckDistance = 20

let action = 'destroy' 
// 여러가지 특수액션이 있다.
// default - 기본적인 상태. 물체나 엔티티와 상호작용할 수 있다
// build - 건축할수 있는 상태 
// attack - 공격을 할 수 있는 상태
// destroy - 블럭을 파괴할 수 있는 상태


let inventory_innereObj = [] //아이템 표시용
let inventory_spaceSize = 69
let inventory_Interval = 75;
let inventory_itemSize = 64;
// let inventorySize = IMG.UI.inventory.w;
for (let i=0; i<10;i++){
    inventory_innereObj.push(phi.obj(null,[0,0],[inventory_itemSize,inventory_itemSize]))
}
// let 
window.inventory = [null,null,null,null,null,null,null,null,null,null]
let inventory_select = 0;
let drop = false;
// 저장형식 : [<아이템>,<아이템>,<아이템>]
// 데이터만 저장하면 자동으로 화면에 렌더링 해준다
window.inventoryAdd = function(item){
    for (let i=0;i<10;i++){
        if (window.inventory[i] == null){
            window.inventory[i] = item
            break;
        }
    }
}


let destroyTimeStart = 0
let destroy_flag = false
let destroyTime = 0

let selectTile = 0;



tileRelocation()
let DT = 0;
let currentTime = performance.now();
let lastTime = performance.now();

phi.loop(() => {
    console.log(window.isEssentialImgLoad,window.isAllImgLoad)


    //#region 
    currentTime = performance.now();
    DT = (currentTime - lastTime)/100;
    if (DT > 2) DT = 2;

    if (!connectTrigger_flag && wing.nickname){
        wing.send('playerJoin',{});
        connectTrigger_flag = true
    }


    if (rightKey || leftKey || upKey || downKey) {let lastTime = performance.now(); // 이전 프레임 시간 저장
        isMove = true
    } else {
        isMove = false
    }
    phi.fill(0,0,0);
    //#endregion


    switch (SCENE){

        case 'menu_start' : {// 접속시 첫메뉴
            for (const name in COBJ['menu_start']){
                let obj = COBJ['menu_start'][name]
                phi.blit(obsj)
            }
            break;
        }

        case "error" : {
            for (const name in COBJ['error']){
                let obj = COBJ['error'][name]
                phi.blit(obj)
            }
            break;
        }

        case 'game_die': {
            for (const name in COBJ['game_die']){
                let obj = COBJ['game_die'][name]
                phi.blit(obj)
            }
            break;
        }
        
        case 'game_main' : { // 메인게임
            // #region 키입력
            if (upKey){moveU = speed; } else {moveU = moveU * smooth;}
            if (leftKey){moveL  = speed;} else {moveL = moveL * smooth;}
            if (downKey){moveD  = speed;} else {moveD = moveD * smooth;}
            if (rightKey){moveR  = speed;} else {moveR = moveR * smooth;}
            // #endregion
            for (let index in window.TILE){
                let TINF = window.TILE[index]
                const obj = TINF.obj
                
                // 타일 물리엔진. 타일이 통과불가능 특성일때 플레이어가 통과하지 못하도록 막음.
                if (TINF.isBlock){
                    phi.moveY(obj,wallCheckDistance)
                    if (phi.isEncounterObj(obj,playerObj)){
                        moveU = 0
                    }
                    phi.moveY(obj,-wallCheckDistance)

                    phi.moveY(obj,-wallCheckDistance)
                    if (phi.isEncounterObj(obj,playerObj)){
                        moveD = 0
                    }
                    phi.moveY(obj,wallCheckDistance)

                    phi.moveX(obj,-wallCheckDistance)
                    if (phi.isEncounterObj(obj,playerObj)){
                        moveR = 0
                    }
                    phi.moveX(obj,wallCheckDistance)
                
                    phi.moveX(obj,wallCheckDistance)
                    if (phi.isEncounterObj(obj,playerObj)){
                        moveL = 0
                    }
                    phi.moveX(obj,-wallCheckDistance)
                }
                // #region 타일물리엔진
                phi.moveX(obj,moveLc); // 실제 이동량 적용
                phi.moveY(obj,-moveDc); // 실제 이동량 적용
                phi.moveY(obj,moveUc); // 실제 이동량 적용
                phi.moveX(obj,-moveRc); // 실제 이동량 적용

                // 타일이 화면 끝에 있을때 반대쪽화면으로 이동 하는 코드
                if (obj.x > (horTileCount*tileSize) + adjX){
                    phi.moveX(obj,-horTileCount*tileSize)
                    TINF.horNum -= horTileCount
                    tileRelaod(TINF)
                } else if (obj.x < adjX){
                    phi.moveX(obj,horTileCount*tileSize)
                    TINF.horNum += horTileCount
                    tileRelaod(TINF)
                } else if (obj.y > verTileCount*tileSize + adjY){
                    phi.moveY(obj,-verTileCount*tileSize)
                    TINF.verNum -= verTileCount
                    tileRelaod(TINF)
                } else if (obj.y < adjY){ 
                    phi.moveY(obj,verTileCount*tileSize)
                    TINF.verNum += verTileCount
                    tileRelaod(TINF) 
                }  
                TINF.innerChunkId = mod(TINF.verNum,chunkSize) * chunkSize + mod(TINF.horNum, chunkSize) // 타일이 속한 청크내에서의 ID
                TINF.chunkId = [Math.floor(TINF.horNum / chunkSize),Math.floor(TINF.verNum / chunkSize)] // 타일이 속한 청크의 ID
                TINF.id = [TINF.chunkId[0],TINF.chunkId[1],TINF.innerChunkId] // 타일의 ID. 리스트 형대로 저장되고 [<청크내애서의_아이디1>,<청크내애서의_아이디2>,<청크>]
                // #endregion
                
                let isChangeBlock = [false,false]
                if (String(TINF.chunkId) in MAP_DATA){ // 청크데이터가 있는지 확인
                    // TINF.innerChunkId // 타일이 속한 청크내에서의 ID
                    // TINF.chunkId // 타일이 속한 청크의 ID
                    // TINF.id // 타일의 ID. 리스트 형대로 저장되고 [<청크내애서의_아이디1>,<청크내애서의_아이디2>,<청크>]
    
                    if (!renderLimitUse || renderLimitDistant > phi.distanceGetObj(obj,phi.obj(null,[phi.width/2/phi.screenRatio,phi.height/2/phi.screenRatio],[0,0]))){
                        // phi.text(`${TINF.TILE}`,[obj.x+(obj.width/2) - 40,obj.y+(obj.height/2)],`${20*phi.screenRatio}px`,null,'center');
                        phi.blit(obj);
                    }
                    if (phi.isEncounterPos(obj,mousePos)){
                        renderTileSlecter([obj.x,obj.y])
                        if (click_r){
                            if (window.inventory[inventory_select] != null && selectTile == 0 && phi.distanceGetObj(playerObj,obj) > tileSize){
                                if (window.inventory[inventory_select] == 'plank_block'){
                                    wing.send("playerItemRemove",{
                                        'itemType':inventory[inventory_select],
                                        'invenIndex':inventory_select,
                                    })
                                    wing.send("tileEdit",{
                                        'mode':'build',
                                        'id':TINF.id,
                                        'pos':[moveX,moveY],
                                        'tile':changedTile,
                                    })
                                }
                            }2
                        }

                        if (press_l && action == 'destroy'){
                            if (!destroy_flag){
                                destroyTimeStart = Date.now() + 2000
                                destroy_flag = true
                                
                            }
                        }
                        
                        if (destroyTimeStart < Date.now() && destroy_flag){
                            
                            window.particle('sculpture_1',[
                                obj.x + moveX - cameraAdjX + obj.width/2,
                                obj.y + moveY - cameraAdjY + obj.height/2
                            ],12,90)

                            wing.send("tileEdit",{
                                'mode':'destroy',
                                'id':TINF.id,
                                'pos':[obj.x + moveX - cameraAdjX + obj.width/2,
                                    obj.y + moveY - cameraAdjY + obj.height/2],
                                'tile':0,
                            })
                            
                            TINF.TILE = 0
                            TINF.isBlock = false
                            isChangeBlock  = [true,false]
                            destroy_flag = false
                            
                        }
                        if (!press_l || isMove){
                            destroy_flag = false
                        }
                    }
            
                    const TILE_DATA = MAP_DATA[String(TINF.chunkId)][TINF.innerChunkId]; // 진짜 맵데이터
                    const _TILE = MAP_DATA_TRANSLATOR[TILE_DATA.tile];
                    
                    if (_TILE != null){
                        if (TINF.TILE == TILE_DATA.tile){
                            phi.goto(TINF.TILEOBJ,[obj.x,obj.y]);
                        } else {
                            TINF.TILE = TILE_DATA.tile;
                            TINF.TILEOBJ = phi.obj(IMG.TILE[_TILE],[obj.x,obj.y],null);
                            phi.reSizeBy(TINF.TILEOBJ,tileRatio)
                        }


                        phi.move(TINF.TILEOBJ,[
                            -(TINF.TILEOBJ.width-tileSize)/2,
                            -TINF.TILEOBJ.height + tileSize*0.6,
                        ])
                        
                        if (!renderLimitUse || renderLimitUse && renderLimitDistant > phi.distanceGetObj(TINF.TILEOBJ,phi.obj(null,[phi.width/2/phi.screenRatio,phi.height/2/phi.screenRatio],[0,0]))){
                            
                            sortRender(TINF.TILEOBJ);
                        } 
                        TINF.isBlock = wallTile.includes(TINF.TILE) ? true : false;
                    }
                    
                    // 현재 포커스중인 타일의 종류저장
                    if (phi.isEncounterPos(obj,mousePos)) {
                        // TINF.TILE = 02
                        selectTile = TINF.TILE
                    }
                    
                    // 벽인가? 를 초기화
                    if (isChangeBlock[0]) TINF.isBlock = isChangeBlock[1] 


                } else {
                    window.wing.send( // 데이터 요청
                        "noChunkData",
                        String(TINF.chunkId)
                    )
                    reqeustChunkId.push(String(TINF.chunkId)) // 중복요청 방지
                }

                // TINF.TILE = 0
                // TINF.isBlock = false

            }



            moveX -= moveL - moveR;
            moveY -= moveU - moveD;
            // 엔티티 시스템
            for (let key in entity.allEntity){
                let ntt = entity.allEntity[key];
                let obj = ntt.renderObj;

                phi.goto(obj,[
                    ntt.pos[0]-obj.width/2 +(cameraAdjX+ cameraX),
                    ntt.pos[1]-obj.height/2 +(cameraAdjY+ cameraY)
                ]);
                
                if (window.playerId == ntt.id){
                    phi.goto(playerObj,[obj.x+playerObjSize[0]/2,obj.y + playerObjSize[1] - playerObj_thick])
                    // phi.blit(playerObj)
                }

                if (ntt.type == 'player' && !obj.img){
                    let nameText = ntt.name
                    if (nameText.length > 15){
                        nameText = nameText.slice(0,15) + '...'
                    } 
                    if (window.playerId == ntt.id){
                        obj = ntt.motion.render([obj.x,obj.y],{
                            Rk:rightKey,Lk:leftKey,
                            isMv:isMove,
                            CL:click_l,CR:click_r,
                            PL:press_l,PR:press_r,
                            mousePos:mousePos,
                            haveGun:action=='attack',
                            action:action
                        })
                        
                    } 
                    else {
                        if (ntt.tag && 'motionKeyData' in ntt.tag){
                            // phi.text(`${nameText}`,[obj.x+playerSize[0]/2,obj.y-20],`${30*phi.screenRatio*tileRatio}px`,'black','Roboto sans-serif','center');
                            const motionData = ntt.tag['motionKeyData']         
                            obj = ntt.motion.renderOther([obj.x,obj.y],motionData.frame,motionData.isFlip,motionData.isMove)
                        }
                    }
                    
                    phi.text(`HP: ${ntt.health}`,[obj.x+playerSize[0]/2,obj.y-50],`${30*phi.screenRatio*tileRatio}px`,'black','Roboto sans-serif','center');
                    phi.text(`${nameText}`,[obj.x+playerSize[0]/2,obj.y-20],`${30*phi.screenRatio*tileRatio}px`,'black','Roboto sans-serif','center');
                    
                
                }
                else if (ntt.type == 'bullet'){
                    phi.reSize(obj,[20,20])
                    phi.rotate(obj,8)
                    phi.move(obj,[-obj.width/2,-obj.height/2])
                    
                    if (ntt.tag.owner == playerId){
                        for (let TINF of window.TILE){
                            const tileObj = TINF.obj
                            if (phi.distanceGetObj(obj,tileObj) > tileSize) continue
                            // console.log(TINF.isBlock)
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
                            
                            // if (obj.y > phi.height/phi.screenRatio*phi.dpr){
                            //     entity.removeEntity(ntt.id)
                            // }
                            break
                        }
                    }
                
                
                
                
                }
                else if (ntt.type == 'item'){
                    if ( interaction && phi.distanceGetObj(obj,playerObj) < tileSize*0.8){
                        window.wing.send(
                            'requestGetItem',{
                                'nttId':ntt.id,
                            }
                        )
                    }
                }
                
                if (ntt.type != 'particle'){
                    sortRender(obj)
                } else {
                    particleRender(obj)
                }

                if (window.playerId == ntt.id){
                    ntt.pos = [moveX,moveY]
                    window.wing.send(
                        'playerData',
                        {edit:["pos"],'pos':[moveX,moveY]}
                    )
                    window.wing.send(
                        'playerMotionEdit',
                        {'frame':ntt.motion.frame,'isFlip':ntt.motion.isFlip,'isMove':ntt.motion.isMove}
                    )
                    
                    
                    // ================================ SPEED CONTROL ========================= //
                    if (attackCancelTime < Date.now()){
                        speed = 65 * DT * tileRatio
                    } else {
                        speed = 30 * DT * tileRatio
                    }
                    // ================================ SPEED CONTROL ========================= //

                    if (inventory[inventory_select] == 'gun'){
                        action = 'attack'
                    } else {
                        if (attackCancelTime < Date.now()){
                            if (selectTile == 0){
                                action = 'build'
                            } else {
                                action = 'destroy'
                            }
                        }
                    }


                    if (click_l && inventory[inventory_select] == 'gun' && action == 'attack'){ // 총쏘기
                        if (gunFireDelay < Date.now()){
                            // #region  bullet 데이터보내기
                            attackCancelTime = Date.now() + 1200
                            const centerX = obj.x + moveX + (obj.width / 2) - cameraAdjX ;
                            const centerY = obj.y + moveY + (obj.height / 2) - cameraAdjY;
                            const mouseWorldX = (mousePos[0]) + moveX - cameraAdjX;
                            const mouseWorldY = (mousePos[1]) + moveY - cameraAdjY;
                            const dx =  centerX - mouseWorldX;
                            const dy = centerY - mouseWorldY;
                            const rad = (-1* Math.atan2(dy, dx))
                            let deg = rad * (180 / Math.PI) - 90
                            wing.send("entitySpwan",{
                                'entityType':'bullet',
                                'entityPos':[centerX,centerY],
                                'entityDirection': deg
                            })
                            // #endregion
                            window.particle('empty_shell',[obj.width/2 + moveX,obj.height/2 + moveY],1,100)
                            if (ntt.motion.isFlip){
                                window.particle('gun_fire_flip',[obj.width/2 + moveX - 170,obj.height/2 + moveY-20],1,5)
                                window.particle('bang',[obj.width/2 + moveX-100,(-obj.height/2 + moveY + 120)],1,0)
                            } else {
                                window.particle('gun_fire',[obj.width/2 + moveX + 170,obj.height/2 + moveY-20],1,5)
                                window.particle('bang',[obj.width/2 + moveX+100,(-obj.height/2 + moveY + 120)],1,0)
                                
                            }
                            cameraShake(70)
                            gunFireDelay = Date.now() + 100
                        }
                    }
                    if (drop && window.inventory[inventory_select] != null){
                        wing.send("itemDrop",{
                            'itemType':inventory[inventory_select],
                            'invenIndex':inventory_select,
                            'itemPos':[
                                (mousePos[0]) + moveX - cameraAdjX,
                                (mousePos[1]) + moveY - cameraAdjY
                            ],
                        })
                        // window.inventory[inventory_select] = null
                    }
                }
            }

            if (cameraRun){
                cameraMove(
                    ((-moveX+cameraShakeX) - cameraX) / 8,
                    ((-moveY+cameraShakeY) - cameraY) / 8,
                )
            }
            objSortList = objSortList.sort((a,b) => (a.y + a.height) - (b.y + b.height));
            for (let obj of objSortList) phi.blit(obj);
            objSortList = [];
            particleBlitList = particleBlitList.sort((a,b) => (a.y + a.height) - (b.y + b.height));
            for (let obj of particleBlitList) phi.blit(obj);
            particleBlitList = [];
            
            for (const name in COBJ['game_main']){
                let obj = COBJ['game_main'][name]
    
                if (name == 'inventory'){
                    phi.blit(obj)
                    for (let i in inventory){
                        if (inventory[i] == null) continue;
                        let itemObj = inventory_innereObj[i]
                        itemObj.img = IMG.ITEM[inventory[i]]
                        phi.goto(itemObj,[obj.x+(i*inventory_Interval)+18,obj.y+13])
                        phi.blit(itemObj)
                    }
                }
                else if (name == 'inventory_select'){
                    const obj_ = phi.obj(obj.img,[obj.x+(inventory_select*inventory_Interval)+36-inventory_Interval*5,obj.y-5],null) 
                    phi.blit(obj_)
    
                }
            }
        }
        for (const name in COBJ['game_main']){
            let obj = COBJ['game_main'][name]

            if (name == 'inventory'){
                phi.blit(obj)
                for (let i in inventory){
                    if (inventory[i] == null) continue;
                    let itemObj = inventory_innereObj[i]
                    itemObj.img = IMG.ITEM[inventory[i]]
                    phi.goto(itemObj,[obj.x+(i*inventory_Interval)+18,obj.y+13])
                    phi.blit(itemObj)
                }
            }
            else if (name == 'inventory_select'){
                const obj_ = phi.obj(obj.img,[obj.x+(inventory_select*inventory_Interval)+36-inventory_Interval*5,obj.y-5],null) 
                phi.blit(obj_)

            }
        }



        cameraShakeX += (0 - cameraShakeX) / 10
        cameraShakeY += (0 - cameraShakeY) / 10
        phi.goto(pointerObj,mousePos)
        phi.blit(pointerObj)
        break;ㅇ
    }

    if (drop) drop=false;
    if (click_l) click_l=false;
    if (interaction) interaction=false;
    if (click_r) click_r=false;
    lastTime = currentTime;
});

// #region

document.addEventListener('mousemove',(e)=>{
    mousePos = [e.offsetX/phi.screenRatio*phi.dpr,e.offsetY/phi.screenRatio*phi.dpr]
    
}); // 마우스좌표
document.addEventListener('mousedown',(e) => { // 클릭
    if (e.button == 0){click_l = true; press_l=true};
    if (e.button == 2)click_r = true; press_r=true;
});
document.addEventListener('mouseup',(e) => { // 클릭
    if (e.button == 0)press_l=false;
    if (e.button == 2)press_r=false;
});
document.addEventListener('keydown',(e)=>{ // 움직임(누르기)
    if (e.key == 'w' || e.key == 'W')upKey = true;;
    if(e.key == 'a' || e.key == 'A') leftKey= true;
    if(e.key == 's' || e.key == 'S') downKey = true;
    if(e.key == 'd' || e.key == 'D') rightKey = true;
    if(e.key == 'e' || e.key == 'E') interaction = true;
    if(e.key == 'q' || e.key == 'Q') drop = true;

    if(e.key == '1') inventory_select = 0;
    if(e.key == '2') inventory_select = 1;
    if(e.key == '3') inventory_select = 2;
    if(e.key == '4') inventory_select = 3;
    if(e.key == '5') inventory_select = 4;
    if(e.key == '6') inventory_select = 5;
    if(e.key == '7') inventory_select = 6;
    if(e.key == '8') inventory_select = 7;
    if(e.key == '9') inventory_select = 8;
    if(e.key == '0') inventory_select = 9;
})
document.addEventListener('keyup',(e)=>{// 움직임(뗴기)
    if (e.key == 'w' || e.key == 'W') upKey = false;
    if(e.key == 'a' || e.key == 'A') leftKey = false;
    if(e.key == 's' || e.key == 'S') downKey = false;
    if(e.key == 'd' || e.key == 'D') rightKey = false;
    // if(e.key == 'e' || e.key == 'E') interaction = false;
})
window.addEventListener('contextmenu', function (e) {
  e.preventDefault(); 
});
window.addEventListener('focus', () => {
    isFocus = true;
    lastTime = performance.now(); 
});

window.addEventListener('blur', () => {
    isFocus = false;
    upKey = false;
    leftKey = false;
    downKey = false;
    rightKey = false;
    interaction = false;
    click_l = false
    click_r = false
    press_l = false
    press_r = false
    destroy_flag = false
    destroyTime = 0
    destroyTimeStart = 0
});

// #endregion

})();



