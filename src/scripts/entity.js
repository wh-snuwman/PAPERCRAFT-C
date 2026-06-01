import "./imgLoad.js"

// type         // 엔티티 타입
// name         // 엔티티 이름(예: 플레이어 닉네임, 플레이어가 지정해주는 별명)
// pos          //위치
// motion       // 엔티티의 모션과 애니매이션 지정(추후 제작예정)
// tag          // 고급설정 데이터(예 : 이벤트 명령어,태그,고유 데이터)
// id,          // 엔티티 구별용 고유 ID
// renderObj    // 실제 엔티티 렌더링을 위한 오브젝트(phi 모듈)

export class Entity {
    constructor() {
        this.type = '';  
        this.name = '';  
        this.pos = [];
        this.motion = null;    
        this.tag = {}   
        this.id = ''    
        this.renderObj = null;
        this.health = 300;
    }
    

    addHealth(point){
        this.health += point
    }

    isDie(point){
        return this.health <= 0;
    }

}



export class EntitySys { 
    constructor() {
        // 엔티티 시스템에서 엔티티(객체)의 데이터를 저장
        this.allEntity = {} 
    }
    newEntity(type_,name_,pos_,motion_,tag_,id_,img_=null){
        let size = [0,0];
        if (img_){ size = null}
        else size = [0,0]
        const ntt = new Entity()
        ntt.type = type_
        ntt.name = name_
        ntt.pos = pos_
        ntt.motion = motion_
        ntt.tag = tag_
        ntt.id = id_
        ntt.renderObj =phi.obj(img_,[0,0],size)
        this.allEntity[id_] = ntt;
        return ntt;
    }

    newItem(type_,pos_,id_){
        let ntt = this.newEntity('item',null,pos_,null,{'itemType':type_},id_,window.IMG.ITEM[type_])
        this.allEntity[id_] = ntt;
        return ntt;
    }

    editEntity(id,editType,data){
        this.allEntity[id][editType] = data
    }
    
    editEntityTag(id,Intag,data){
        // console.log(allEntity[id])
        if (id in this.allEntity){
            this.allEntity[id]['tag'][Intag] = data
        }
    }

    removeEntity(id_){
        delete this.allEntity[id_];
    }
    getAll(){
        return this.allEntity
    }
    get(id){
        return this.allEntity[id]
    }
}