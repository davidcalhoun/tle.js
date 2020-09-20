import babel from "rollup-plugin-babel";
import dts from "rollup-plugin-dts";

const outputName = "tlejs";

export default [
  {
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
      },
      {
        file: `dist/${outputName}.cjs`,
        format: "cjs"
      }
    ],
    external: ["satellite.js"],
    plugins: [
      babel({
        exclude: "node_modules/**"
      })
    ],
  },
  {
    input: "./src/index.d.ts",
    output: [
      { file: `dist/${outputName}.umd.d.ts`, format: 'umd' },
      { file: `dist/${outputName}.esm.d.ts`, format: 'esm' },
      { file: `dist/${outputName}.d.ts`, format: 'cjs' }
    ],
    plugins: [dts()],
  }
];
