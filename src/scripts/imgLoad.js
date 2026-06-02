window.isEssentialImgLoad = false;
window.isAllImgLoad = false;

window.IMG = {
    HITBOX: null,
    MOUSE: null,
    GROUND: {},
    ITEM: {},
    ENTITY: {},
    PARTICLE: {},
    PAGE: {},
    UI: {},
    TILE: {},
    PLAYER: {}
};

async function loadImg() {
    const essentialImages = await Promise.all([
        phi.imgLoad("src/img/page/error.png"),
        phi.imgLoad("src/img/page/game_die.png")
    ]);
    
    IMG.PAGE.error = essentialImages[0];
    IMG.PAGE.game_die = essentialImages[1];
    
    window.isEssentialImgLoad = true;

    const restImages = await Promise.all([
        phi.imgLoad("src/img/entity/hitbox/0.png"),
        phi.imgLoad("src/img/mouse/0.png"),
        phi.imgLoad("src/img/ground/0.png"),
        phi.imgLoad("src/img/ground/1.png"),
        phi.imgLoad("src/img/ground/2.png"),
        phi.imgLoad("src/img/ground/3.png"),
        phi.imgLoad("src/img/entity/item/log.png"),
        phi.imgLoad("src/img/entity/item/apple.png"),
        phi.imgLoad("src/img/entity/item/plank.png"),
        phi.imgLoad("src/img/entity/item/plank_block.png"),
        phi.imgLoad("src/img/entity/item/gun.png"),
        phi.imgLoad("src/img/entity/bullet/0.png"),
        phi.imgLoad("src/img/entity/particle/sculpture.png"),
        phi.imgLoad("src/img/entity/particle/effect_bang.png"),
        phi.imgLoad("src/img/entity/particle/empty_shell.png"),
        phi.imgLoad("src/img/entity/particle/effect_gun_fire.png"),
        phi.imgLoad("src/img/ui/common_cancel.png"),
        phi.imgLoad("src/img/ui/common_checkbox_off.png"),
        phi.imgLoad("src/img/ui/common_checkbox_on.png"),
        phi.imgLoad("src/img/ui/common_msgbox.png"),
        phi.imgLoad("src/img/ui/main_back.png"),
        phi.imgLoad("src/img/ui/main_title.png"),
        phi.imgLoad("src/img/ui/player_craft.png"),
        phi.imgLoad("src/img/ui/player_state.png"),
        phi.imgLoad("src/img/ui/player_inventory_select.png"),
        phi.imgLoad("src/img/ui/player_inventory.png"),
        phi.imgLoad("src/img/ui/tile_selecter_up.png"),
        phi.imgLoad("src/img/ui/tile_selecter_down.png"),
        phi.imgLoad("src/img/tile/tree_m.png"),
        phi.imgLoad("src/img/tile/tree_s.png"),
        phi.imgLoad("src/img/tile/chest.png"),
        phi.imgLoad("src/img/tile/plank.png"),
        phi.imgLoad("src/img/tile/craft_table.png"),
        phi.imgLoad("src/img/tile/fence.png"),
        phi.imgLoad("src/img/tile/bush.png"),
        phi.imgLoad("src/img/tile/error_block.png"),
        phi.imgLoad("src/img/entity/player/basic/0.png"),
        phi.imgLoad("src/img/entity/player/basic/1.png"),
        phi.imgLoad("src/img/entity/player/grab/0.png"),
        phi.imgLoad("src/img/entity/player/grab/1.png"),
        phi.imgLoad("src/img/entity/player/punch/0.png"),
        phi.imgLoad("src/img/entity/player/punch/1.png"),
        phi.imgLoad("src/img/entity/player/attack/0.png"),
        phi.imgLoad("src/img/entity/player/attack/1.png")
    ]);

    let i = 0;
    IMG.HITBOX = restImages[i++];
    IMG.MOUSE = restImages[i++];
    IMG.GROUND[0] = restImages[i++];
    IMG.GROUND[1] = restImages[i++];
    IMG.GROUND[2] = restImages[i++];
    IMG.GROUND[3] = restImages[i++];
    IMG.ITEM.log = restImages[i++];
    IMG.ITEM.apple = restImages[i++];
    IMG.ITEM.plank = restImages[i++];
    IMG.ITEM.plank_block = restImages[i++];
    IMG.ITEM.gun = restImages[i++];
    IMG.ENTITY.bullet = restImages[i++];
    IMG.PARTICLE.sculpture = restImages[i++];
    IMG.PARTICLE.bang = restImages[i++];
    IMG.PARTICLE.empty_shell = restImages[i++];
    IMG.PARTICLE.gun_fire = restImages[i++];
    IMG.UI.common_cancel = restImages[i++];
    IMG.UI.common_checkbox_off = restImages[i++];
    IMG.UI.common_checkbox_on = restImages[i++];
    IMG.UI.common_msgbox = restImages[i++];
    IMG.UI.main_back = restImages[i++];
    IMG.UI.main_title = restImages[i++];
    IMG.UI.player_craft = restImages[i++];
    IMG.UI.player_state = restImages[i++];
    IMG.UI.player_inventory_select = restImages[i++];
    IMG.UI.player_inventory = restImages[i++];
    IMG.UI.tile_selecter_up = restImages[i++];
    IMG.UI.tile_selecter_down = restImages[i++];
    IMG.TILE.tree_m = restImages[i++];
    IMG.TILE.tree_s = restImages[i++];
    IMG.TILE.chest = restImages[i++];
    IMG.TILE.plank = restImages[i++];
    IMG.TILE.craft_table = restImages[i++];
    IMG.TILE.fence = restImages[i++];
    IMG.TILE.bush = restImages[i++];
    IMG.TILE.error_block = restImages[i++];
    IMG.TILE.plank_block = IMG.TILE.plank;
    IMG.PLAYER[0] = restImages[i++];
    IMG.PLAYER[1] = restImages[i++];
    IMG.PLAYER[2] = restImages[i++];
    IMG.PLAYER[3] = restImages[i++];
    IMG.PLAYER[4] = restImages[i++];
    IMG.PLAYER[5] = restImages[i++];
    IMG.PLAYER[6] = restImages[i++];
    IMG.PLAYER[7] = restImages[i++];

    window.isAllImgLoad = true;
}

await loadImg();