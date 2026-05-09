import { PHI } from "../../@phi/src/script/PHI.js" // webgl2 기반 그래픽조정 모듈
window.phi = new PHI("display-canvas"); // 캔버스 연결
phi.display([innerWidth, innerHeight]); // 초기 화면 설정
phi.textDisplay("text-canvas"); // 캔버스에서 텍스트렌더링 사용