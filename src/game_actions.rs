use crate::proto::{IActionType, IGameAction};

pub struct Id(pub [u8; 12]);
impl Into<Vec<u8>> for Id {
    fn into(self) -> Vec<u8> {
        self.0.to_vec()
    }
}

pub enum GameAction {
    Destroy(Id),
    Suicide(Id),
}
impl Into<IGameAction> for GameAction {
    fn into(self) -> IGameAction {
        match self {
            GameAction::Destroy(id) => IGameAction {
                id: Some(id.into()),
                action: IActionType::Destroy as i32,
            },
            GameAction::Suicide(id) => IGameAction {
                id: Some(id.into()),
                action: IActionType::Suicide as i32,
            },
        }
    }
}
