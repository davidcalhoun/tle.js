import babel from "rollup-plugin-babel";

const outputName = "tlejs";

export default {
  input: "src/index.js",
  output: [
    {
      file: `dist/${outputName}.umd.js`,
      name: outputName,
      globals: {
        "satellite.js": "satellite"
      },
      format: "umd"
    },
    {
      file: `dist/${outputName}.esm.js`,
      format: "esm"
    }
  ],
  external: ["satellite.js"],
  plugins: [
    babel({
      exclude: "node_modules/**"
    })
  ]
};
