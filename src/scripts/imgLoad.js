export const IMG = { // 게임내의 모든 이미지저장
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
        // log : await phi.imgLoad("src/img/entity/item/log.png"),

    },

    UI : {
        common_cancel : await phi.imgLoad("src/img/ui/common_cancel.png"),
        common_checkbox_off : await phi.imgLoad("src/img/ui/common_checkbox_off.png"),
        common_checkbox_on : await phi.imgLoad("src/img/ui/common_checkbox_on.png"),
        common_msgbox : await phi.imgLoad("src/img/ui/common_msgbox.png"),
        main_back : await phi.imgLoad("src/img/ui/main_back.png"),
        main_title : await phi.imgLoad("src/img/ui/main_title.png"),
        player_craft : await phi.imgLoad("src/img/ui/player_craft.png"),
        player_state : await phi.imgLoad("src/img/ui/player_state.png"),
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
        // chest : await phi.imgLoad("src/img/tile/chest.png"),
        // chest : await phi.imgLoad("src/img/tile/chest.png"),
        // chest : await phi.imgLoad("src/img/tile/chest.png"),
    },

    PLAYER : {
        0 : await phi.imgLoad("src/img/entity/player/basic/0.png"),
        1 : await phi.imgLoad("src/img/entity/player/basic/1.png"),
        2 : await phi.imgLoad("src/img/entity/player/basic/2.png"),
        3 : await phi.imgLoad("src/img/entity/player/basic/3.png"),

    }
    
}