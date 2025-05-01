use prost_build::Config;
use std::io::Result;
fn main() -> Result<()> {
    Config::new()
        .default_package_filename("mod")
        .out_dir("src/proto")
        .compile_protos(&["src/proto/index.proto"], &["src/proto"])?;
    Ok(())
}
