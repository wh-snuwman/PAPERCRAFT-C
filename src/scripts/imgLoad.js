
window.isAllImgLoad = false

async function loadImg(){
    window.IMG = { // 게임내의 모든 이미지저장
        HITBOX :await phi.imgLoad("src/img/entity/hitbox/0.png"),
        MOUSE : await phi.imgLoad("src/img/mouse/0.png"),
        GROUND : {
            0 : await phi.imgLoad("src/img/ground/0.png"),
            1 : await phi.imgLoad("src/img/ground/1.png"),
            2 : await phi.imgLoad("src/img/ground/2.png"),
            3 : await phi.imgLoad("src/img/ground/3.png"),
        },
        ITEM:{
            log : await phi.imgLoad("src/img/entity/item/log.png"),
            apple : await phi.imgLoad("src/img/entity/item/apple.png"),
            plank : await phi.imgLoad("src/img/entity/item/plank.png"),
            plank_block : await phi.imgLoad("src/img/entity/item/plank_block.png"),
            gun : await phi.imgLoad("src/img/entity/item/gun.png"),
            // log : await phi.imgLoad("src/img/entity/item/log.png"),
        },

        ENTITY : {
            bullet : await phi.imgLoad("src/img/entity/bullet/0.png"),

        },

        PARTICLE : {
            sculpture : await phi.imgLoad("src/img/entity/particle/sculpture.png"),
            bang : await phi.imgLoad("src/img/entity/particle/effect_bang.png"),
            empty_shell : await phi.imgLoad("src/img/entity/particle/empty_shell.png"),
            gun_fire : await phi.imgLoad("src/img/entity/particle/effect_gun_fire.png")
        },


        PAGE : {
            error : await phi.imgLoad("src/img/page/error.png"),
            game_die : await phi.imgLoad("src/img/page/game_die.png"),
        },

        UI : { 
            box_0 : await phi.imgLoad("src/img/ui/box_0.png"),
            box_1 : await phi.imgLoad("src/img/ui/box_1.png"),

            server_banner_apple : await phi.imgLoad("src/img/ui/server_title_0.png"),

            main_back : await phi.imgLoad("src/img/ui/main_back.png"),
            main_title : await phi.imgLoad("src/img/ui/main_title.png"),
            player_inventory_select : await phi.imgLoad("src/img/ui/player_inventory_select.png"),
            player_inventory : await phi.imgLoad("src/img/ui/player_inventory.png"),
            tile_selecter_up : await phi.imgLoad("src/img/ui/tile_selecter_up.png"),
            tile_selecter_down : await phi.imgLoad("src/img/ui/tile_selecter_down.png"),
            // 메인메뉴용 UI
        },
        TILE : {
            tree_m : await phi.imgLoad("src/img/tile/tree_m.png"),
            tree_s : await phi.imgLoad("src/img/tile/tree_s.png"),
            chest : await phi.imgLoad("src/img/tile/chest.png"),
            plank : await phi.imgLoad("src/img/tile/plank.png"),
            craft_table : await phi.imgLoad("src/img/tile/craft_table.png"),
            fence : await phi.imgLoad("src/img/tile/fence.png"),
            bush : await phi.imgLoad("src/img/tile/bush.png"),
            error_block : await phi.imgLoad("src/img/tile/error_block.png"),
            plank_block : await phi.imgLoad("src/img/tile/plank.png"),
            // chest : await phi.imgLoad("src/img/tile/chest.png"),
            // chest : await phi.imgLoad("src/img/tile/chest.png"),
            // chest : await phi.imgLoad("src/img/tile/chest.png"),
        },

        PLAYER : {
            0 : await phi.imgLoad("src/img/entity/player/basic/0.png"),
            1 : await phi.imgLoad("src/img/entity/player/basic/1.png"),
            2 : await phi.imgLoad("src/img/entity/player/grab/0.png"),
            3 : await phi.imgLoad("src/img/entity/player/grab/1.png"),
            4 : await phi.imgLoad("src/img/entity/player/punch/0.png"),
            5 : await phi.imgLoad("src/img/entity/player/punch/1.png"),
            6 : await phi.imgLoad("src/img/entity/player/attack/0.png"),
            7 : await phi.imgLoad("src/img/entity/player/attack/1.png"),

        }
        
    }
} 
await loadImg()
window.isAllImgLoad = true
