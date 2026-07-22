import { phi,wing } from "./api.js"
import "./imgLoad.js"


// console.log(IMG)

/** 
청크 시스템 예시(청크사이즈 = 10)
1 2 3 4 5 ...
10 11 12 ...c
타일내에서 청크저장 : [<청크가로ID>,<청크세로ID>,<청크내부에서 부여숫자>]
아래두 변수는 무조건 정수여야 한다.
메모 : 뒷쪽의 정수는 설정에 따라 직접 조정하여 사용한다. 2정도로 설정하면 왠만하면 자연스럽게 렌더링된다.

// 여러가지 특수액션이 있다.
// default - 기본적인 상태. 물체나 엔티티와 상호작용할 수 있다
// build - 건축할수 있는 상태 
// attack - 공격을 할 수 있는 상태
// destroy - 블럭을 파괴할 수 있는 상태

**/


class stateManager{
    constructor(){
        phi.display([innerWidth, innerHeight]);

        this.tileSize_Default = 160
        this.tileSize = 120
        this.tileRatio = this.tileSize / this.tileSize_Default
        
        this.TILE = []// 타일객체 저장
        this.chunkSize = 6;
        this.MAP_DATA_TRANSLATOR = {
            0 : null,
            1 : 'chest',
            2 : 'tree_m',
            3 : 'tree_s',
            4 : 'plank',
            5 : 'craft_table',
            6 : 'bush',
            7 : 'plank_block',
            8 : 'stack_plank',
            9 : 'iron_block',
            10: 'street_lamp'
        }

        this.adjX = -this.tileSize *1.5;
        this.adjY = -this.tileSize *1.5;

        this.cameraX=0
        this.cameraY=0
        this.cameraRun = 1 
        this.cameraAdjX = 0
        this.cameraAdjY = 0
        this.cameraShakeX = 0
        this.cameraShakeY = 0

        this.click_l=false// 클릭여부(한번)
        this.click_r=false// 클릭여부(한번)
        this.press_l=false
        this.press_r=false
        this.upKey=false
        this.leftKey=false
        this.downKey=false
        this.rightKey=false
        this.isMove=false
        this.interaction=false// 상호작용 (기본: E)

        this.moveR=0
        this.moveL=0
        this.moveU=0
        this.moveD=0
        this.moveX=0
        this.moveY=0
        this.wheel=0
        this.moveRc=0
        this.moveLc=0
        this.moveUc=0
        this.moveDc=0
        this.isFocus=true

        

        this.horTileCount=18 // 화면의 가로에 채워지는 타일수
        this.verTileCount=12 // 화면의 세로에 채워지는 타일수

        this.SCENE='menu_main'
        this.SCENE_LIST=[ 
            'menu_main','menu_load',
            'game_main',
            'error',
            'game_die'
        ]

        this.SCENE_INF={}// 장면전환,플래그등 장면에 대한 부가정보 저장
        for (let scene of this.SCENE_LIST){
            this.SCENE_INF[scene] = {
                'reset_flag' : false,
                'sub_scene' : '',
            }
        }

        this.connectTrigger_flag = false
        this.smooth = 0.9// 움직임 보정(부드럽게)
        this.speed = 10 * ( this.tileSize / this.tileSize_Default )// 플레이어 이동속도

        
        this.renderLimitUse = false;
        this.renderLimitDistant = this.tileSize  * 4 //렌더링되는 범위를 낮춘다.(화면중앙 기준 거리)
        this.attackCancelTime = 0
        this.objSortList = []// 정렬렌더링 초기화
        this.particleBlitList = []
    }
    

    //#region 
    sortRender(obj){this.objSortList.push(obj)}
    
    particleRender(obj){this.particleBlitList.push(obj)}


    // 카메라의 움직임을 제어할떄 사용하는 함수
    cameraMove(x,y){
        this.cameraX += x
        this.cameraY += y
        this.moveLc = x
        this.moveDc = -y
    }

    tileRelaod(tile){// 게임내의 시스템에서 사용하는 타일특성 초기화 함수
        tile.isBlock = false
    }; 

    mod(n, m){return ((n % m) + m) % m;}// % 보정함수. 나머지가 음수여도 다시양수로 변환

    cameraShake(power){
        this.cameraShakeX += phi.random(-power,power)
        this.cameraShakeY += phi.random(-power,power)
    }
    tileRelocation(){
        this.TILE = [] 
        this.cameraAdjX = ((phi.width-this.tileSize+(1920*(1-phi.screenRatio))) / 2)
        this.cameraAdjY = ((phi.height-(this.tileSize*2)+(1080*(1-phi.screenRatio))) / 2)
        
        console.log(phi.screenRatio)

        for (let i=0; i<this.horTileCount; i++){ // 화면의 가로안에 들어가는 타일수 만큼 반복
            for (let j=0; j<this.verTileCount; j++){ // 화면의 세로안에 들어가는 타일수 만큼 반복
                console.log('asd')
                this.TILE.push({
                    obj: phi.object(  // 로직및 시스템용 obj
                        IMG.GROUND[phi.random(0,3)],
                        [
                            (i*this.tileSize)+ this.cameraAdjX + this.cameraX,
                            (j*this.tileSize) + this.cameraAdjY + this.cameraY],
                        [
                            this.tileSize,
                            this.tileSize
                        ]
                    ),
                    horNum:i,//가로줄 
                    verNum:j,//세로줄
                    innerChunkId:0,
                    chunkId:[],
                    id:[],
                    isBlock:false, //일반 통과가능 여부
                    TILE:0, //타일종류
                    TILEOBJ:phi.obj(null,[this.cameraX,this.cameraY],[0,0]) //렌더링용
                });
            }
        }
    } 
    //#endregion
}

export let state = new stateManager();

// await isAllImgLoad
// console.log(IMG)

window.isDev = false;
window.MAP_DATA = {} // 모든맵데이터 저장
window.reqeustChunkId=[] // 데이터 요청을 보낸 청크아이디(중복요청 방지)
window.startLoadFinish = false // 게임파일의 완전한 로딩 끝남 여부
window.playerId = ''//  내 아이디 
window.clientId = ''// 클라이언트 고요 ID
window.join = false
window.isLogin = false
window.host = 'localhost'
window.port = 4000
window.isOnlineError = false
window.isFinishLoading = false
window.connect = false
window.connect_flag = false
window.DT = 0;
window.currentTime = performance.now();
window.lastTime = performance.now();
window.destroyTimeStart = 0
window.destroy_flag = false
window.destroyTime = 0
window.selectTile = 0;
window.wallTile = [4,5,8,9,7]

window.playerObj_thick = 3
window.playerSize = [state.tileSize ,state.tileSize *2]
window.playerObjSize = [state.tileSize *0.6,state.tileSize *2]
window.playerObj = phi.obj(IMG.HITBOX,[0,0],[playerObjSize[0],playerObj_thick]);

window.gunFireDelay = 0
window.changedTile = 4
window.changedTile_save = 0
window.wallCheckDistance = 20

window.action = 'destroy' 
window.inventory_spaceSize = 69
window.inventory_Interval = 75;
window.inventory_itemSize = 64;
window.inventory_innereObj = [] //아이템 표시용
