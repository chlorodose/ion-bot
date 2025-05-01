use wasm_bindgen::prelude::wasm_bindgen;

use log::debug;

use crate::get_cpu;

#[wasm_bindgen(js_namespace = console)]
extern "C" {
    #[wasm_bindgen]
    fn trace(msg: String);
    #[wasm_bindgen]
    fn debug(msg: String);
    #[wasm_bindgen]
    fn info(msg: String);
    #[wasm_bindgen]
    fn warn(msg: String);
    #[wasm_bindgen]
    fn error(msg: String);
    #[wasm_bindgen]
    fn fatal(msg: String);
    #[wasm_bindgen(js_name = getLogLevel)]
    fn get_log_level() -> String;
}

pub fn set_log_level() {
    let level = get_log_level().trim().to_lowercase();
    log::set_max_level(match &*level {
        "error" => log::LevelFilter::Error,
        "warn" => log::LevelFilter::Warn,
        "info" => log::LevelFilter::Info,
        "debug" => log::LevelFilter::Debug,
        "trace" => log::LevelFilter::Trace,
        "off" => log::LevelFilter::Off,
        _ => log::LevelFilter::Trace,
    });
}

#[wasm_bindgen(start)]
pub fn init() {
    struct Log;
    impl log::Log for Log {
        fn enabled(&self, _metadata: &log::Metadata<'_>) -> bool {
            true
        }
        fn flush(&self) {}
        fn log(&self, record: &log::Record<'_>) {
            let msg = format!(
                "[{}:{}] {}",
                record.file().unwrap_or_else(|| record.target()),
                record
                    .line()
                    .map_or_else(|| "[Unknown]".to_string(), |line| line.to_string()),
                record.args(),
            );
            match record.level() {
                log::Level::Error => error(msg),
                log::Level::Warn => warn(msg),
                log::Level::Info => info(msg),
                log::Level::Debug => debug(msg),
                log::Level::Trace => trace(msg),
            }
        }
    }
    std::panic::set_hook(Box::new(|info| {
        fatal(info.to_string());
    }));
    set_log_level();
    log::set_boxed_logger(Box::new(Log)).expect("Failed to set logger");
    debug!("WASM init finnsh in {} cpu", get_cpu());
}
