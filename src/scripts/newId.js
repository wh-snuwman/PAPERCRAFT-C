import  { state }  from './init.js'
import { phi, wing } from "./api.js"

window.newId = function(){
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 40; i++) {
        const randomIndex = chars[phi.random(0,chars.length)];
        result += randomIndex;
    }
    return result;
}