import  { state }  from './init.js'
import { phi, wing } from "./api.js"


document.addEventListener('mousemove',(e)=>{
    phi.mousepos = [e.offsetX/phi.screenRatio*phi.dpr,e.offsetY/phi.screenRatio*phi.dpr]
    
}); // 마우스좌표
document.addEventListener('mousedown',(e) => { // 클릭
    if (e.button == 0){state.click_l = true; state.press_l=true};
    if (e.button == 2){state.click_r = true; state.press_r=true};
});
document.addEventListener('wheel',(e)=>{
    if (e.deltaY > 0){
        state.wheel = 1 
    } else {
        state.wheel = -1
    }
})

document.addEventListener('mouseup',(e) => { // 클릭
    if (e.button == 0)state.press_l=false;
    if (e.button == 2)state.press_r=false;
});
document.addEventListener('keydown',(e)=>{ // 움직임(누르기)
    if (e.key == 'w' || e.key == 'W')state.upKey = true;;
    if(e.key == 'a' || e.key == 'A') state.leftKey= true;
    if(e.key == 's' || e.key == 'S') state.downKey = true;
    if(e.key == 'd' || e.key == 'D') state.rightKey = true;
    if(e.key == 'e' || e.key == 'E') state.interaction = true;
    if(e.key == 'q' || e.key == 'Q') state.drop = true;

    if(e.key == '1') state.inventory_select = 0;
    if(e.key == '2') state.inventory_select = 1;
    if(e.key == '3') state.inventory_select = 2;
    if(e.key == '4') state.inventory_select = 3;
    if(e.key == '5') state.inventory_select = 4;
    if(e.key == '6') state.inventory_select = 5;
    if(e.key == '7') state.inventory_select = 6;
    if(e.key == '8') state.inventory_select = 7;
    if(e.key == '9') state.inventory_select = 8;
    if(e.key == '0') state.inventory_select = 9;
})
document.addEventListener('keyup',(e)=>{// 움직임(뗴기)
    if (e.key == 'w' || e.key == 'W') state.upKey = false;
    if(e.key == 'a' || e.key == 'A') state.leftKey = false;
    if(e.key == 's' || e.key == 'S') state.downKey = false;
    if(e.key == 'd' || e.key == 'D') state.rightKey = false;
    // if(e.key == 'e' || e.key == 'E') state.interaction = false;
})
window.addEventListener('contextmenu', function (e) {
  e.preventDefault(); 
});
window.addEventListener('focus', () => {
    state.isFocus = true;
    lastTime = performance.now(); 
});

window.addEventListener('blur', () => {
    state.isFocus = false;
    state.upKey = false;
    state.leftKey = false;
    state.downKey = false;
    state.rightKey = false;
    state.interaction = false;
    state.click_l = false
    state.click_r = false
    state.press_l = false
    state.press_r = false
    destroy_flag = false
    destroyTime = 0
    destroyTimeStart = 0
});


