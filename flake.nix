{
  description = "Example rust package";
  inputs = {
    nixpkgs = {
      url = "github:nixos/nixpkgs/nixos-unstable";
    };
    fenix = {
      url = "github:nix-community/fenix/main";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils = {
      url = "github:numtide/flake-utils/main";
    };
  };
  outputs =
    {
      nixpkgs,
      flake-utils,
      fenix,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        rust = fenix.packages.${system};
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodePackages_latest.nodejs
            typescript
            typescript-language-server
            rust.complete.toolchain
            wasm-bindgen-cli
            binaryen
            protobuf
            git-crypt
          ];
        };
      }
    );
}
