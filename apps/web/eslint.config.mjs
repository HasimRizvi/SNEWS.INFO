import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    files: ["src/app/**/page.tsx", "src/app/**/layout.tsx", "src/app/**/route.ts"],
    rules: {
      "react-hooks/purity": "off",
    },
  },
];

export default config;
