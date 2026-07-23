

import  { state }  from './init.js'
import { phi, wing } from "./api.js"


export class commonObjManager{
    constructor(sceneList){
        // common obj. 자동으로 그려지고 위치가 조정되는 obj를 저장.
        
        this.sceneList = []
        this.COBJ = {}
        this.sceneFunc = {}
        this.nowScene = ''

        this.sceneList = sceneList
        for (let scene of this.sceneList){
            this.COBJ[scene] = {}
        }  

        window.addEventListener('resize',()=>{
            this.resize()
        })
    }


    add(scene,name,img,pos,size){
        this.COBJ[scene][name] = {obj:phi.obj(img,[0,0],null),pos:pos,size:size}
        // this.resize()
    }

    setScene(name){
        this.nowScene = name
    }

    getScene(scene){
        return this.COBJ[scene]
    }

    resize(){
        for (let scene in this.COBJ){
            for (let name in this.COBJ[scene]){
                const cobj = this.COBJ[scene][name]
                if (cobj.pos){
                    phi.goto(cobj.obj,cobj.pos)
                }
                if (cobj.size){
                    phi.reSize(cobj.obj,cobj.size)
                }
            }
        }
    }

    scene(scene,f){
        this.sceneFunc[scene] = f
        this.resize()
    }

    update(){
        for (let scene in this.sceneFunc){
            if (this.nowScene !== scene) continue
            for (let name in this.COBJ[scene]){
                const cobj = this.COBJ[scene][name]
                this.sceneFunc[scene](cobj.obj,name)
            }
        }
    }
}