import { applePhi } from "../../applePhi/src/script/applePhi.js"
import { wingAPI } from "../../wingAPI/src/script/wingAPI.js"

const phi = new applePhi("display-canvas");
const wing = new wingAPI();

// console.log(phi.width)

export {phi, wing}