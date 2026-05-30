window.motion = class {
    constructor() {
        this.type = '';
        this.retObj = phi.obj(null,[0,0],[0,0]);
        this.isFlip = false;
        this.frame = null
        this.sinN = 0
        this.onHand = false
        this.isMove = false;
        this.interaction = false;
        this.leftKey = false;
        this.rightKey = false;
        this.click_l = false
        this.click_r = false
        this.mousePos
        this.isAttack = false
        this.attackCancelTime = 0
        this.rotate = 0
        this.haveGun = false
        this.gunFireDelay = 0
    }


    _devtest(pos){
        this.retObj = phi.obj(IMG.PLAYER[0],pos)
        phi.reSizeBy(this.retObj,0.7  *tileRatio,'default');
        return this.retObj
    }

    render(pos,data={Rk:false,Lk:false,isMv:false,CL:false,CR:false,mousePos:false,haveGun:false}){
        this.rightKey = data.Rk
        this.leftKey = data.Lk
        this.isMove = data.isMv
        this.click_l = data.CL
        this.click_r = data.CR
        this.mousePos = data.mousePos
        this.haveGun = data.haveGun
        
        if (this.click_l && this.haveGun){
            this.attackCancelTime = Date.now() + 1200
            this.isAttack = true
        }
        if (this.attackCancelTime < Date.now()){
            this.isAttack = false
        }
        
        if (!this.isAttack){
            if (this.leftKey) this.isFlip = 1;
            if (this.rightKey) this.isFlip = 0;
        }

        if (!this.isAttack){
            if (this.isMove && !(this.rightKey && this.leftKey)){
                this.sinN++;

                if (this.onHand){
                    this.retObj = phi.obj(IMG.PLAYER[3],pos)
                    this.frame = 3
                } else {
                    this.retObj = phi.obj(IMG.PLAYER[1],pos)
                    this.frame = 1
                    this.rotate += (0 - this.rotate) /10
                }

                // phi.rotate(this.retObj,Math.sin(this.sinN/7)*5)
                this.rotate = Math.sin(this.sinN/7)*5
                phi.moveY(this.retObj,Math.cos(this.sinN/3.5)*5)
            } else {
                if (this.onHand){
                    this.retObj = phi.obj(IMG.PLAYER[2],pos)
                    this.frame = 2
                } else {
                    this.retObj = phi.obj(IMG.PLAYER[0],pos)
                    this.rotate += (0 - this.rotate) /10
                    this.frame = 0
                }
            }
        } else {
            if (this.mousePos[0] < pos[0]){
                this.isFlip = 1
            } else {
                this.isFlip = 0
            }
            if (this.isMove && !(this.rightKey && this.leftKey)){
                this.sinN++;
                this.retObj = phi.obj(IMG.PLAYER[7],pos)
                this.frame = 7
                this.rotate = Math.sin(this.sinN/7)*5
                phi.moveY(this.retObj,Math.cos(this.sinN/3.5)*5)

            } else {
                this.rotate += (0 - this.rotate) /10

                if (this.click_l){
                    if (this.gunFireDelay < Date.now()){
                        if (this.isFlip){
                            this.rotate += 7
                        } else {
                            this.rotate -= 7
                        } 
                        this.gunFireDelay = Date.now() + 100
                    }
                }
                if (Math.abs(this.rotate) > 2){
                    this.retObj = phi.obj(IMG.PLAYER[7],pos)
                    this.frame = 7
                } else {
                    this.retObj = phi.obj(IMG.PLAYER[6],pos)
                    this.frame = 6
                }
            }
        }

        // 텍스쳐반전   
        if (this.isFlip){phi.flip(this.retObj,'hor')}
        
        phi.rotate(this.retObj,this.rotate)
        phi.reSizeBy(this.retObj,0.7 * tileRatio,'default');

        return this.retObj

    }
    renderOther(pos,frame,isFlip,isMove){
        this.retObj = phi.obj(IMG.PLAYER[frame],pos)
        if (isMove){
            this.sinN++;
            this.rotate += (0 - this.rotate) /10
            this.rotate = Math.sin(this.sinN/7)*5
            phi.moveY(this.retObj,Math.cos(this.sinN/3.5)*5)   
        } else {
            this.rotate = 0
            this.sinN = 0
        }

        if (isFlip){phi.flip(this.retObj,'hor')}
        phi.rotate(this.retObj,this.rotate)
        phi.reSizeBy(this.retObj,0.7 * tileRatio,'default');
        return this.retObj

    }
}