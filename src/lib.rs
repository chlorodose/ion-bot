use game_actions::GameAction;
use log::{info, trace};
use prost::Message as _;
use proto::{IGameActions, IWorldDiff};
use wasm_bindgen::{JsError, prelude::wasm_bindgen};
use world_stat::WorldStat;

pub mod game_actions;
pub mod logging;
pub mod proto;
pub mod world_stat;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name=getCPU)]
    fn get_cpu() -> f64;
}

/// The main object for game loop
#[derive(Debug, Default)]
#[wasm_bindgen]
pub struct Manager {
    world_stat: WorldStat,
}
#[wasm_bindgen]
impl Manager {
    #[wasm_bindgen(constructor)]
    pub fn default() -> Self {
        Default::default()
    }
    /// Tick a game loop
    pub fn tick(&mut self, diff_buf: Box<[u8]>) -> Box<[u8]> {
        logging::set_log_level();
        trace!(
            "WorldDiff buffer size = {}",
            humansize::format_size(diff_buf.len(), humansize::BINARY)
        );
        let diff = IWorldDiff::decode(&*diff_buf).expect("Failed to decode WorldDiff");
        self.world_stat.apply_diff(diff);
        let actions: Vec<GameAction> = vec![];
        let actions_buff = IGameActions::encode_to_vec(&IGameActions {
            actions: actions.into_iter().map(|action| action.into()).collect(),
        })
        .into_boxed_slice();
        trace!(
            "Actions buffer size = {}",
            humansize::format_size(actions_buff.len(), humansize::BINARY)
        );
        actions_buff
    }
}
