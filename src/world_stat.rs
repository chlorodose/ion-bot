#[derive(Debug, Clone, Default)]
pub struct WorldStat {
    tick: u64,
}
impl WorldStat {
    pub fn apply_diff(&mut self, diff: crate::proto::IWorldDiff) {
        self.tick = diff.tick;
    }
}
